import { useEffect, useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { useI18nContext } from './I18nContext'
import createTheme from '../theme'

const DynamicThemeProvider = ({ children }) => {
  const { currentLanguage, isI18nInitialized } = useI18nContext()
  
  // Create default theme first (with fallback language)
  const [currentTheme, setCurrentTheme] = useState(() => 
    createTheme({ language: isI18nInitialized ? currentLanguage : 'en' })
  )

  useEffect(() => {
    if (isI18nInitialized) {
      setCurrentTheme(createTheme({ language: currentLanguage }))
    }
  }, [currentLanguage, isI18nInitialized])

  return (
    <ChakraProvider theme={currentTheme} resetCSS>
      {children}
    </ChakraProvider>
  )
}

export default DynamicThemeProvider