const router = require('express').Router();
const { forgotPassword, resetPassword } = require('../controllers/password');
const { validateForgotPassword, validateTokenAndPassword } = require('../middlewares/validators');
const { passwordLimiter } = require('../middlewares/rateLimiter');

router.post('/password/forgot', passwordLimiter, validateForgotPassword, forgotPassword);
router.post('/password/reset', validateTokenAndPassword, resetPassword);

module.exports = router;
