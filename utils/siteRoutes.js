// Endereços do site por idioma, usados nos links dos e-mails.
// Espelha src/i18n/routes.js do front — se mudar um slug lá, mude aqui.
const { FRONTEND_URL } = require('./config');

const LANGS = ['pt', 'it', 'en'];

const ROUTES = {
  home: { pt: '', it: '', en: '' },
  guideSardegna: { pt: 'guias/sardegna', it: 'guide/sardegna', en: 'guides/sardinia' },
  guideChapada: { pt: 'guias/chapada', it: 'guide/chapada', en: 'guides/chapada' },
  guideNomadismo: { pt: 'guias/nomadismo', it: 'guide/nomadismo-digitale', en: 'guides/digital-nomad' },
  articleSardegna: {
    pt: 'sardegna/vilarejos-de-pedra-e-mar-turquesa',
    it: 'sardegna/borghi-di-pietra-e-mare-turchese',
    en: 'sardinia/stone-villages-and-turquoise-sea',
  },
  articleCagliari: {
    pt: 'sardegna/cagliari-capital-que-tambem-e-riviera',
    it: 'sardegna/cagliari-la-capitale-che-e-anche-riviera',
    en: 'sardinia/cagliari-the-capital-that-is-also-a-riviera',
  },
  articleChapada: {
    pt: 'chapada-diamantina/trilhas-pocos-e-lencois',
    it: 'chapada-diamantina/sentieri-pozze-e-lencois',
    en: 'chapada-diamantina/trails-pools-and-lencois',
  },
  articleIreland: {
    pt: 'irlanda/vida-de-nomade-alem-do-centro-caotico-de-dublin',
    it: 'irlanda/vita-da-nomade-oltre-il-centro-caotico-di-dublino',
    en: 'ireland/nomad-life-beyond-chaotic-central-dublin',
  },
  articleNomadismo: {
    pt: 'nomadismo-digital/trabalhar-de-qualquer-lugar',
    it: 'nomadismo-digitale/lavorare-da-ovunque',
    en: 'digital-nomad/work-from-anywhere',
  },
  timezones: { pt: 'fusos', it: 'fusi-orari', en: 'time-zones' },
  faq: { pt: 'perguntas-frequentes', it: 'domande-frequenti', en: 'faq' },
  privacy: { pt: 'privacidade', it: 'privacy', en: 'privacy' },
  welcome: { pt: 'bem-vindo', it: 'benvenuto', en: 'welcome' },
  resetPassword: { pt: 'redefinir-senha', it: 'reimposta-password', en: 'reset-password' },
};

const normalizeLang = (lang) => (LANGS.includes(lang) ? lang : 'pt');

// siteUrl('welcome', 'it') -> https://sassonomad.com/it/benvenuto
const siteUrl = (key, lang) => {
  const l = normalizeLang(lang);
  const slug = ROUTES[key][l];
  return slug ? `${FRONTEND_URL}/${l}/${slug}` : `${FRONTEND_URL}/${l}`;
};

module.exports = { LANGS, normalizeLang, siteUrl };
