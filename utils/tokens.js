const crypto = require('crypto');

// Tokens de uso único dos links enviados por e-mail (confirmar cadastro,
// criar senha, redefinir senha). O token em si só existe no link do
// e-mail; no banco guardamos apenas o hash SHA-256 — se o banco vazar,
// ninguém consegue usar os links.

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

const createToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: hashToken(token) };
};

// Token permanente do link "cancelar inscrição" (não expira).
const createUnsubscribeToken = () => crypto.randomBytes(24).toString('hex');

module.exports = { hashToken, createToken, createUnsubscribeToken };
