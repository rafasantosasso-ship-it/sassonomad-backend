const winston = require('winston');
const expressWinston = require('express-winston');

// request.log: todas as solicitações da API, em JSON. error.log: erros
// devolvidos pela API, em JSON. Nenhum dos dois vai pro repositório
// (ver .gitignore).
const requestLogger = expressWinston.logger({
  transports: [new winston.transports.File({ filename: 'request.log' })],
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

const errorLogger = expressWinston.errorLogger({
  transports: [new winston.transports.File({ filename: 'error.log' })],
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

module.exports = { requestLogger, errorLogger };
