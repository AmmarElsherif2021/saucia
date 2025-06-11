import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// We don't initialize here - this is now handled in I18nContext
// to avoid timing issues and circular dependencies
i18n.use(initReactI18next)

// Export a utility function to get current language
export const getCurrentLanguage = () => i18n.language || 'en'

// Export i18n instance for use in the app
export default i18n
