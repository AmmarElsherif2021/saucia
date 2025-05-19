import { useEffect, useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import { useI18nContext } from './I18nContext'
import createTheme from '../theme'

const DynamicThemeProvider = ({ children }) => {
  const { currentLanguage, isI18nInitialized } = useI18nContext()

  // Create theme with language parameter
  const [currentTheme, setCurrentTheme] = useState(() => createTheme({ language: currentLanguage }))

  // Update theme only when language changes and i18n is fully initialized
  useEffect(() => {
    if (isI18nInitialized) {
      setCurrentTheme(createTheme({ language: currentLanguage }))
    }
  }, [currentLanguage, isI18nInitialized])

  return (
    <ChakraProvider theme={currentTheme} resetCSS={false}>
      {children}
    </ChakraProvider>
  )
}

export default DynamicThemeProvider
