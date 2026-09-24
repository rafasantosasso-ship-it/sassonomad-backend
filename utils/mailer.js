const {
  RESEND_API_KEY, EMAIL_FROM, EMAIL_REPLY_TO, IS_PRODUCTION,
} = require('./config');

const RESEND_URL = 'https://api.resend.com/emails';

// Erro próprio do envio de e-mail — os controllers reconhecem pelo
// isEmailError e respondem 502 com uma mensagem amigável.
class EmailError extends Error {
  constructor(message) {
    super(message);
    this.isEmailError = true;
  }
}

// Envia um e-mail pela API do Resend (https://resend.com/docs/api-reference).
// Em desenvolvimento, sem RESEND_API_KEY, o e-mail não sai: o assunto e o
// texto aparecem no terminal — dá pra copiar o link e testar o fluxo todo.
module.exports.sendEmail = async ({
  to, subject, html, text, headers,
}) => {
  if (!RESEND_API_KEY) {
    if (IS_PRODUCTION) {
      throw new EmailError('RESEND_API_KEY não configurada');
    }
    console.log(`\n[e-mail de desenvolvimento] Para: ${to}\nAssunto: ${subject}\n\n${text}\n`);
    return { id: 'dev' };
  }

  let response;
  try {
    response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [to],
        reply_to: EMAIL_REPLY_TO,
        subject,
        html,
        text,
        headers,
      }),
    });
  } catch (err) {
    throw new EmailError(`Resend indisponível: ${err.message}`);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new EmailError(`Resend ${response.status}: ${body.message || 'erro desconhecido'}`);
  }

  return body;
};
