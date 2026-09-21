const router = require('express').Router();
const auth = require('../middlewares/auth');
const NotFoundError = require('../errors/NotFoundError');
const MESSAGES = require('../utils/messages');
const authRoutes = require('./auth');
const userRoutes = require('./users');
const savedArticleRoutes = require('./savedArticles');

// /signup e /signin não exigem autorização.
router.use(authRoutes);

// Tudo abaixo daqui exige um JWT válido no cabeçalho Authorization.
router.use(auth);
router.use('/users', userRoutes);
router.use('/articles', savedArticleRoutes);

router.use((req, res, next) => next(new NotFoundError(MESSAGES.ROUTE_NOT_FOUND)));

module.exports = router;
