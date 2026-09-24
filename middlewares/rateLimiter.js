const rateLimit = require('express-rate-limit');
const MESSAGES = require('../utils/messages');

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: MESSAGES.RATE_LIMIT_EXCEEDED },
};

// Limita cada IP a 100 solicitações a cada 15 minutos. Evita abuso/força
// bruta contra as rotas públicas (/signup, /signin) e as demais.
module.exports = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Limite mais apertado para as rotas que disparam e-mail: 5 por IP a cada
// 15 minutos, contados separadamente para cada rota. Protege a cota do
// Resend e impede que o formulário vire ferramenta de spam.
const createEmailLimiter = () => rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,
});

module.exports.subscribeLimiter = createEmailLimiter();
module.exports.passwordLimiter = createEmailLimiter();
