const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Subscriber = require('../models/subscriber');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const { sendEmail } = require('../utils/mailer');
const { createToken, hashToken, createUnsubscribeToken } = require('../utils/tokens');
const { welcomeEmail, escapeHtml } = require('../emails/templates');
const {
  JWT_SECRET, FRONTEND_URL, API_URL, EMAIL_REPLY_TO,
} = require('../utils/config');
const MESSAGES = require('../utils/messages');
const { normalizeLang, siteUrl } = require('../utils/siteRoutes');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';
const CONFIRM_LINK_TTL_MS = 48 * 60 * 60 * 1000; // 48h
// Evita que alguém use o formulário pra encher a caixa de outra pessoa:
// o mesmo e-mail só recebe uma nova boas-vindas a cada 10 minutos.
const RESEND_COOLDOWN_MS = 10 * 60 * 1000;

const unsubscribeUrlFor = (token) => `${API_URL}/unsubscribe?token=${token}`;

// Gera um novo link de confirmação e envia o e-mail de boas-vindas.
// Só marca lastEmailSentAt se o envio deu certo.
const sendWelcome = async (subscriber) => {
  const { token, hash } = createToken();
  const unsubscribeToken = subscriber.unsubscribeToken || createUnsubscribeToken();

  Object.assign(subscriber, {
    confirmTokenHash: hash,
    confirmTokenExpires: new Date(Date.now() + CONFIRM_LINK_TTL_MS),
    unsubscribeToken,
  });
  await subscriber.save();

  const unsubscribeUrl = unsubscribeUrlFor(unsubscribeToken);
  // E-mail e link de confirmação no idioma em que a pessoa se cadastrou.
  const email = welcomeEmail({
    name: subscriber.name,
    confirmUrl: `${siteUrl('welcome', subscriber.lang)}?token=${token}`,
    unsubscribeUrl,
    lang: subscriber.lang,
  });

  await sendEmail({
    to: subscriber.email,
    ...email,
    headers: {
      'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:${EMAIL_REPLY_TO}?subject=unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });

  subscriber.set('lastEmailSentAt', new Date());
  await subscriber.save();
};

// POST /subscribe — popup "Participar da Comunidade".
// A resposta é sempre a mesma (novo, repetido, já confirmado): assim o
// formulário não revela quem já está na lista.
module.exports.subscribe = async (req, res, next) => {
  const {
    name, email, lang, source, website,
  } = req.body;

  // Honeypot: campo invisível que só robô preenche. Finge sucesso.
  if (website) {
    return res.send({ message: MESSAGES.SUBSCRIBE_OK });
  }

  try {
    let subscriber = await Subscriber.findOne({ email })
      .select('+unsubscribeToken');

    if (!subscriber) {
      subscriber = new Subscriber({
        name, email, lang, source, consentAt: new Date(),
      });
    } else {
      const lastSent = subscriber.lastEmailSentAt?.getTime() || 0;
      if (Date.now() - lastSent < RESEND_COOLDOWN_MS) {
        return res.send({ message: MESSAGES.SUBSCRIBE_OK });
      }
      if (subscriber.status === 'unsubscribed') {
        // Voltou a se inscrever: novo consentimento, volta pra "pending".
        Object.assign(subscriber, {
          status: 'pending',
          consentAt: new Date(),
          unsubscribedAt: undefined,
        });
      }
      subscriber.name = name;
      subscriber.lang = lang || subscriber.lang;
    }

    await sendWelcome(subscriber);
    return res.send({ message: MESSAGES.SUBSCRIBE_OK });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError(MESSAGES.INVALID_SUBSCRIBER_DATA));
    }
    if (err.code === 11000) {
      // Duas requisições simultâneas com o mesmo e-mail: a primeira venceu.
      return res.send({ message: MESSAGES.SUBSCRIBE_OK });
    }
    if (err.isEmailError) {
      console.error('Falha ao enviar boas-vindas:', err.message);
      const sendError = new Error(MESSAGES.EMAIL_SEND_FAILED);
      sendError.statusCode = 502;
      return next(sendError);
    }
    return next(err);
  }
};

const findByValidConfirmToken = (token) => Subscriber.findOne({
  confirmTokenHash: hashToken(token),
  confirmTokenExpires: { $gt: new Date() },
});

// POST /subscribe/confirm — página /bem-vindo abre com ?token=...
// Confirma o e-mail e diz ao front se a pessoa já tem conta.
module.exports.confirm = async (req, res, next) => {
  try {
    const subscriber = await findByValidConfirmToken(req.body.token);
    if (!subscriber) {
      return next(new BadRequestError(MESSAGES.INVALID_OR_EXPIRED_LINK));
    }

    if (subscriber.status !== 'confirmed') {
      subscriber.status = 'confirmed';
      subscriber.confirmedAt = subscriber.confirmedAt || new Date();
      subscriber.unsubscribedAt = undefined;
      await subscriber.save();
    }

    const hasAccount = Boolean(await User.exists({ email: subscriber.email }));

    return res.send({ name: subscriber.name, email: subscriber.email, hasAccount });
  } catch (err) {
    return next(err);
  }
};

// POST /subscribe/create-account — mesma página, depois de confirmar:
// a pessoa escolhe uma senha e já entra logada (devolve o JWT).
module.exports.createAccount = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const subscriber = await findByValidConfirmToken(token);
    if (!subscriber) {
      return next(new BadRequestError(MESSAGES.INVALID_OR_EXPIRED_LINK));
    }

    if (await User.exists({ email: subscriber.email })) {
      return next(new ConflictError(MESSAGES.ACCOUNT_ALREADY_EXISTS));
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name: subscriber.name,
      email: subscriber.email,
      password: hash,
    });

    // Link usado: invalida pra não servir de novo.
    Object.assign(subscriber, {
      status: 'confirmed',
      confirmedAt: subscriber.confirmedAt || new Date(),
      confirmTokenHash: undefined,
      confirmTokenExpires: undefined,
    });
    await subscriber.save();

    const jwtToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return res.status(201).send({ token: jwtToken });
  } catch (err) {
    if (err.code === 11000) {
      return next(new ConflictError(MESSAGES.ACCOUNT_ALREADY_EXISTS));
    }
    return next(err);
  }
};

// Textos da página de descadastro, no idioma do inscrito.
const UNSUBSCRIBE_COPY = {
  pt: {
    htmlLang: 'pt-BR',
    invalidTitle: 'Link inválido',
    invalidText: 'Não encontramos essa inscrição. Se quiser sair da lista, responda qualquer e-mail nosso com "cancelar".',
    invalidShort: 'Não encontramos essa inscrição.',
    doneTitle: 'Tudo certo',
    alreadyText: 'Esse e-mail já não recebe mais nossas mensagens.',
    askTitle: 'Cancelar inscrição?',
    askText: (email) => `Você não vai mais receber os e-mails da Sasso Nomad em <strong>${email}</strong>. Se tiver conta no site, ela continua funcionando.`,
    button: 'Cancelar inscrição',
    cancelledTitle: 'Inscrição cancelada',
    cancelledText: 'Pronto: você não vai mais receber nossos e-mails. Mudou de ideia? É só se cadastrar de novo no site.',
    back: 'Voltar para sassonomad.com',
  },
  it: {
    htmlLang: 'it',
    invalidTitle: 'Link non valido',
    invalidText: 'Non abbiamo trovato questa iscrizione. Se vuoi uscire dalla lista, rispondi a una qualsiasi nostra email con "annulla".',
    invalidShort: 'Non abbiamo trovato questa iscrizione.',
    doneTitle: 'Tutto a posto',
    alreadyText: 'Questa email non riceve più i nostri messaggi.',
    askTitle: 'Annullare l\'iscrizione?',
    askText: (email) => `Non riceverai più le email di Sasso Nomad su <strong>${email}</strong>. Se hai un account sul sito, continuerà a funzionare.`,
    button: 'Annulla iscrizione',
    cancelledTitle: 'Iscrizione annullata',
    cancelledText: 'Fatto: non riceverai più le nostre email. Hai cambiato idea? Basta iscriversi di nuovo sul sito.',
    back: 'Torna a sassonomad.com',
  },
  en: {
    htmlLang: 'en',
    invalidTitle: 'Invalid link',
    invalidText: 'We couldn\'t find this subscription. If you want to leave the list, reply to any of our emails with "unsubscribe".',
    invalidShort: 'We couldn\'t find this subscription.',
    doneTitle: 'All set',
    alreadyText: 'This email no longer receives our messages.',
    askTitle: 'Unsubscribe?',
    askText: (email) => `You will no longer receive Sasso Nomad emails at <strong>${email}</strong>. If you have an account on the site, it will keep working.`,
    button: 'Unsubscribe',
    cancelledTitle: 'Unsubscribed',
    cancelledText: 'Done: you won\'t receive our emails anymore. Changed your mind? Just sign up again on the site.',
    back: 'Back to sassonomad.com',
  },
};

const copyFor = (subscriber) => UNSUBSCRIBE_COPY[normalizeLang(subscriber && subscriber.lang)];

// Página HTML simples do descadastro (servida pela própria API).
const unsubscribePage = (title, text, form = '', c = UNSUBSCRIBE_COPY.pt, lang = 'pt') => `<!doctype html>
<html lang="${c.htmlLang}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Sasso Nomad</title></head>
<body style="margin:0;background:#f4eee1;font-family:Helvetica,Arial,sans-serif;color:#1c2321;">
<main style="max-width:480px;margin:10vh auto;padding:0 16px;">
<div style="background:#6e7350;border-radius:12px 12px 0 0;padding:26px 24px;text-align:center;">
<a href="${siteUrl('home', lang)}"><img src="${FRONTEND_URL}/email/logo-light.png" width="180" alt="Sasso Nomad" style="display:inline-block;width:180px;max-width:100%;height:auto;border:0;color:#f4eee1;"></a>
</div>
<div style="background:#fff;border-radius:0 0 12px 12px;padding:32px 28px;">
<h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">${title}</h1>
<p style="line-height:1.6;margin:0 0 20px;color:#5b6660;">${text}</p>
${form}
<p style="margin:24px 0 0;"><a href="${siteUrl('home', lang)}" style="color:#565a3e;">${c.back}</a></p>
</div>
</main></body></html>`;

// A página vem da API (api.sassonomad.com), mas o logo está no site: libera
// só essa origem para imagens, mantendo o resto da política do Helmet.
const sendPage = (res, html, status = 200) => res
  .status(status)
  .set(
    'Content-Security-Policy',
    `default-src 'self'; img-src 'self' ${FRONTEND_URL}; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'`,
  )
  .send(html);

// GET /unsubscribe?token=... — link do rodapé do e-mail.
// Não descadastra direto no GET: filtros de e-mail corporativo "clicam"
// nos links pra checar vírus e descadastrariam a pessoa sem querer. Mostra
// um botão que faz o POST.
module.exports.unsubscribeForm = async (req, res, next) => {
  const token = String(req.query.token || '');
  try {
    const subscriber = token && await Subscriber.findOne({ unsubscribeToken: token });
    if (!subscriber) {
      const c = UNSUBSCRIBE_COPY.pt;
      return sendPage(res, unsubscribePage(c.invalidTitle, c.invalidText), 404);
    }
    const c = copyFor(subscriber);
    const lang = normalizeLang(subscriber.lang);
    if (subscriber.status === 'unsubscribed') {
      return sendPage(res, unsubscribePage(c.doneTitle, c.alreadyText, '', c, lang));
    }
    const form = `<form method="post" action="/unsubscribe?token=${escapeHtml(token)}">
<button type="submit" style="padding:12px 26px;border:none;border-radius:999px;background:#6e7350;color:#f4eee1;font-weight:bold;font-size:15px;cursor:pointer;">${c.button}</button>
</form>`;
    return sendPage(res, unsubscribePage(
      c.askTitle,
      c.askText(escapeHtml(subscriber.email)),
      form,
      c,
      lang,
    ));
  } catch (err) {
    return next(err);
  }
};

// POST /unsubscribe?token=... — botão da página acima e também o
// "cancelar inscrição" com um clique do Gmail/Apple Mail (List-Unsubscribe-Post).
module.exports.unsubscribe = async (req, res, next) => {
  const token = String(req.query.token || '');
  try {
    const subscriber = token && await Subscriber.findOne({ unsubscribeToken: token });
    if (subscriber && subscriber.status !== 'unsubscribed') {
      Object.assign(subscriber, {
        status: 'unsubscribed',
        unsubscribedAt: new Date(),
        confirmTokenHash: undefined,
        confirmTokenExpires: undefined,
      });
      await subscriber.save();
    }
    if (!subscriber) {
      const c = UNSUBSCRIBE_COPY.pt;
      return sendPage(res, unsubscribePage(c.invalidTitle, c.invalidShort), 404);
    }
    const c = copyFor(subscriber);
    return sendPage(res, unsubscribePage(
      c.cancelledTitle,
      c.cancelledText,
      '',
      c,
      normalizeLang(subscriber.lang),
    ));
  } catch (err) {
    return next(err);
  }
};
