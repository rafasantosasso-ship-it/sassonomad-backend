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

  // Comunidade / newsletter
  SUBSCRIBE_OK: 'Cadastro feito! Confira seu e-mail.',
  INVALID_SUBSCRIBER_DATA: 'Dados inválidos para o cadastro',
  INVALID_OR_EXPIRED_LINK: 'Esse link é inválido ou expirou',
  ACCOUNT_ALREADY_EXISTS: 'Você já tem uma conta com esse e-mail. É só entrar.',
  EMAIL_SEND_FAILED: 'Não foi possível enviar o e-mail agora. Tente de novo em instantes.',

  // Senha
  PASSWORD_RESET_REQUESTED: 'Se existir uma conta com esse e-mail, enviamos um link para criar uma nova senha.',
  PASSWORD_RESET_OK: 'Senha atualizada',

  // Admin
  ADMIN_FORBIDDEN: 'Acesso negado',
};
