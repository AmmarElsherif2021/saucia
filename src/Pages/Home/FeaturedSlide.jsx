import { VStack, Heading, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FeaturedItemCard } from '../../Components/Cards'
import { ItemsCarousel } from '../../Components/ItemsCarousel'

export const FeaturedMeals = ({ featuredMeals }) => {
  const { t } = useTranslation()
  //useEffect(() => console.log(`From featured items ${(JSON.stringify(featuredMeals))}`), [featuredMeals]);

  return (
    <VStack p={4} bg="transparent" alignItems={'center'} w={'99%'}>
      <Heading mb={6} fontSize={'3em'} textStyle="heading" color={'brand.800'}>
        {t('featuredSlide.title')}
      </Heading>

      {/* Items display */}
      {featuredMeals?.length > 0 ? (
        <ItemsCarousel 
          items={featuredMeals}
          CardComponent={FeaturedItemCard}
          visibleCount={3}
          visibleButtons={true}
        />
      ) : (
        <Text>{t('featuredSlide.noItems')}</Text>
      )}
    </VStack>
  )
}
