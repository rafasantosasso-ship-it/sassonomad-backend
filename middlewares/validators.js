const { celebrate, Joi } = require('celebrate');

// Validação do corpo/parâmetros das solicitações, num módulo separado dos
// controllers — se algo estiver errado, a solicitação nem chega no
// controller (celebrate já responde 400 sozinho, tratado pelo error
// handler central).

// Nome: só letras (com acento), espaço, apóstrofo e hífen. Impede
// que alguém coloque link/propaganda no nome e use o nosso e-mail de
// boas-vindas pra mandar spam pra terceiros.
const NAME_PATTERN = /^[\p{L}\p{M}' -]+$/u;
const name = Joi.string().trim().min(2).max(30)
  .pattern(NAME_PATTERN);
const email = Joi.string().trim().lowercase().required()
  .email();
const password = Joi.string().required().min(8).max(72);
// Tokens dos links de e-mail: 64 caracteres hexadecimais.
const linkToken = Joi.string().required().hex().length(64);

const validateSignup = celebrate({
  body: Joi.object().keys({
    email,
    password,
    name: name.required(),
  }),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email,
    password: Joi.string().required(),
  }),
});

const validateSubscribe = celebrate({
  body: Joi.object().keys({
    name: name.required(),
    email,
    lang: Joi.string().valid('pt', 'it', 'en').default('pt'),
    source: Joi.string().trim().max(40).pattern(/^[a-z0-9-]+$/)
      .default('site'),
    // Consentimento GDPR: precisa vir marcado.
    consent: Joi.boolean().valid(true).required(),
    // Honeypot (campo invisível no formulário).
    website: Joi.string().allow('').max(200),
  }),
});

const validateLinkToken = celebrate({
  body: Joi.object().keys({ token: linkToken }),
});

const validateTokenAndPassword = celebrate({
  body: Joi.object().keys({ token: linkToken, password }),
});

const validateForgotPassword = celebrate({
  body: Joi.object().keys({
    email,
    lang: Joi.string().valid('pt', 'it', 'en').default('pt'),
  }),
});

const validateSavedArticle = celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    fonte: Joi.string().required(),
    link: Joi.string().required().uri(),
    image: Joi.string().required().uri(),
  }),
});

const validateArticleId = celebrate({
  params: Joi.object().keys({
    articleId: Joi.string().required().hex().length(24),
  }),
});

module.exports = {
  validateSignup,
  validateSignin,
  validateSubscribe,
  validateLinkToken,
  validateTokenAndPassword,
  validateForgotPassword,
  validateSavedArticle,
  validateArticleId,
};
