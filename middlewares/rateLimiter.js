const rateLimit = require('express-rate-limit');
const MESSAGES = require('../utils/messages');

// Limita cada IP a 100 solicitações a cada 15 minutos. Evita abuso/força
// bruta contra as rotas públicas (/signup, /signin) e as demais.
module.exports = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: MESSAGES.RATE_LIMIT_EXCEEDED },
});
