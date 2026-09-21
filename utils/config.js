// Constantes de configuração — valor de desenvolvimento aqui, valor real
// vem de process.env em produção (arquivo .env, nunca versionado).
const { NODE_ENV, JWT_SECRET, MONGODB_URI } = process.env;

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret-nao-use-em-producao',
  MONGODB_URI: MONGODB_URI || 'mongodb://127.0.0.1:27017/sassonomad',
};
