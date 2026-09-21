// Mensagens de resposta e erro da API, centralizadas — evita strings
// soltas espalhadas pelos controllers/middlewares e facilita manter o
// texto consistente (e traduzir/revisar tudo num só lugar).
module.exports = {
  AUTH_REQUIRED: 'Autorização necessária',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos',
  EMAIL_ALREADY_EXISTS: 'Já existe um usuário cadastrado com esse e-mail',
  INVALID_USER_DATA: 'Dados inválidos para criação do usuário',
  USER_NOT_FOUND: 'Usuário não encontrado',
  INVALID_ARTICLE_DATA: 'Dados inválidos para salvar o artigo',
  ARTICLE_NOT_FOUND: 'Artigo não encontrado',
  ARTICLE_FORBIDDEN: 'Você não pode remover um artigo salvo por outro usuário',
  ROUTE_NOT_FOUND: 'Rota não encontrada',
  SERVER_ERROR: 'Ocorreu um erro no servidor',
  RATE_LIMIT_EXCEEDED: 'Muitas solicitações vindas desse IP, tente novamente mais tarde',
};
