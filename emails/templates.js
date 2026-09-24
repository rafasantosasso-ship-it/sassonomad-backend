// Templates dos e-mails transacionais. HTML em tabelas + estilos inline
// (é o que funciona em Gmail, Outlook e Apple Mail) e sempre uma versão em
// texto puro — ajuda a não cair no spam.
//
// Paleta do site: oliva #6e7350 (cabeçalho, rodapé, botões), creme
// #f4eee1 (fundo), terracota #c1623b (só no nome da pessoa), texto #1c2321.
// O logo é um PNG servido pelo próprio site (public/email/logo-light.png):
// Gmail e Outlook não mostram SVG.

const { FRONTEND_URL } = require('../utils/config');
const { normalizeLang, siteUrl } = require('../utils/siteRoutes');

const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const OLIVE = '#6e7350';
const OLIVE_DARK = '#565a3e';
const CREAM = '#f4eee1';
const LOGO_URL = `${FRONTEND_URL}/email/logo-light.png`;

const button = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
  <tr>
    <td style="border-radius:999px;background-color:${OLIVE};">
      <a href="${href}" style="display:inline-block;padding:14px 30px;font-family:${SANS};font-size:15px;font-weight:bold;color:${CREAM};text-decoration:none;border-radius:999px;">${label}</a>
    </td>
  </tr>
</table>`;

const sectionTitle = (text) => `
<p style="margin:36px 0 14px;padding-top:20px;border-top:1px solid #e3d2aa;font-family:${SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${OLIVE};font-weight:bold;">${text}</p>`;

const linkItem = ({ href, title, text }) => `
<tr>
  <td style="padding:0 0 16px;">
    <a href="${href}" style="font-family:${SERIF};font-size:18px;color:#1c2321;text-decoration:none;font-weight:bold;">${title}</a>
    <p style="margin:4px 0 0;font-family:${SANS};font-size:14px;line-height:1.55;color:#5b6660;">${text}</p>
  </td>
</tr>`;

const linkList = (items) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  ${items.map(linkItem).join('')}
</table>`;

const HTML_LANG = { pt: 'pt-BR', it: 'it', en: 'en' };

const layout = ({
  preheader, body, footer, lang = 'pt',
}) => `<!doctype html>
<html lang="${HTML_LANG[lang] || 'pt-BR'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Sasso Nomad</title>
</head>
<body style="margin:0;padding:0;background-color:#f4eee1;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4eee1;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
        <tr>
          <td align="center" style="background-color:${OLIVE};border-radius:12px 12px 0 0;padding:28px 24px;">
            <a href="${siteUrl('home', lang)}" style="text-decoration:none;">
              <img src="${LOGO_URL}" width="190" alt="Sasso Nomad" style="display:block;width:190px;max-width:100%;height:auto;border:0;font-family:${SERIF};font-size:22px;letter-spacing:4px;color:${CREAM};text-transform:uppercase;">
            </a>
          </td>
        </tr>
        <tr>
          <td style="background-color:#ffffff;padding:36px 32px;font-family:${SANS};font-size:16px;line-height:1.65;color:#1c2321;">
            ${body}
          </td>
        </tr>
        <tr>
          <td style="background-color:${OLIVE};border-radius:0 0 12px 12px;padding:22px 32px;font-family:${SANS};font-size:12px;line-height:1.7;color:${CREAM};">
            ${footer}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

// ---------------------------------------------------------------------
// Boas-vindas: confirma o e-mail, libera a criação da conta e apresenta
// o que já existe no site (funciona como a primeira newsletter).
// O texto sai no idioma em que a pessoa se cadastrou (pt, it ou en).
// ---------------------------------------------------------------------
const firstNameOf = (name) => {
  const first = String(name).trim().split(/\s+/)[0];
  return first.charAt(0).toLocaleUpperCase('pt-BR') + first.slice(1);
};

const WELCOME_COPY = {
  pt: {
    subject: (n) => `${n}, que bom ter você na Sasso Nomad`,
    preheader: 'Confirme seu e-mail e veja o que já está te esperando no site.',
    hello: 'Oi,',
    intro: [
      'Que bom ter você por aqui.',
      'A Sasso Nomad é sobre viajar devagar: ficar tempo suficiente num lugar pra saber quanto custa o café, qual praia enche no domingo e onde dá pra trabalhar com wi-fi que presta. Tudo com números reais e rota real. Nada de roteiro patrocinado.',
    ],
    step: 'Falta só um passo: confirmar que esse e-mail é seu. Na mesma página você pode criar uma senha para salvar guias e artigos no site.',
    button: 'Confirmar meu e-mail',
    linkNote: 'O link vale por 48 horas. Se o botão não funcionar, copie e cole no navegador:',
    linkNoteText: 'Confirmar meu e-mail (o link vale por 48 horas):',
    guidesTitle: 'Guias',
    storiesTitle: 'Histórias do site',
    toolsTitle: 'Pra usar no dia a dia',
    nextTitle: 'O que vem por aí',
    next: 'Novos guias, histórias de Sardegna e da Chapada e, em breve, a comunidade aberta. A gente não vive mandando e-mail: só escreve quando tem algo que vale a pena.',
    bye: 'Até já,',
    footer: 'Você recebeu este e-mail porque se cadastrou em',
    footerIgnore: 'Se não foi você, é só ignorar: sem confirmação, não enviamos mais nada.',
    footerIgnoreText: 'Se não foi você, é só ignorar.',
    unsubscribe: 'Cancelar inscrição',
    privacy: 'Privacidade',
    guides: [
      ['guideSardegna', 'Quanto custa viver na Sardenha', 'Números reais de Cagliari, Costa Rei e do entroterra em 2026.'],
      ['guideChapada', 'Viver em Lençóis: o guia que nenhum turista tem', 'Quanto custa, de verdade, morar na Chapada Diamantina.'],
      ['guideNomadismo', 'Guia completo de nomadismo digital', 'Como ganhar mobilidade sem abrir mão da carreira. Sem fórmula mágica.'],
    ],
    stories: [
      ['articleSardegna', 'Sardegna: vilarejos de pedra e mar turquesa', 'Um roteiro lento pela costa e pelo interior, longe do óbvio.'],
      ['articleCagliari', 'Cagliari: a capital que também é riviera', 'Vida de cidade com praia a poucos minutos do centro.'],
      ['articleChapada', 'Chapada Diamantina: trilhas, poços e Lençóis', 'Como explorar o parque com calma, das vans às hospedagens locais.'],
      ['articleIreland', 'Irlanda fora do óbvio', 'Vida de nômade além do centro caótico de Dublin.'],
      ['articleNomadismo', 'Trabalhar de qualquer lugar', 'Ferramentas, fusos e rotina real de quem viaja devagar.'],
    ],
    tools: [
      ['timezones', 'Relógio de fusos horários', 'Que horas são agora nos nossos destinos, pra marcar call sem erro.'],
      ['faq', 'Perguntas frequentes', 'Visto, custo de vida, internet: as dúvidas que mais chegam.'],
    ],
  },
  it: {
    subject: (n) => `${n}, che bello averti su Sasso Nomad`,
    preheader: 'Conferma la tua email e scopri cosa ti aspetta già sul sito.',
    hello: 'Ciao,',
    intro: [
      'Che bello averti qui.',
      'Sasso Nomad parla di viaggiare lentamente: restare in un posto abbastanza a lungo da sapere quanto costa il caffè, quale spiaggia si riempie la domenica e dove si lavora con un wi-fi che funziona davvero. Tutto con numeri reali e percorsi veri. Niente itinerari sponsorizzati.',
    ],
    step: 'Manca solo un passo: confermare che questa email è tua. Nella stessa pagina puoi creare una password per salvare guide e articoli sul sito.',
    button: 'Conferma la mia email',
    linkNote: 'Il link vale 48 ore. Se il pulsante non funziona, copia e incolla nel browser:',
    linkNoteText: 'Conferma la mia email (il link vale 48 ore):',
    guidesTitle: 'Guide',
    storiesTitle: 'Storie dal sito',
    toolsTitle: 'Da usare ogni giorno',
    nextTitle: 'Cosa arriva',
    next: 'Nuove guide, storie dalla Sardegna e dalla Chapada e, a breve, la community aperta. Non riempiamo la tua casella: scriviamo solo quando c\'è qualcosa che vale davvero la pena.',
    bye: 'A presto,',
    footer: 'Hai ricevuto questa email perché ti sei iscritto su',
    footerIgnore: 'Se non sei stato tu, ignorala pure: senza conferma non ti scriveremo più.',
    footerIgnoreText: 'Se non sei stato tu, ignorala pure.',
    unsubscribe: 'Annulla iscrizione',
    privacy: 'Privacy',
    guides: [
      ['guideSardegna', 'Quanto costa vivere in Sardegna', 'Numeri reali da Cagliari, Costa Rei e dall\'entroterra nel 2026.'],
      ['guideChapada', 'Vivere a Lençóis: la guida che nessun turista ha', 'Quanto costa davvero vivere nella Chapada Diamantina, in Brasile.'],
      ['guideNomadismo', 'Guida completa al nomadismo digitale', 'Come conquistare libertà di movimento senza rinunciare alla carriera. Senza formule magiche.'],
    ],
    stories: [
      ['articleSardegna', 'Sardegna: borghi di pietra e mare turchese', 'Un itinerario lento tra costa ed entroterra, lontano dal solito.'],
      ['articleCagliari', 'Cagliari: la capitale che è anche riviera', 'Vita da città con il mare a pochi minuti dal centro.'],
      ['articleChapada', 'Chapada Diamantina: sentieri, pozze e Lençóis', 'Come esplorare il parco con calma, dai van alle pousadas di famiglia.'],
      ['articleIreland', 'Irlanda fuori dai soliti giri', 'Vita da nomade oltre il caos del centro di Dublino.'],
      ['articleNomadismo', 'Lavorare da ovunque', 'Strumenti, fusi orari e la vera routine di chi viaggia lentamente.'],
    ],
    tools: [
      ['timezones', 'Orologio dei fusi orari', 'Che ore sono adesso nelle nostre destinazioni, per fissare le call senza errori.'],
      ['faq', 'Domande frequenti', 'Visti, costo della vita, internet: i dubbi che arrivano più spesso.'],
    ],
  },
  en: {
    subject: (n) => `${n}, great to have you at Sasso Nomad`,
    preheader: 'Confirm your email and see what\'s already waiting for you on the site.',
    hello: 'Hi,',
    intro: [
      'Great to have you here.',
      'Sasso Nomad is about travelling slowly: staying long enough in a place to know what a coffee costs, which beach fills up on Sundays and where you can work on Wi-Fi that actually holds up. All with real numbers and real routes. No sponsored itineraries.',
    ],
    step: 'Just one step left: confirm this email is yours. On the same page you can create a password to save guides and articles on the site.',
    button: 'Confirm my email',
    linkNote: 'The link is valid for 48 hours. If the button doesn\'t work, copy and paste this into your browser:',
    linkNoteText: 'Confirm my email (the link is valid for 48 hours):',
    guidesTitle: 'Guides',
    storiesTitle: 'Stories from the site',
    toolsTitle: 'For everyday use',
    nextTitle: 'What\'s coming',
    next: 'New guides, stories from Sardinia and the Chapada and, soon, the open community. We don\'t flood your inbox: we only write when there\'s something truly worth it.',
    bye: 'Talk soon,',
    footer: 'You received this email because you signed up at',
    footerIgnore: 'If it wasn\'t you, just ignore it: without confirmation, we won\'t send anything else.',
    footerIgnoreText: 'If it wasn\'t you, just ignore it.',
    unsubscribe: 'Unsubscribe',
    privacy: 'Privacy',
    guides: [
      ['guideSardegna', 'The cost of living in Sardinia', 'Real numbers from Cagliari, Costa Rei and the inland villages in 2026.'],
      ['guideChapada', 'Living in Lençóis: the guide no tourist has', 'What it really costs to live in Chapada Diamantina, Brazil.'],
      ['guideNomadismo', 'The complete digital nomad guide', 'How to gain freedom of movement without giving up your career. No magic formula.'],
    ],
    stories: [
      ['articleSardegna', 'Sardinia: stone villages and turquoise sea', 'A slow route along the coast and through the interior, off the obvious path.'],
      ['articleCagliari', 'Cagliari: the capital that is also a riviera', 'City life with the beach a few minutes from the centre.'],
      ['articleChapada', 'Chapada Diamantina: trails, pools and Lençóis', 'How to explore the park slowly, from shared vans to family guesthouses.'],
      ['articleIreland', 'Ireland off the beaten path', 'Nomad life beyond chaotic central Dublin.'],
      ['articleNomadismo', 'Work from anywhere', 'Tools, time zones and the real routine of slow travellers.'],
    ],
    tools: [
      ['timezones', 'Time zone clock', 'What time it is now in our destinations, so you never miss a call.'],
      ['faq', 'FAQ', 'Visas, cost of living, internet: the questions we get most.'],
    ],
  },
};

module.exports.welcomeEmail = ({
  name, confirmUrl, unsubscribeUrl, lang: rawLang,
}) => {
  const lang = normalizeLang(rawLang);
  const c = WELCOME_COPY[lang];
  const firstName = firstNameOf(name);
  const safeName = escapeHtml(firstName);
  const home = siteUrl('home', lang);
  const toItems = (rows) => rows.map(([key, title, text]) => ({
    href: siteUrl(key, lang), title, text,
  }));

  const guides = toItems(c.guides);
  const stories = toItems(c.stories);
  const tools = toItems(c.tools);

  const subject = c.subject(firstName);
  const { preheader } = c;

  const body = `
<p style="margin:0 0 18px;font-family:${SERIF};font-size:26px;line-height:1.3;color:#1c2321;">${c.hello} <span style="color:#c1623b;font-style:italic;">${safeName}</span>.</p>
<p style="margin:0 0 16px;">${c.intro[0]}</p>
<p style="margin:0 0 16px;">${c.intro[1]}</p>
<p style="margin:0;">${c.step}</p>
${button(confirmUrl, c.button)}
<p style="margin:0;font-size:13px;color:#5b6660;">${c.linkNote}<br><a href="${confirmUrl}" style="color:${OLIVE_DARK};word-break:break-all;">${confirmUrl}</a></p>

${sectionTitle(c.guidesTitle)}
${linkList(guides)}

${sectionTitle(c.storiesTitle)}
${linkList(stories)}

${sectionTitle(c.toolsTitle)}
${linkList(tools)}

${sectionTitle(c.nextTitle)}
<p style="margin:0 0 16px;">${c.next}</p>
<p style="margin:28px 0 0;">${c.bye}<br><span style="font-family:${SERIF};font-size:18px;">Sasso Nomad</span></p>`;

  const footer = `
${c.footer} <a href="${home}" style="color:#f4eee1;">sassonomad.com</a>.
${c.footerIgnore}<br>
<a href="${unsubscribeUrl}" style="color:#f4eee1;">${c.unsubscribe}</a> ·
<a href="${siteUrl('privacy', lang)}" style="color:#f4eee1;">${c.privacy}</a>`;

  const listText = (items) => items.map((i) => `- ${i.title}\n  ${i.href}`).join('\n');

  const text = `${c.hello} ${firstName}.

${c.intro[0]}

${c.intro[1]}

${c.step}

${c.linkNoteText}
${confirmUrl}

${c.guidesTitle.toUpperCase()}
${listText(guides)}

${c.storiesTitle.toUpperCase()}
${listText(stories)}

${c.toolsTitle.toUpperCase()}
${listText(tools)}

${c.nextTitle.toUpperCase()}
${c.next}

${c.bye}
Sasso Nomad

--
${c.footer} sassonomad.com. ${c.footerIgnoreText}
${c.unsubscribe}: ${unsubscribeUrl}
${c.privacy}: ${siteUrl('privacy', lang)}
`;

  return {
    subject,
    html: layout({
      preheader, body, footer, lang,
    }),
    text,
  };
};

// ---------------------------------------------------------------------
// Esqueci minha senha — no idioma da página em que a pessoa pediu.
// ---------------------------------------------------------------------
const RESET_COPY = {
  pt: {
    subject: 'Crie uma nova senha na Sasso Nomad',
    preheader: 'O link vale por 1 hora.',
    hello: 'Oi,',
    intro: 'Alguém pediu para criar uma nova senha para a sua conta na Sasso Nomad. Se foi você, é só clicar abaixo.',
    introText: 'Alguém pediu para criar uma nova senha para a sua conta na Sasso Nomad. Se foi você, abra o link abaixo (vale por 1 hora e só funciona uma vez):',
    button: 'Criar nova senha',
    linkNote: 'O link vale por 1 hora e só funciona uma vez. Se o botão não funcionar, copie e cole no navegador:',
    notYou: 'Não foi você? Pode ignorar este e-mail: sua senha continua a mesma.',
    footer: 'E-mail automático da conta em',
  },
  it: {
    subject: 'Crea una nuova password su Sasso Nomad',
    preheader: 'Il link vale 1 ora.',
    hello: 'Ciao,',
    intro: 'Qualcuno ha chiesto di creare una nuova password per il tuo account Sasso Nomad. Se sei stato tu, clicca qui sotto.',
    introText: 'Qualcuno ha chiesto di creare una nuova password per il tuo account Sasso Nomad. Se sei stato tu, apri il link qui sotto (vale 1 ora e funziona una sola volta):',
    button: 'Crea una nuova password',
    linkNote: 'Il link vale 1 ora e funziona una sola volta. Se il pulsante non funziona, copia e incolla nel browser:',
    notYou: 'Non sei stato tu? Puoi ignorare questa email: la tua password resta la stessa.',
    footer: 'Email automatica del tuo account su',
  },
  en: {
    subject: 'Create a new password for Sasso Nomad',
    preheader: 'The link is valid for 1 hour.',
    hello: 'Hi,',
    intro: 'Someone asked to create a new password for your Sasso Nomad account. If it was you, just click below.',
    introText: 'Someone asked to create a new password for your Sasso Nomad account. If it was you, open the link below (valid for 1 hour, works only once):',
    button: 'Create new password',
    linkNote: 'The link is valid for 1 hour and only works once. If the button doesn\'t work, copy and paste this into your browser:',
    notYou: 'Wasn\'t you? You can ignore this email: your password stays the same.',
    footer: 'Automatic account email from',
  },
};

module.exports.passwordResetEmail = ({ name, resetUrl, lang: rawLang }) => {
  const lang = normalizeLang(rawLang);
  const c = RESET_COPY[lang];
  const firstName = firstNameOf(name);
  const safeName = escapeHtml(firstName);
  const { subject, preheader } = c;

  const body = `
<p style="margin:0 0 18px;font-family:${SERIF};font-size:24px;line-height:1.3;">${c.hello} <span style="color:#c1623b;font-style:italic;">${safeName}</span>.</p>
<p style="margin:0;">${c.intro}</p>
${button(resetUrl, c.button)}
<p style="margin:0 0 16px;font-size:13px;color:#5b6660;">${c.linkNote}<br><a href="${resetUrl}" style="color:${OLIVE_DARK};word-break:break-all;">${resetUrl}</a></p>
<p style="margin:0;font-size:14px;color:#5b6660;">${c.notYou}</p>`;

  const footer = `${c.footer} <a href="${siteUrl('home', lang)}" style="color:#f4eee1;">sassonomad.com</a>.`;

  const text = `${c.hello} ${firstName}.

${c.introText}

${resetUrl}

${c.notYou}

Sasso Nomad
`;

  return {
    subject,
    html: layout({
      preheader, body, footer, lang,
    }),
    text,
  };
};

module.exports.escapeHtml = escapeHtml;
