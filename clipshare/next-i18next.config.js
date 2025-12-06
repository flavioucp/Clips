/**
 * Configuración de i18n con next-i18next
 */

const path = require('path');

const i18nextConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
  },
  localePath: path.resolve('./public/locales'),
};

module.exports = i18nextConfig;
