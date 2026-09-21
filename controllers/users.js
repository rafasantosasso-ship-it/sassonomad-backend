const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');
const { JWT_SECRET } = require('../utils/config');
const MESSAGES = require('../utils/messages');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

module.exports.createUser = (req, res, next) => {
  const { email, password, name } = req.body;

  bcrypt
    .hash(password, SALT_ROUNDS)
    .then((hash) => User.create({ email, password: hash, name }))
    .then((user) => res.status(201).send({ email: user.email, name: user.name }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new ConflictError(MESSAGES.EMAIL_ALREADY_EXISTS));
      }
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(MESSAGES.INVALID_USER_DATA));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS));
      }

      return bcrypt.compare(password, user.password).then((matches) => {
        if (!matches) {
          return Promise.reject(new UnauthorizedError(MESSAGES.INVALID_CREDENTIALS));
        }
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        return res.send({ token });
      });
    })
    .catch(next);
};

module.exports.getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        return next(new NotFoundError(MESSAGES.USER_NOT_FOUND));
      }
      return res.send({ email: user.email, name: user.name });
    })
    .catch(next);
};
