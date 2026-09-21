const mongoose = require('mongoose');
const validator = require('validator');

// "savedArticle": a segunda entidade da API. Como o Sasso Nomad não tem
// busca de notícias (não é o projeto News Explorer), aqui ela representa
// um guia/artigo do próprio blog que um usuário logado salvou na sua lista
// pessoal — mesma forma dos campos pedidos na lição, com o sentido
// adaptado ao conteúdo real do site.
const savedArticleSchema = new mongoose.Schema(
  {
    keyword: {
      // Categoria/tag do conteúdo salvo (ex.: "Nomadismo digital", "Itália").
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      // Resumo/descrição curta do guia ou artigo.
      type: String,
      required: true,
    },
    date: {
      // Data em que o item foi salvo.
      type: String,
      required: true,
    },
    fonte: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isURL(value),
        message: 'O link deve ser um endereço URL válido',
      },
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator: (value) => validator.isURL(value),
        message: 'A imagem deve ser um endereço URL válido',
      },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

module.exports = mongoose.model('savedArticle', savedArticleSchema);
