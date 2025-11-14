import React, { useState, useMemo } from "react"; 
import { 
    Card, Box, Heading, Text, Grid, Flex, Image, Button, Badge, VStack,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Spinner, Center, Modal, ModalHeader, ModalBody, ModalOverlay, 
    ModalContent, ModalCloseButton, ModalFooter
} from "@chakra-ui/react"; 
import { useI18nContext } from "../../Contexts/I18nContext"; 
import extraIcon from "../../assets/menu/extras.svg"; 
import fatIcon from "../../assets/menu/fat.svg"; 
import proteinIcon from "../../assets/menu/proteinBadge.svg"; 
import carbsIcon from "../../assets/menu/carb.svg"; 
import kcalIcon from "../../assets/menu/kcal.svg"; 
import weightIcon from "../../assets/menu/weight.svg"; 

// Enhanced content component with props interface
const PurchasePortalContent = ({ 
    subscriptionMeals,
    onMealConfirmed 
}) => {
    const { currentLanguage } = useI18nContext();
    const isArabic = currentLanguage === "ar";
    
    const [selectedMealIndex, setSelectedMealIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmedMeal, setConfirmedMeal] = useState(null);

    // FIX: Optimized data source with proper fallback to empty array
    const displayGroups = useMemo(() => {
        if (subscriptionMeals && Array.isArray(subscriptionMeals) && subscriptionMeals.length > 0) {
            console.log('✅ Using subscription meals:', subscriptionMeals.length);
            return subscriptionMeals;
        }
        console.log('⚠️ No meals available, returning empty array');
        return [];
    }, [subscriptionMeals]);

    // Show empty state if no meals are available
    if (!displayGroups || displayGroups.length === 0) {
        return (
            <Box p={4} maxW="1200px" mx="auto" fontFamily={isArabic ? '"Lalezar",sans_serif' : '"Outfit",sans_serif'}>
                <Heading mb={4} textAlign={isArabic ? "right" : "left"} color="secondary.700">
                    {isArabic ? "اختر واحدة من وجباتك المعدة مسبقًا" : "Pick one of your pre-designed meals"}
                </Heading>
                <Center p={8}>
                    <VStack spacing={4}>
                        <Text fontSize="lg" color="gray.500">
                            {isArabic ? "لا توجد وجبات متاحة حاليًا" : "No meals available at the moment"}
                        </Text>
                        <Text fontSize="sm" color="gray.400">
                            {isArabic ? "يرجى إنشاء اشتراك أولاً" : "Please create a subscription first"}
                        </Text>
                    </VStack>
                </Center>
            </Box>
        );
    }

    // Handler for meal selection (select entire meal group)
    const handleMealSelect = (mealIndex) => {
        setSelectedMealIndex(mealIndex);
        console.log("Selected meal group index:", mealIndex);
    };

    // Open modal for the currently selected meal
    const handleConfirmSelection = () => {
        if (selectedMealIndex !== null) {
            const selectedMeal = displayGroups[selectedMealIndex];
            console.log("Preparing confirmation modal for meal at index:", selectedMealIndex);
            setConfirmedMeal(selectedMeal);
            setIsModalOpen(true);
        } else {
            console.warn(isArabic ? "الرجاء اختيار وجبة" : "Please select a meal");
        }
    };

    // When the user confirms inside the modal, call the provided callback
    const handleModalConfirm = () => {
        if (confirmedMeal && selectedMealIndex !== null) {
            console.log("✅ Confirmed meal selection:", {
                mealIndex: selectedMealIndex,
                mealData: confirmedMeal
            });
            if (onMealConfirmed) {
                onMealConfirmed(confirmedMeal, selectedMealIndex);
            }
        }
        setIsModalOpen(false);
        setConfirmedMeal(null);
        setSelectedMealIndex(null); // Reset selection after confirmation
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setConfirmedMeal(null);
    };

    // Calculate total nutrition for a meal group
    const calculateMealTotals = (mealGroup) => {
        if (!Array.isArray(mealGroup)) return { calories: 0, protein: 0, carbs: 0, fats: 0, weight: 0 };
        
        return mealGroup.reduce((totals, item) => ({
            calories: totals.calories + (item.calories || 0),
            protein: totals.protein + (item.protein_g || item.protein || 0),
            carbs: totals.carbs + (item.carbs_g || item.carbs || 0),
            fats: totals.fats + (item.fat_g || item.fats || 0),
            weight: totals.weight + (item.weight || 0)
        }), { calories: 0, protein: 0, carbs: 0, fats: 0, weight: 0 });
    };

    return (
        <>
            <Box p={4} maxW="1200px" mx="auto" fontFamily={isArabic ? '"Lalezar",sans_serif' : '"Outfit",sans_serif'}>
                <Heading mb={4} textAlign={isArabic ? "right" : "left"} color="secondary.700">
                    {isArabic ? "اختر واحدة من وجباتك المعدة مسبقًا" : "Pick one of your pre-designed meals"}
                </Heading>
                <Text mb={6} textAlign={isArabic ? "right" : "left"} color="brand.300">
                    {isArabic ? "مرحبًا بك في صفحة بوابة الشراء" : "Welcome to the Purchase Portal page"}
                </Text>

                <Grid 
                    templateColumns="repeat(auto-fill, minmax(300px, 1fr))" 
                    gap={3}
                >
                    {displayGroups.map((mealGroup, mealIndex) => {
                        const totals = calculateMealTotals(mealGroup);
                        const isSelected = selectedMealIndex === mealIndex;
                        
                        return (
                            <Card
                                key={mealIndex}
                                mb={6}
                                p={6}
                                border="3px solid"
                                borderColor={isSelected ? "secondary.500" : "#03685722"}
                                bg={isSelected ? "secondary.100" : "white"}
                                borderRadius="xl"
                                boxShadow={isSelected ? "xl" : "md"}
                                cursor="pointer"
                                onClick={() => handleMealSelect(mealIndex)}
                                transition="all 0.3s"
                                _hover={{
                                    borderColor: "secondary.300",
                                    transform: "translateY(-2px)",
                                    boxShadow: "lg"
                                }}
                                position="relative"
                            >
                                {/* Selection Indicator */}
                                {isSelected && (
                                    <Badge 
                                        colorScheme="secondary" 
                                        position="absolute" 
                                        top={4} 
                                        right={!isArabic ? 4 : undefined}
                                        left={isArabic ? 4 : undefined}
                                        fontSize="md"
                                        fontFamily={'"Lalezar", sans-serif'}
                                    >
                                        {isArabic ? "محدد ✓" : "Selected ✓"}
                                    </Badge>
                                )}
                                
                                <Heading size="md" mb={4} color="secondary.800">
                                    {isArabic ? `الوجبة ${mealIndex + 1}` : `Meal ${mealIndex + 1}`}
                                </Heading>
                                
                                {/* Meal Totals */}
                                <Flex justify="space-around" mb={4} p={3} bg="secondary.100" borderRadius="lg">
                                    <Box textAlign="center">
                                        <Image src={weightIcon} alt="Weight" w="20px" h="20px" mx="auto" mb={1} />
                                        <Text fontSize="sm" fontWeight="bold">{totals.weight}g</Text>
                                    </Box>
                                    <Box textAlign="center">
                                        <Image src={kcalIcon} alt="Calories" w="20px" h="20px" mx="auto" mb={1} />
                                        <Text fontSize="sm" fontWeight="bold">{totals.calories} kcal</Text>
                                    </Box>
                                    <Box textAlign="center">
                                        <Image src={proteinIcon} alt="Protein" w="20px" h="20px" mx="auto" mb={1} />
                                        <Text fontSize="sm" fontWeight="bold">{totals.protein}g</Text>
                                    </Box>
                                    <Box textAlign="center">
                                        <Image src={carbsIcon} alt="Carbs" w="20px" h="20px" mx="auto" mb={1} />
                                        <Text fontSize="sm" fontWeight="bold">{totals.carbs}g</Text>
                                    </Box>
                                    <Box textAlign="center">
                                        <Image src={fatIcon} alt="Fats" w="20px" h="20px" mx="auto" mb={1} />
                                        <Text fontSize="sm" fontWeight="bold">{totals.fats}g</Text>
                                    </Box>
                                </Flex>
                                
                                {/* Items in this meal */}
                                <VStack
                                    gap={3}
                                    maxH={'300px'}
                                    overflowY={'scroll'}
                                    overflowX={'hidden'}
                                    px={1}
                                    mx={0}
                                    alignItems={'center'}
                                >
                                    {mealGroup.map((item) => (
                                        <Box
                                            key={item.id}
                                            p={1}
                                            border="1px solid"
                                            borderColor="brand.300"
                                            borderRadius="lg"
                                            bg="white"
                                            w={'200px'}
                                        >
                                            <Flex align="center" gap={2}>
                                                <Image
                                                    src={item.image_url || extraIcon}
                                                    alt={item.name}
                                                    w="50px"
                                                    h="50px"
                                                    objectFit="cover"
                                                    borderRadius="md"
                                                />
                                                <Box flex="1">
                                                    <Text 
                                                        fontWeight="bold" 
                                                        fontSize="sm"
                                                        color="brand.800"
                                                        noOfLines={2}
                                                    >
                                                        {isArabic ? item.name_arabic : item.name}
                                                    </Text>
                                                    <Text fontSize="xs" color="brand.300">
                                                        {item.weight}g • {item.calories} kcal
                                                    </Text>
                                                </Box>
                                            </Flex>
                                        </Box>
                                    ))}
                                </VStack>
                            </Card>
                        );
                    })}
                </Grid>
                
                {/* Confirmation Section */}
                <Card 
                    p={4} 
                    mt={6} 
                    bg="white" 
                    border="1px solid" 
                    borderColor="brand.300"
                    borderRadius="xl"
                    position="sticky"
                    bottom={4}
                    boxShadow="lg"
                >
                    <Flex justify="space-between" align="center">
                        <Box>
                            <Text fontWeight="bold">
                                {isArabic ? "الوجبة المحددة:" : "Selected Meal:"}
                            </Text>
                            <Text color="secondary.600">
                                {selectedMealIndex !== null
                                    ? `${isArabic ? "الوجبة" : "Meal"} ${selectedMealIndex + 1} (${displayGroups[selectedMealIndex].length} ${isArabic ? "عناصر" : "items"})`
                                    : (isArabic ? "لم يتم الاختيار" : "None selected")
                                }
                            </Text>
                        </Box>
                        
                        <Button
                            colorScheme="secondary"
                            size="lg"
                            onClick={handleConfirmSelection}
                            isDisabled={selectedMealIndex === null}
                        >
                            {isArabic ? "تأكيد الاختيار" : "Confirm Selection"}
                        </Button>
                    </Flex>
                </Card>
            </Box>

            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} onClose={handleModalClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>{isArabic ? "تأكيد الوجبة" : "Confirm Meal"}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text mb={3}>
                            {isArabic ? "هل تريد تأكيد هذه الوجبة؟" : "Do you want to confirm this meal?"}
                        </Text>
                        <Box p={3} bg="gray.50" borderRadius="md">
                            <Text fontWeight="bold" mb={2}>
                                {isArabic ? "عناصر الوجبة:" : "Meal items:"}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                                {confirmedMeal && Array.isArray(confirmedMeal)
                                    ? confirmedMeal.map(item => (isArabic ? item.name_arabic : item.name)).join(", ")
                                    : (isArabic ? "لا عناصر" : "No items")
                                }
                            </Text>
                        </Box>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={handleModalClose}>
                            {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button colorScheme="secondary" onClick={handleModalConfirm}>
                            {isArabic ? "تأكيد" : "Confirm"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

// Enhanced main component with props
const PurchasePortal = ({ 
    subscriptionMeals, 
    onMealConfirmed,
    defaultOpen = false 
}) => {
    const { currentLanguage } = useI18nContext();
    const isArabic = currentLanguage === "ar";

    return (
        <Box>
            <Accordion allowToggle defaultIndex={defaultOpen ? [0] : []}>
                <AccordionItem border="none">
                    <AccordionButton 
                        as={Button} 
                        colorScheme="secondary" 
                        size="lg"
                        fontFamily={isArabic ? '"Lalezar", sans-serif' : '"Outfit", sans-serif'}
                        justifyContent="space-between"
                        width="100%"
                    >
                        {isArabic ? "شراء" : "Purchase"}
                        <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel p={0}>
                        <PurchasePortalContent 
                            subscriptionMeals={subscriptionMeals}
                            onMealConfirmed={onMealConfirmed}
                        />
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
        </Box>
    );
};

export default PurchasePortal;