import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translations from './dict.json';

i18n.use(initReactI18next).init({
  resources: translations,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Export a function to get current language
export const getCurrentLanguage = () => i18n.language;

export default i18n;