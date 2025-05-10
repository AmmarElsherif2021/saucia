import { useState, useEffect } from "react";
import mealImage from '../../assets/menu/defaultMeal.JPG'
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Text,
  Tag,
  useDisclosure,
  Image,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import { useI18nContext } from "../../Contexts/I18nContext";
const SALAD_SECTION_FREE_COUNTS = {
  "Protein": {value: 0, key_arabic: "بروتين"},
  "Nuts": {value: 1, key_arabic: "مكسرات"},
  "Dressings": {value: 2, key_arabic: "الصلصات"},
  "Fruits": {value: 1, key_arabic: "الفواكه"},
  "Cheese": {value: 0, key_arabic: "جبن"},
  "Greens": {value: 2, key_arabic: "الخضار الورقية"},
  "Toppings": {value: 3, key_arabic: "الإضافات"},
  "Vegetables": {value: 4, key_arabic: "خضروات"}
};

const FRUIT_SECTION_FREE_COUNT = {
  "salad-fruit": {value: 5, key_arabic: "سلطة فواكه"}
};
export const CustomizableMealCard = ({
   meal,
  sectionRules,
  selectableItems,
  onhandleAddToCart
}) => {
  const SECTION_FREE_COUNTS = meal.name === "Make your own fruit salad" 
  ? FRUIT_SECTION_FREE_COUNT : SALAD_SECTION_FREE_COUNTS;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {currentLanguage}=useI18nContext();
  const { t } = useTranslation();
  const isArabic = currentLanguage === 'ar';
  const [selectedItems, setSelectedItems] = useState({});
  const { addon_price = 0 } = sectionRules;
  const groupedItems = selectableItems.reduce((acc, item) => {
  const section = item.section || "Uncategorized";
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {});

  // Calculate section-based charges
  const calculateTotal = () => {
    const sectionQuantities = {};
    
    // Calculate quantities per section
    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      const item = selectableItems.find(i => i.id === itemId);
      if (item) {
        sectionQuantities[item.section] = 
          (sectionQuantities[item.section] || 0) + quantity;
      }
    });

    // Calculate total price considering free allowances
    let totalPrice = meal.price;
    Object.entries(sectionQuantities).forEach(([section, quantity]) => {
      const freeAllowance = SECTION_FREE_COUNTS[section]?.value || 0;
      const extraItems = Math.max(quantity - freeAllowance, 0);
      totalPrice += extraItems * addon_price;
    });

    return totalPrice;
  };
  // Handle selecting a single item
  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      // If item is already selected, deselect it
      if (prev[item.id]) {
        const { [item.id]: _, ...rest } = prev;
        return rest;
      }
      // Otherwise select it with quantity 1
      return {
        ...prev,
        [item.id]: 1
      };
    });
  };

  // Handle increasing/decreasing quantity for a specific item only
  const handleQuantityChange = (itemId, delta, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    setSelectedItems(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = currentQty + delta;
      
      // Remove item if quantity would be zero or negative
      if (newQty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      
      // Update only this specific item's quantity
      return {
        ...prev,
        [itemId]: newQty
      };
    });
  };



  
  const totalSelectedItems = Object.values(selectedItems).reduce((acc, curr) => acc + curr, 0);
  
  
  const handleConfirm = () => {
    //AddOns array
    const addOnsArray = Object.entries(selectedItems).flatMap(([id, qty]) => 
      Array(qty).fill(id)
    );
    
    onhandleAddToCart({
      id: meal.id,
      name: meal.name,
      image: meal.image || "",
      addOns: addOnsArray, 
      price: calculateTotal(),
      qty: 1
    });
    
    console.log(`from customizable addOns`, addOnsArray); // Log the actual array instead of [object Object]
    onClose();
  };


  // Reset selections when opening the modal
  const handleOpenModal = () => {
    setSelectedItems({});
    onOpen();
  };
 
  useEffect(() => {
    console.log(`selected items ${JSON.stringify(selectedItems)}`);
  }, [selectedItems]);

  return (
    <>
      {/* Customizable Meal Card */}
        <Box
          maxW="300px"
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          bg="gray.100"
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
          onClick={handleOpenModal}
          cursor="pointer"
        >
          <Image
            src={meal.image || mealImage}
            alt={meal.name}
            height="200px"
            width="100%"
            objectFit="cover"
          />
          <Box p="4">
            <Flex justify="space-between" align="baseline" mb="2">
          <Heading size="md" color="brand.700" textAlign="left" isTruncated>
            {isArabic ? meal.name_arabic : meal.name}
          </Heading>
          <Text fontWeight="bold" fontSize="md" color="brand.900">
            {meal.price.toFixed(2)} {t("common.currency")}
          </Text>
            </Flex>
            <Text fontSize="sm" color="gray.600" mb="3" noOfLines={2}>
          {meal.description}
            </Text>
            <Box mt={2}>
          <Text fontWeight="bold" mb={1}>
            {t("menuPage.chooseItems")}
          </Text>
          <Text fontSize="sm" color="gray.500" mb={1}>
            {t("menuPage.freeItems", { count: Object.values(SECTION_FREE_COUNTS).reduce((acc, count) => acc + count.value, 0) })}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {t("menuPage.additionalPrice")}: {addon_price} {t("common.currency")}
          </Text>
            </Box>
          </Box>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
          <Flex justify="space-between" align="center" w="100%">
            <Text fontSize="lg" fontWeight="bold">{isArabic?meal.name_arabic:meal.name}</Text>
            <Text fontWeight="bold" color="green.600">
              {calculateTotal().toFixed(2)} {t("common.currency")}
            </Text>
          </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
          <Text mb={4} fontSize="sm" color="gray.600">
            {t("menuPage.selectUpTo")}{" "}
            {Object.entries(SECTION_FREE_COUNTS).map(([section, data]) => (
              <span key={section}>
                <strong>{isArabic ? data.key_arabic : section}</strong>: {data.value} {t("menuPage.free")},{" "}
              </span>
            ))}
          </Text>
          <SimpleGrid columns={[1, 2]} spacing={4}>
            {Object.entries(groupedItems).map(([section, items]) => (
              <Box key={section} mb={6}>
            <Flex justify="space-between" align="center" mb={2}>
              <Heading size="sm" color="brand.700">
                {isArabic ? SECTION_FREE_COUNTS[section]?.key_arabic || section : section}
              </Heading>
              <Text fontSize="xs" color="gray.500">
                {SECTION_FREE_COUNTS[section]?.value || 0} {t("menuPage.free")}
              </Text>
            </Flex>
            {items.map((item) => {
                const quantity = selectedItems[item.id] || 0;
                const isSelected = quantity > 0;
                
                return (
                  <Flex
                    key={item.id}
                    p={4}
                    borderWidth={1}
                    borderRadius="md"
                    align="center"
                    justify="space-between"
                    bg={isSelected ? "blue.50" : "white"}
                    onClick={() => handleSelectItem(item)}
                    cursor="pointer"
                  >
                    <Box>
                      <Text fontWeight="bold">{item.name}</Text>
                      <Text fontSize="sm" color="gray.600">
                        +{item.addon_price} {t("common.currency")}/item
                      </Text>
                    </Box>
                    
                    {isSelected && (
                      <Flex align="center" gap={2} onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          onClick={(e) => handleQuantityChange(item.id, -1, e)}
                        >
                          -
                        </Button>
                        <Text minW="30px" textAlign="center">
                          {quantity}
                        </Text>
                        <Button
                          size="sm"
                          onClick={(e) => handleQuantityChange(item.id, 1, e)}
                        >
                          +
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                );
              })}
           
                </Box>
              ))}
             </SimpleGrid>

          <ModalFooter>
            <Tag mr={4}>
              {t("menuPage.selectedCount", { count: totalSelectedItems })}
            </Tag>
            <Tag colorScheme="green" mr={4}>
              {t("menuPage.totalPrice")}: {calculateTotal().toFixed(2)}{" "}
              {t("common.currency")}
            </Tag>
            <Button colorScheme="blue" onClick={handleConfirm}>
              {t("menuPage.addToCart")}
            </Button>
          </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CustomizableMealCard;