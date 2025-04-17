import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useTranslate } from "react-i18next"; // Import useTranslate from react-i18next

export const PROF = ({
  name = "John Doe",
  email = "john@example.com",
  phoneNumber = "+1 (555) 123-4567",
  profilePicture = "",
  orderHistory = [],
  favoriteItems = [],
  savedAddresses = [],
  dietaryPreferences = [],
  allergies = [],
  calorieTracking = { goal: 2000, current: 1500 },
  subscriptionStatus = "Premium",
  rewardPoints = 1250,
  notificationsSettings = {
    email: true,
    sms: false,
    push: true,
  },
  onUpdateProfile,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslate(); // Initialize useTranslate

  const handleGoToSettings = () => {
    navigate("/settings"); // Navigate to the settings page
  };

  return (
    <Box p={4} bg={colorMode === "dark" ? "brand.900" : "white"}>
      <Card sx={{ background: "gray.100" }} mb={4}>
        <Flex align="center" mb={4} direction={{ base: "column", md: "row" }}>
          <Avatar
            size="2xl"
            name={name}
            src={profilePicture}
            bg="brand.500"
            color="white"
            mb={{ base: 4, md: 0 }}
          />
          <Box ml={{ base: 0, md: 4 }} textAlign={{ base: "center", md: "left" }}>
            <Heading size="lg">{name}</Heading>
            <Text>{email}</Text>
            <Text>{phoneNumber}</Text>
          </Box>
          <BTN
            aria-label={t("editProfile")} // Use translation for aria-label
            icon={<EditIcon />}
            ml={{ base: 0, md: "auto" }}
            mt={{ base: 4, md: 0 }}
            onClick={onOpen}
            variant="ghost"
            colorScheme="brand"
            size="lg"
          />
        </Flex>
        <Flex
          justify={{ base: "center", md: "space-between" }}
          direction={{ base: "column", md: "row" }}
          align={{ base: "center", md: "center" }}
          gap={2}
        >
          <Badge colorScheme="accent" borderRadius="md" fontSize="md" px={3} py={1}>
            {t(subscriptionStatus)} {/* Translate subscription status */}
          </Badge>
          <Flex align="center">
            <StarIcon color="brand.500" />
            <Text ml={2} fontWeight="medium">
              {rewardPoints} {t("rewardPoints")} {/* Translate reward points */}
            </Text>
          </Flex>
        </Flex>
        <BTN
          mt={4}
          colorScheme="brand"
          onClick={handleGoToSettings}
        >
          {t("goToSettings")} {/* Translate button text */}
        </BTN>
      </Card>

      <CalorieTracker goal={calorieTracking.goal} current={calorieTracking.current} />

      <TAB items={tabsData} variant="soft-rounded" colorScheme="brand" />

      <MOD visible={isOpen} title={t("editProfile")} onClose={onClose}>
        <TXT name="name" value={formData.name} onChange={handleInputChange} label={t("name")} />
        <TXT name="email" value={formData.email} onChange={handleInputChange} label={t("email")} />
        <TXT name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} label={t("phoneNumber")} />
        <Flex justify="flex-end" mt={4}>
          <BTN variant="ghost" mr={3} onClick={onClose}>
            {t("cancel")} {/* Translate cancel button */}
          </BTN>
          <BTN colorScheme="brand" onClick={handleSubmit}>
            {t("saveChanges")} {/* Translate save changes button */}
          </BTN>
        </Flex>
      </MOD>
    </Box>
  );
};
