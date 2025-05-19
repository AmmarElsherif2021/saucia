import { useEffect, useState } from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import createTheme from './theme'
import { useTranslation } from 'react-i18next'
const DynamicThemeProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentTheme, setCurrentTheme] = useState(createTheme(i18n.language))

  useEffect(() => {
    // Update theme when language changes
    setCurrentTheme(createTheme(i18n.language))

    // Update document direction
    document.documentElement.lang = i18n.language
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr'
  }, [i18n.language])

  return (
    <ChakraProvider theme={currentTheme} resetCSS={false}>
      {children}
    </ChakraProvider>
  )
}
export default DynamicThemeProvider
