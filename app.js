require('dotenv').config();

// Usa o DNS público do Google para resolver o registro SRV do MongoDB Atlas.
// Algumas redes/roteadores bloqueiam consultas DNS SRV do provedor padrão,
// o que quebra a string de conexao "mongodb+srv://" com ECONNREFUSED.
// Isso afeta só a resolução de DNS deste processo Node, sem mexer em
// nenhuma configuração do sistema operacional.
require('dns').setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const { errors } = require('celebrate');
const rateLimiter = require('./middlewares/rateLimiter');

const { requestLogger, errorLogger } = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');
const routes = require('./routes');
const { PORT, MONGODB_URI } = require('./utils/config');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Loga toda solicitação em request.log antes de qualquer rota.
app.use(requestLogger);

app.use(routes);

// Loga erros em error.log.
app.use(errorLogger);

// Formata erros de validação do celebrate como 400.
app.use(errors());

// Middleware central de erros — sempre por último.
app.use(errorHandler);

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Não foi possível conectar ao MongoDB:', err.message);
    process.exit(1);
  });
