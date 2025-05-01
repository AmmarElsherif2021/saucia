import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from '../i18n';
import { getCurrentLanguage } from '../i18n';
import translations from '../dict.json';

// Create context
const I18nContext = createContext();

export const useI18nContext = () => useContext(I18nContext);

export const I18nProvider = ({ children }) => {
  const [isI18nInitialized, setIsI18nInitialized] = useState(i18n.isInitialized);
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  // Check if i18n is initialized on mount
  useEffect(() => {
    if (i18n.isInitialized) {
      setIsI18nInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (i18n.isInitialized && i18n.language !== currentLanguage) {
      i18n.changeLanguage(currentLanguage);
      
      // Store language preference
      localStorage.setItem('i18nextLng', currentLanguage);
    }
    
    // Update document attributes for RTL/LTR support
    if (i18n.isInitialized) {
      document.documentElement.lang = currentLanguage;
      document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    }
  }, [currentLanguage, isI18nInitialized]);

  const changeLanguage = (lang) => {
    if (Object.keys(translations).includes(lang)) {
      setCurrentLanguage(lang);
    } else {
      console.warn(`Language '${lang}' not available, falling back to '${i18n.options.fallbackLng}'`);
      setCurrentLanguage(i18n.options.fallbackLng);
    }
  };

  // Get available languages from dict.json
  const availableLanguages = Object.keys(translations);

  const contextValue = {
    isI18nInitialized,
    currentLanguage,
    changeLanguage,
    availableLanguages,
    t: i18n.t.bind(i18n),
  };

  // Show loading state while initializing
  if (!isI18nInitialized) {
    return <div>Loading translations...</div>;
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};