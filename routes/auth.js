const router = require('express').Router();
const { createUser, login } = require('../controllers/users');
const { validateSignup, validateSignin } = require('../middlewares/validators');

router.post('/signup', validateSignup, createUser);
router.post('/signin', validateSignin, login);

module.exports = router;
