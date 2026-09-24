const router = require('express').Router();
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');
const NotFoundError = require('../errors/NotFoundError');
const MESSAGES = require('../utils/messages');
const authRoutes = require('./auth');
const subscriberRoutes = require('./subscribers');
const passwordRoutes = require('./password');
const { getStats } = require('../controllers/admin');
const userRoutes = require('./users');
const savedArticleRoutes = require('./savedArticles');

// Rotas públicas: cadastro/login, comunidade e "esqueci minha senha".
router.use(authRoutes);
router.use(subscriberRoutes);
router.use(passwordRoutes);

// Números da lista — protegida pelo cabeçalho x-admin-key (não usa JWT).
router.get('/admin/stats', adminAuth, getStats);

// Tudo abaixo daqui exige um JWT válido no cabeçalho Authorization.
router.use(auth);
router.use('/users', userRoutes);
router.use('/articles', savedArticleRoutes);

router.use((req, res, next) => next(new NotFoundError(MESSAGES.ROUTE_NOT_FOUND)));

module.exports = router;
