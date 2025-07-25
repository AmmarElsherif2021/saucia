import { Heading, VStack, Text } from '@chakra-ui/react'
import { ItemsCarousel } from '../../Components/ItemsCarousel'
import { OfferMealCard } from '../../Components/Cards'
import { useTranslation } from 'react-i18next'

export const OffersSlide = ({ offersMeals }) => {
  const { t } = useTranslation()
  
  // Filter out any undefined meals
  const validMeals = offersMeals?.filter(meal => meal) || []

  return (
    <VStack p={2} my={8} bg="transparent" alignItems="center">
      <Heading fontSize={'3em'} mb={4} textStyle="heading" color={'brand.800'}>
        {t('offerSlide.title')}
      </Heading>

      {validMeals.length > 0 ? (
        <ItemsCarousel 
          items={validMeals} 
          CardComponent={OfferMealCard} 
          visibleCount={3} 
        />
      ) : (
        <Text>{t('offerSlide.noOffers')}</Text>
      )}
    </VStack>
  )
}