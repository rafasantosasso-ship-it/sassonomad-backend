// Middleware centralizado de erros — fica por último no app.js. Nenhum
// erro é devolvido cru para o cliente: aqui decidimos o status e a
// mensagem que ele recebe.
const MESSAGES = require('../utils/messages');

module.exports = (err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500 ? MESSAGES.SERVER_ERROR : message,
    });

  next();
};
