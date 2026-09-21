const router = require('express').Router();
const {
  getSavedArticles,
  createSavedArticle,
  deleteSavedArticle,
} = require('../controllers/savedArticles');
const { validateSavedArticle, validateArticleId } = require('../middlewares/validators');

router.get('/', getSavedArticles);
router.post('/', validateSavedArticle, createSavedArticle);
router.delete('/:articleId', validateArticleId, deleteSavedArticle);

module.exports = router;
