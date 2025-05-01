import { Box, Heading, useColorMode } from "@chakra-ui/react";
import { ItemsCarousel } from "../../Components/ItemsCarousel";
import { OfferCard } from "../../Components/Cards";
import { useI18nContext } from "../../Contexts/I18nContext";
import dessertPic from "../../assets/dessert.JPG";
import fruitPic from "../../assets/fruits.JPG";
import leavesPic from "../../assets/leaves.JPG";

export const OffersSlide = ({ offers = [] }) => {
  const { colorMode } = useColorMode();
  const { t } = useI18nContext();

  return (
    <Box p={4} bg="transparent">
      <Heading fontSize={"3em"} mb={6} textStyle="heading">
        {t("offerSlide.title")} {/* Translate "Exclusive Offers" */}
      </Heading>

      {/* Carousel */}
      <ItemsCarousel visibleCount={offers?.length} items={offers} CardComponent={OfferCard} />
    </Box>
  );
};

// Example Usage
export const OffersSlideDemo = () => {
  const { t } = useI18nContext()

  const sampleOffers = [
    {
      name: "Buy 1 Get 1 Free",
      description: "Applicable on select items only.",
      price: 0,
      image: dessertPic,
      rating: 4.5,
    },
    {
      name: "20% Off on Combos",
      description: "Get 20% off on all combo meals.",
      price: 0,
      image: fruitPic,
      rating: 4.8,
    },
    {
      name: "Limited-Time Dessert Offer",
      description: "Flat 50% off on desserts.",
      price: 0,
      image:leavesPic,
      rating: 4.7,
    },
    {
      name: "Loyalty Program Discount",
      description: "Extra 10% off for loyalty members.",
      price: 0,
      image: dessertPic,
      rating: 4.9,
    },
  ];

  return <OffersSlide offers={sampleOffers} />;
};

