const { celebrate, Joi } = require('celebrate');

// Validação do corpo/parâmetros das solicitações, num módulo separado dos
// controllers — se algo estiver errado, a solicitação nem chega no
// controller (celebrate já responde 400 sozinho, tratado pelo error
// handler central).

const validateSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
});

const validateSignin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
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
  validateSavedArticle,
  validateArticleId,
};
