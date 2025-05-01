import { useEffect, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { useI18nContext } from './I18nContext';
import createTheme from '../theme'; 

const DynamicThemeProvider = ({ children }) => {
  // Get language from context HERE (inside the component)
  const { currentLanguage = 'en' } = useI18nContext() || {};

  // Pass language to createTheme (no hooks inside createTheme)
  const [currentTheme, setCurrentTheme] = useState(
    createTheme({ language: currentLanguage })
  );

  useEffect(() => {
    // Update theme when language changes
    setCurrentTheme(createTheme({ language: currentLanguage }));
    
    // Update document direction
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  }, [currentLanguage]);

  return (
    <ChakraProvider theme={currentTheme} resetCSS={false}>
      {children}
    </ChakraProvider>
  );
};

export default DynamicThemeProvider;