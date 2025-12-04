import { Box, Heading, Text } from '@chakra-ui/react'
import { useI18nContext } from '../../Contexts/I18nContext'
import { useTranslation } from 'react-i18next'

const StylizedBox = ({ colorScheme, children }) => {
  return (
    <Box p="20px" my="20px" borderRadius="30px" bg={`${colorScheme}.300`}>
      {children}
    </Box>
  )
}

const AboutPage = () => {
  const { currentLanguage } = useI18nContext()
  const { t } = useTranslation()
  const isArabic = currentLanguage === 'ar'

  return (
    <div>
      <StylizedBox colorScheme={'brand'}>
        <Heading as="h1" size="lg" mb="4">
          {t('aboutUs')} {/* Translate "About Us" */}
        </Heading>
        <Text>
          {isArabic
            ? 'مرحبًا بكم في تطبيق متجر السلطات الصحية الخاص بنا! نحن ملتزمون بتقديم سلطات طازجة ومغذية ولذيذة لمساعدتك في الحفاظ على نمط حياة صحي.'
            : 'Welcome to our Healthy Salad Store App! We are dedicated to providing fresh, nutritious, and delicious salads to help you maintain a healthy lifestyle.'}
        </Text>
      </StylizedBox>
      <StylizedBox colorScheme={'warning'}>
        <Heading as="h2" size="md" mb="4">
          {t('ourMission')} {/* Translate "Our Mission" */}
        </Heading>
        <Text>
          {isArabic
            ? 'مهمتنا هي جعل الأكل الصحي متاحًا وممتعًا للجميع. نحن نؤمن بقوة المكونات الطبيعية والممارسات المستدامة.'
            : 'Our mission is to make healthy eating accessible and enjoyable for everyone. We believe in the power of wholesome ingredients and sustainable practices.'}
        </Text>
      </StylizedBox>
      <StylizedBox colorScheme={'info'}>
        <Heading as="h2" size="md" mb="4">
          {t('whyChooseUs')} {/* Translate "Why Choose Us?" */}
        </Heading>
        <Text>
          {isArabic
            ? 'نحن نقدم مجموعة واسعة من السلطات المصنوعة من أجود المكونات، قابلة للتخصيص حسب ذوقك واحتياجاتك الغذائية. صحتك هي أولويتنا!'
            : 'We offer a wide variety of salads made from the freshest ingredients, customizable to your taste and dietary needs. Your health is our priority!'}
        </Text>
      </StylizedBox>
    </div>
  )
}
export default AboutPage
