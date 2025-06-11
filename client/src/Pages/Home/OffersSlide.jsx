import { Heading, VStack, Text } from '@chakra-ui/react'
import { ItemsCarousel } from '../../Components/ItemsCarousel'
import { OfferCard } from '../../Components/Cards'
import { useTranslation } from 'react-i18next'
//import { useEffect } from "react";
export const OffersSlide = ({ offersMeals }) => {
  const { t } = useTranslation()
  //useEffect(() => console.log(`From offers items ${(JSON.stringify(offersMeals))}`), [offersMeals]);

  return (
    <VStack p={2} my={8} bg="transparent" alignItems="center">
      <Heading fontSize={'3em'} mb={4} textStyle="heading" color={'brand.800'}>
        {t('offerSlide.title')}
      </Heading>

      {offersMeals?.length > 0 ? (
        <ItemsCarousel items={offersMeals} CardComponent={OfferCard} visibleCount={3} />
      ) : (
        <Text>{t('offerSlide.noOffers')}</Text>
      )}
    </VStack>
  )
}
