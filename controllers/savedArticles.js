const SavedArticle = require('../models/savedArticle');
const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');
const ForbiddenError = require('../errors/ForbiddenError');

module.exports.getSavedArticles = (req, res, next) => {
  SavedArticle.find({ owner: req.user._id })
    .then((articles) => res.send(articles))
    .catch(next);
};

module.exports.createSavedArticle = (req, res, next) => {
  const {
    keyword, title, text, date, fonte, link, image,
  } = req.body;

  SavedArticle.create({
    keyword, title, text, date, fonte, link, image, owner: req.user._id,
  })
    .then((article) => {
      // owner tem select: false — não devolve pro cliente.
      const {
        _id, ...rest
      } = article.toObject({ useProjection: true });
      return res.status(201).send({ _id, ...rest });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Dados inválidos para salvar o artigo'));
      }
      return next(err);
    });
};

module.exports.deleteSavedArticle = (req, res, next) => {
  const { articleId } = req.params;

  SavedArticle.findById(articleId)
    .select('+owner')
    .then((article) => {
      if (!article) {
        return Promise.reject(new NotFoundError('Artigo não encontrado'));
      }
      if (article.owner.toString() !== req.user._id) {
        return Promise.reject(new ForbiddenError('Você não pode remover um artigo salvo por outro usuário'));
      }
      return article.deleteOne().then(() => {
        const { owner, ...rest } = article.toObject();
        return res.send(rest);
      });
    })
    .catch(next);
};
