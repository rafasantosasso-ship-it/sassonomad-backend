// Templates dos e-mails transacionais. HTML em tabelas + estilos inline
// (é o que funciona em Gmail, Outlook e Apple Mail) e sempre uma versão em
// texto puro — ajuda a não cair no spam.
//
// Paleta do site: oliva #6e7350 (cabeçalho, rodapé, botões), creme
// #f4eee1 (fundo), terracota #c1623b (só no nome da pessoa), texto #1c2321.
// O logo é um PNG servido pelo próprio site (public/email/logo-light.png):
// Gmail e Outlook não mostram SVG.

const { FRONTEND_URL } = require('../utils/config');

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

const layout = ({ preheader, body, footer }) => `<!doctype html>
<html lang="pt-BR">
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
            <a href="${FRONTEND_URL}" style="text-decoration:none;">
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
// ---------------------------------------------------------------------
const firstNameOf = (name) => {
  const first = String(name).trim().split(/\s+/)[0];
  return first.charAt(0).toLocaleUpperCase('pt-BR') + first.slice(1);
};

module.exports.welcomeEmail = ({ name, confirmUrl, unsubscribeUrl }) => {
  const firstName = firstNameOf(name);
  const safeName = escapeHtml(firstName);
  const site = FRONTEND_URL;

  const guides = [
    {
      href: `${site}/guias/sardegna`,
      title: 'Quanto custa viver na Sardenha',
      text: 'Números reais de Cagliari, Costa Rei e do entroterra em 2026.',
    },
    {
      href: `${site}/guias/chapada`,
      title: 'Viver em Lençóis: o guia que nenhum turista tem',
      text: 'Quanto custa, de verdade, morar na Chapada Diamantina.',
    },
    {
      href: `${site}/guias/nomadismo`,
      title: 'Guia completo de nomadismo digital',
      text: 'Como ganhar mobilidade sem abrir mão da carreira. Sem fórmula mágica.',
    },
  ];

  const stories = [
    {
      href: `${site}/sardegna/vilarejos-de-pedra-e-mar-turquesa`,
      title: 'Sardegna: vilarejos de pedra e mar turquesa',
      text: 'Um roteiro lento pela costa e pelo interior, longe do óbvio.',
    },
    {
      href: `${site}/sardegna/cagliari-capital-que-tambem-e-riviera`,
      title: 'Cagliari: a capital que também é riviera',
      text: 'Vida de cidade com praia a poucos minutos do centro.',
    },
    {
      href: `${site}/chapada-diamantina/trilhas-pocos-e-lencois`,
      title: 'Chapada Diamantina: trilhas, poços e Lençóis',
      text: 'Como explorar o parque com calma, das vans às hospedagens locais.',
    },
    {
      href: `${site}/irlanda/vida-de-nomade-alem-do-centro-caotico-de-dublin`,
      title: 'Irlanda fora do óbvio',
      text: 'Vida de nômade além do centro caótico de Dublin.',
    },
    {
      href: `${site}/nomadismo-digital/trabalhar-de-qualquer-lugar`,
      title: 'Trabalhar de qualquer lugar',
      text: 'Ferramentas, fusos e rotina real de quem viaja devagar.',
    },
  ];

  const tools = [
    {
      href: `${site}/fusos`,
      title: 'Relógio de fusos horários',
      text: 'Que horas são agora nos nossos destinos, pra marcar call sem erro.',
    },
    {
      href: `${site}/perguntas-frequentes`,
      title: 'Perguntas frequentes',
      text: 'Visto, custo de vida, internet: as dúvidas que mais chegam.',
    },
  ];

  const subject = `${firstName}, que bom ter você na Sasso Nomad`;
  const preheader = 'Confirme seu e-mail e veja o que já está te esperando no site.';

  const body = `
<p style="margin:0 0 18px;font-family:${SERIF};font-size:26px;line-height:1.3;color:#1c2321;">Oi, <span style="color:#c1623b;font-style:italic;">${safeName}</span>.</p>
<p style="margin:0 0 16px;">Que bom ter você por aqui.</p>
<p style="margin:0 0 16px;">A Sasso Nomad é sobre viajar devagar: ficar tempo suficiente num lugar pra saber quanto custa o café, qual praia enche no domingo e onde dá pra trabalhar com wi-fi que presta. Tudo com números reais e rota real. Nada de roteiro patrocinado.</p>
<p style="margin:0;">Falta só um passo: confirmar que esse e-mail é seu. Na mesma página você pode criar uma senha para salvar guias e artigos no site.</p>
${button(confirmUrl, 'Confirmar meu e-mail')}
<p style="margin:0;font-size:13px;color:#5b6660;">O link vale por 48 horas. Se o botão não funcionar, copie e cole no navegador:<br><a href="${confirmUrl}" style="color:${OLIVE_DARK};word-break:break-all;">${confirmUrl}</a></p>

${sectionTitle('Guias')}
${linkList(guides)}

${sectionTitle('Histórias do site')}
${linkList(stories)}

${sectionTitle('Pra usar no dia a dia')}
${linkList(tools)}

${sectionTitle('O que vem por aí')}
<p style="margin:0 0 16px;">Novos guias, histórias de Sardegna e da Chapada e, em breve, a comunidade aberta. A gente não vive mandando e-mail: só escreve quando tem algo que vale a pena.</p>
<p style="margin:28px 0 0;">Até já,<br><span style="font-family:${SERIF};font-size:18px;">Sasso Nomad</span></p>`;

  const footer = `
Você recebeu este e-mail porque se cadastrou em <a href="${site}" style="color:#f4eee1;">sassonomad.com</a>.
Se não foi você, é só ignorar: sem confirmação, não enviamos mais nada.<br>
<a href="${unsubscribeUrl}" style="color:#f4eee1;">Cancelar inscrição</a> ·
<a href="${site}/privacidade" style="color:#f4eee1;">Privacidade</a>`;

  const listText = (items) => items.map((i) => `- ${i.title}\n  ${i.href}`).join('\n');

  const text = `Oi, ${firstName}.

Que bom ter você por aqui.

A Sasso Nomad é sobre viajar devagar: ficar tempo suficiente num lugar pra saber quanto custa o café, qual praia enche no domingo e onde dá pra trabalhar com wi-fi que presta. Tudo com números reais e rota real. Nada de roteiro patrocinado.

Falta só um passo: confirmar que esse e-mail é seu. Na mesma página você pode criar uma senha para salvar guias e artigos no site.

Confirmar meu e-mail (o link vale por 48 horas):
${confirmUrl}

GUIAS
${listText(guides)}

HISTÓRIAS DO SITE
${listText(stories)}

PRA USAR NO DIA A DIA
${listText(tools)}

O QUE VEM POR AÍ
Novos guias, histórias de Sardegna e da Chapada e, em breve, a comunidade aberta. A gente não vive mandando e-mail: só escreve quando tem algo que vale a pena.

Até já,
Sasso Nomad

--
Você recebeu este e-mail porque se cadastrou em sassonomad.com. Se não foi você, é só ignorar.
Cancelar inscrição: ${unsubscribeUrl}
Privacidade: ${site}/privacidade
`;

  return {
    subject,
    html: layout({ preheader, body, footer }),
    text,
  };
};

// ---------------------------------------------------------------------
// Esqueci minha senha
// ---------------------------------------------------------------------
module.exports.passwordResetEmail = ({ name, resetUrl }) => {
  const firstName = firstNameOf(name);
  const safeName = escapeHtml(firstName);
  const subject = 'Crie uma nova senha na Sasso Nomad';
  const preheader = 'O link vale por 1 hora.';

  const body = `
<p style="margin:0 0 18px;font-family:${SERIF};font-size:24px;line-height:1.3;">Oi, <span style="color:#c1623b;font-style:italic;">${safeName}</span>.</p>
<p style="margin:0;">Alguém pediu para criar uma nova senha para a sua conta na Sasso Nomad. Se foi você, é só clicar abaixo.</p>
${button(resetUrl, 'Criar nova senha')}
<p style="margin:0 0 16px;font-size:13px;color:#5b6660;">O link vale por 1 hora e só funciona uma vez. Se o botão não funcionar, copie e cole no navegador:<br><a href="${resetUrl}" style="color:${OLIVE_DARK};word-break:break-all;">${resetUrl}</a></p>
<p style="margin:0;font-size:14px;color:#5b6660;">Não foi você? Pode ignorar este e-mail: sua senha continua a mesma.</p>`;

  const footer = `E-mail automático da conta em <a href="${FRONTEND_URL}" style="color:#f4eee1;">sassonomad.com</a>.`;

  const text = `Oi, ${firstName}.

Alguém pediu para criar uma nova senha para a sua conta na Sasso Nomad. Se foi você, abra o link abaixo (vale por 1 hora e só funciona uma vez):

${resetUrl}

Não foi você? Pode ignorar este e-mail: sua senha continua a mesma.

Sasso Nomad
`;

  return {
    subject,
    html: layout({ preheader, body, footer }),
    text,
  };
};

module.exports.escapeHtml = escapeHtml;
