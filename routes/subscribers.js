const router = require('express').Router();
const {
  subscribe, confirm, createAccount, unsubscribeForm, unsubscribe,
} = require('../controllers/subscribers');
const {
  validateSubscribe, validateLinkToken, validateTokenAndPassword,
} = require('../middlewares/validators');
const { subscribeLimiter } = require('../middlewares/rateLimiter');

// Comunidade / newsletter — todas públicas.
router.post('/subscribe', subscribeLimiter, validateSubscribe, subscribe);
router.post('/subscribe/confirm', validateLinkToken, confirm);
router.post('/subscribe/create-account', validateTokenAndPassword, createAccount);
router.get('/unsubscribe', unsubscribeForm);
router.post('/unsubscribe', unsubscribe);

module.exports = router;
