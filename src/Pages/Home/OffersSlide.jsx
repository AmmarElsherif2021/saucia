// This component displays a carousel of exclusive offers using the ItemsCarousel component.
import { Box, Heading, useColorMode } from "@chakra-ui/react";
import { ItemsCarousel } from "../../Components/ItemsCarousel";
import { FeaturedItemCard, OfferCard } from "../../Components/Cards";
import dessertPic from "../../assets/dessert.JPG";
import fruitPic from "../../assets/fruits.JPG";
import leavesPic from "../../assets/leaves.JPG";
export const OffersSlide = ({ offers = [] }) => {
  const { colorMode } = useColorMode();

  return (
    <Box p={4}bg="transparent">
      <Heading mb={6} textStyle="heading">
        Exclusive Offers
      </Heading>

      {/* Carousel */}
      <ItemsCarousel items={offers} CardComponent={OfferCard}/>
    </Box>
  );
};

// Example Usage
export const OffersSlideDemo = () => {
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