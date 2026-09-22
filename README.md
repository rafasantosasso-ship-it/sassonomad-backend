# sassonomad-backend

Back-end do Sasso Nomad — projeto final TripleTen (Fase 2).

## Rodar localmente

1. Crie um arquivo `.env` na raiz (nunca versionado) com base no `.env.example`:
   ```
   MONGODB_URI=<sua connection string do MongoDB Atlas>
   JWT_SECRET=<qualquer string secreta, só pra desenvolvimento>
   ```
   Sem `.env`, o servidor sobe do mesmo jeito: usa `mongodb://127.0.0.1:27017/sassonomad` e um segredo de dev fixo (só funciona se você tiver um MongoDB local rodando).

2. Instale as dependências e rode:
   ```
   npm install
   npm run dev
   ```
   Servidor sobe em `http://localhost:3000`.

## Rotas

Públicas (sem autorização):

- `POST /signup` — cria um usuário (`email`, `password`, `name`)
- `POST /signin` — verifica `email`/`password` e devolve um `{ token }` (JWT)

Protegidas (exigem `Authorization: Bearer <token>`):

- `GET /users/me` — dados do usuário logado (`email`, `name`)
- `GET /articles` — guias/artigos salvos pelo usuário logado
- `POST /articles` — salva um guia/artigo (`keyword`, `title`, `text`, `date`, `fonte`, `link`, `image`)
- `DELETE /articles/:articleId` — remove um item salvo (só o dono pode remover o seu)

## Segurança

- Helmet define cabeçalhos de segurança padrão.
- Rate limit: no máximo 100 solicitações por IP a cada 15 minutos (`middlewares/rateLimiter.js`).
- Senhas armazenadas com hash (bcrypt), nunca em texto puro; a API nunca devolve o hash pro cliente.

## Logs

`request.log` (todas as solicitações) e `error.log` (erros), em JSON, gerados na raiz do projeto ao rodar — não vão pro repositório (`.gitignore`).

## Domínio de produção

_A preencher após o deploy._
