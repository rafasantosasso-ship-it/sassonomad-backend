const crypto = require('crypto');
const ForbiddenError = require('../errors/ForbiddenError');
const { ADMIN_KEY } = require('../utils/config');
const MESSAGES = require('../utils/messages');

const MIN_KEY_LENGTH = 24;

// Protege as rotas /admin com o cabeçalho x-admin-key. Sem ADMIN_KEY no
// .env (ou curta demais), a rota fica sempre bloqueada.
module.exports = (req, res, next) => {
  const received = String(req.headers['x-admin-key'] || '');

  if (!ADMIN_KEY || ADMIN_KEY.length < MIN_KEY_LENGTH) {
    return next(new ForbiddenError(MESSAGES.ADMIN_FORBIDDEN));
  }

  const a = crypto.createHash('sha256').update(received).digest();
  const b = crypto.createHash('sha256').update(ADMIN_KEY).digest();

  if (!crypto.timingSafeEqual(a, b)) {
    return next(new ForbiddenError(MESSAGES.ADMIN_FORBIDDEN));
  }

  return next();
};
