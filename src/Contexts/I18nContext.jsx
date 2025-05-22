/* eslint-disable */
import React, { createContext, useState, useContext, useEffect } from 'react'
import i18n from '../i18n'
import translations from '../dict.json'
import { I18nextProvider } from 'react-i18next' // Add this import

const I18nContext = createContext()
 
export const useI18nContext = () => useContext(I18nContext)

export const I18nProvider = ({ children }) => {
  const getInitialLanguage = () => {
    const storedLang = localStorage.getItem('i18nextLng')
    if (storedLang && Object.keys(translations).includes(storedLang)) {
      return storedLang
    }
    return i18n.language || 'en'
  }

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage())
  const [isReady, setIsReady] = useState(false)

  // Initialize i18n on mount
  useEffect(() => {
    const initializeI18n = async () => {
      try {
        if (!i18n.isInitialized) {
          await i18n.init({
            resources: translations,
            lng: currentLanguage,
            fallbackLng: 'en',
            interpolation: { escapeValue: false },
            keySeparator: '.',
            ns: ['translation'],
            defaultNS: 'translation',
          })
        }
        setIsReady(true)
      } catch (error) {
        console.error('i18n initialization failed:', error)
        setIsReady(true)
      }
    }

    initializeI18n()
  }, [])

  // Handle language changes
  useEffect(() => {
    const updateLanguage = async () => {
      if (i18n.isInitialized && i18n.language !== currentLanguage) {
        try {
          await i18n.changeLanguage(currentLanguage)
          localStorage.setItem('i18nextLng', currentLanguage)
          document.documentElement.lang = currentLanguage
          document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr'
        } catch (error) {
          console.error('Language change failed:', error)
        }
      }
    }

    updateLanguage()
  }, [currentLanguage])

  const changeLanguage = (lang) => {
    if (Object.keys(translations).includes(lang)) {
      setCurrentLanguage(lang)
    } else {
      console.warn(`Language '${lang}' not available, falling back to 'en'`)
      setCurrentLanguage('en')
    }
  }

  const contextValue = {
    isI18nInitialized: isReady,
    currentLanguage,
    changeLanguage,
    availableLanguages: Object.keys(translations),
    isRTL: currentLanguage === 'ar',
  }

  if (!isReady) {
    return <div>Loading translations...</div>
  }

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
    </I18nextProvider>
  )
}
