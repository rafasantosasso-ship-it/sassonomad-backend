// Constantes de configuração — valor de desenvolvimento aqui, valor real
// vem de process.env em produção (arquivo .env, nunca versionado).
const {
  NODE_ENV,
  JWT_SECRET,
  MONGODB_URI,
  RESEND_API_KEY,
  EMAIL_FROM,
  EMAIL_REPLY_TO,
  FRONTEND_URL,
  API_URL,
  ADMIN_KEY,
} = process.env;

const IS_PRODUCTION = NODE_ENV === 'production';

module.exports = {
  IS_PRODUCTION,
  PORT: process.env.PORT || 3000,
  JWT_SECRET: IS_PRODUCTION ? JWT_SECRET : 'dev-secret-nao-use-em-producao',
  MONGODB_URI: MONGODB_URI || 'mongodb://127.0.0.1:27017/sassonomad',

  // E-mail transacional (Resend). Sem RESEND_API_KEY fora de produção, os
  // e-mails não são enviados: aparecem no terminal (ver utils/mailer.js).
  RESEND_API_KEY,
  EMAIL_FROM: EMAIL_FROM || 'Sasso Nomad <nomad@sassonomad.com>',
  EMAIL_REPLY_TO: EMAIL_REPLY_TO || 'nomad@sassonomad.com',

  // Endereços públicos usados para montar os links dos e-mails.
  FRONTEND_URL: (FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  API_URL: (API_URL || 'http://localhost:3000').replace(/\/$/, ''),

  // Chave da rota GET /admin/stats. Sem ela (ou curta demais) a rota fica
  // desligada.
  ADMIN_KEY,
};
