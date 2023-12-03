import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../l10n/en/ui.json';

const resources = {
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
