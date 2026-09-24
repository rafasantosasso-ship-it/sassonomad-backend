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
  const email = welcomeEmail({
    name: subscriber.name,
    confirmUrl: `${FRONTEND_URL}/bem-vindo?token=${token}`,
    unsubscribeUrl,
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

// Página HTML simples do descadastro (servida pela própria API).
const unsubscribePage = (title, text, form = '') => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Sasso Nomad</title></head>
<body style="margin:0;background:#f4eee1;font-family:Helvetica,Arial,sans-serif;color:#1c2321;">
<main style="max-width:480px;margin:12vh auto;padding:36px 28px;background:#fff;border-radius:12px;">
<p style="margin:0 0 20px;font-family:Georgia,serif;letter-spacing:4px;text-transform:uppercase;">Sasso <span style="color:#c1623b;">&#9650;</span> Nomad</p>
<h1 style="font-family:Georgia,serif;font-size:24px;margin:0 0 12px;">${title}</h1>
<p style="line-height:1.6;margin:0 0 20px;color:#5b6660;">${text}</p>
${form}
<p style="margin:24px 0 0;"><a href="${FRONTEND_URL}" style="color:#924a2d;">Voltar para sassonomad.com</a></p>
</main></body></html>`;

// GET /unsubscribe?token=... — link do rodapé do e-mail.
// Não descadastra direto no GET: filtros de e-mail corporativo "clicam"
// nos links pra checar vírus e descadastrariam a pessoa sem querer. Mostra
// um botão que faz o POST.
module.exports.unsubscribeForm = async (req, res, next) => {
  const token = String(req.query.token || '');
  try {
    const subscriber = token && await Subscriber.findOne({ unsubscribeToken: token });
    if (!subscriber) {
      return res.status(404).send(unsubscribePage(
        'Link inválido',
        'Não encontramos essa inscrição. Se quiser sair da lista, responda qualquer e-mail nosso com "cancelar".',
      ));
    }
    if (subscriber.status === 'unsubscribed') {
      return res.send(unsubscribePage('Tudo certo', 'Esse e-mail já não recebe mais nossas mensagens.'));
    }
    const form = `<form method="post" action="/unsubscribe?token=${escapeHtml(token)}">
<button type="submit" style="padding:12px 26px;border:none;border-radius:999px;background:#c1623b;color:#1c2321;font-weight:bold;font-size:15px;cursor:pointer;">Cancelar inscrição</button>
</form>`;
    return res.send(unsubscribePage(
      'Cancelar inscrição?',
      `Você não vai mais receber os e-mails da Sasso Nomad em <strong>${escapeHtml(subscriber.email)}</strong>. Se tiver conta no site, ela continua funcionando.`,
      form,
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
      return res.status(404).send(unsubscribePage('Link inválido', 'Não encontramos essa inscrição.'));
    }
    return res.send(unsubscribePage(
      'Inscrição cancelada',
      'Pronto: você não vai mais receber nossos e-mails. Mudou de ideia? É só se cadastrar de novo no site.',
    ));
  } catch (err) {
    return next(err);
  }
};
