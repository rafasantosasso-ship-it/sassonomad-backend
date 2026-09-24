const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/BadRequestError');
const { sendEmail } = require('../utils/mailer');
const { createToken, hashToken } = require('../utils/tokens');
const { passwordResetEmail } = require('../emails/templates');
const { JWT_SECRET } = require('../utils/config');
const MESSAGES = require('../utils/messages');
const { siteUrl } = require('../utils/siteRoutes');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';
const RESET_LINK_TTL_MS = 60 * 60 * 1000; // 1h
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

// POST /password/forgot — sempre responde igual, exista a conta ou não.
module.exports.forgotPassword = async (req, res, next) => {
  // `lang`: idioma da página em que a pessoa pediu (pt, it ou en).
  const { email, lang } = req.body;

  try {
    const user = await User.findOne({ email }).select('+passwordResetRequestedAt');
    const lastRequest = user?.passwordResetRequestedAt?.getTime() || 0;

    if (user && Date.now() - lastRequest > RESEND_COOLDOWN_MS) {
      const { token, hash } = createToken();
      Object.assign(user, {
        passwordResetTokenHash: hash,
        passwordResetExpires: new Date(Date.now() + RESET_LINK_TTL_MS),
        passwordResetRequestedAt: new Date(),
      });
      await user.save();

      await sendEmail({
        to: user.email,
        ...passwordResetEmail({
          name: user.name,
          resetUrl: `${siteUrl('resetPassword', lang)}?token=${token}`,
          lang,
        }),
      });
    }

    return res.send({ message: MESSAGES.PASSWORD_RESET_REQUESTED });
  } catch (err) {
    if (err.isEmailError) {
      console.error('Falha ao enviar redefinição de senha:', err.message);
      const sendError = new Error(MESSAGES.EMAIL_SEND_FAILED);
      sendError.statusCode = 502;
      return next(sendError);
    }
    return next(err);
  }
};

// POST /password/reset — troca a senha e já devolve um JWT (entra logado).
module.exports.resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      passwordResetTokenHash: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return next(new BadRequestError(MESSAGES.INVALID_OR_EXPIRED_LINK));
    }

    Object.assign(user, {
      password: await bcrypt.hash(password, SALT_ROUNDS),
      passwordResetTokenHash: undefined,
      passwordResetExpires: undefined,
    });
    await user.save();

    const jwtToken = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
    return res.send({ message: MESSAGES.PASSWORD_RESET_OK, token: jwtToken });
  } catch (err) {
    return next(err);
  }
};
