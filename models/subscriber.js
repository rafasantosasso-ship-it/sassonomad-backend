const mongoose = require('mongoose');
const validator = require('validator');

// Inscritos da comunidade/newsletter. Fica separado de "user": nem todo
// inscrito cria conta (senha), e quem cria conta continua inscrito aqui.
//
// status:
//   pending      → se cadastrou no popup, ainda não clicou no link do e-mail
//   confirmed    → clicou no link (double opt-in, exigido pelo GDPR)
//   unsubscribed → cancelou a inscrição (não recebe mais nada)
const subscriberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: 'E-mail inválido',
      },
    },
    lang: {
      type: String,
      enum: ['pt', 'it', 'en'],
      default: 'pt',
    },
    // De onde veio o cadastro (popup do menu, seção da home, artigo...).
    source: {
      type: String,
      trim: true,
      maxlength: 40,
      default: 'site',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'unsubscribed'],
      default: 'pending',
      index: true,
    },
    // Prova do consentimento (GDPR): quando aceitou e o texto da versão.
    consentAt: { type: Date, required: true },
    consentVersion: { type: String, default: 'v1' },
    confirmedAt: Date,
    unsubscribedAt: Date,
    lastEmailSentAt: Date,

    confirmTokenHash: { type: String, select: false, index: true },
    confirmTokenExpires: { type: Date, select: false },
    unsubscribeToken: {
      type: String,
      select: false,
      unique: true,
      sparse: true,
    },
  },
  { versionKey: false, timestamps: true },
);

module.exports = mongoose.model('subscriber', subscriberSchema);
