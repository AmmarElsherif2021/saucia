import { 
  FormControl, FormLabel, Input, Button, Flex, Switch, Textarea,
  Box, Image, useToast, Badge, Text
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { uploadImage, deleteImage } from '../../API/imageUtils'; // Adjust path as needed

const PlanForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    title_arabic: initialData.title_arabic || '',
    short_term_meals: initialData.short_term_meals || 0,
    medium_term_meals: initialData.medium_term_meals || 0,
    carb: Math.max(Number(initialData.carb) || 0),
    protein: Math.max(Number(initialData.protein) || 0),
    kcal: Math.max(Number(initialData.kcal) || 0),
    avatar_url: initialData.avatar_url || '',
    description: initialData.description || '',
    description_arabic: initialData.description_arabic || '',
    price_per_meal: initialData.price_per_meal || 0,
    is_active: initialData.is_active ?? true
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name.startsWith('title') || name.startsWith('description')
          ? value
          : Math.max(Number(value), 0),
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload JPEG, PNG, or WebP images',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum image size is 5MB',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    try {
      setIsUploading(true);
      setImageFile(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      toast({
        title: 'Image ready',
        description: 'Image will be saved when you submit the form',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Image upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let newAvatarUrl = formData.avatar_url;
      const oldAvatarUrl = formData.avatar_url;
      
      // Upload new image if exists
      if (imageFile) {
        setIsUploading(true);
        newAvatarUrl = await uploadImage(imageFile, 'plans');
      }
      
      const processedData = {
        ...formData,
        avatar_url: newAvatarUrl
      };
      
      await onSubmit(processedData);
      
      // Delete old image after successful update
      if (initialData.id && imageFile && oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
        await deleteImage(oldAvatarUrl, 'plans');
      }
    } catch (error) {
      toast({
        title: 'Form submission failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Image Upload Section */}
      <Box mb={6}>
        <FormLabel>Plan Avatar</FormLabel>
        <Flex direction="column" align="center" gap={3}>
          {imagePreview ? (
            <Image 
              src={imagePreview} 
              alt="Plan preview" 
              maxW="200px"
              maxH="150px"
              objectFit="contain"
              borderRadius="md"
              border="1px solid"
              borderColor="gray.200"
            />
          ) : (
            <Box 
              w="200px" 
              h="150px" 
              border="2px dashed" 
              borderColor="gray.300" 
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500">No Image</Text>
            </Box>
          )}
          
          <Box position="relative">
            <Button 
              as="label"
              colorScheme="blue"
              cursor="pointer"
              isLoading={isUploading}
              loadingText="Uploading..."
              size="sm"
            >
              Choose Image
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                position="absolute"
                top={0}
                left={0}
                opacity={0}
                width="100%"
                height="100%"
                cursor="pointer"
              />
            </Button>
          </Box>
          <Text fontSize="sm" color="gray.500">
            JPEG, PNG or WebP (Max 5MB)
          </Text>
        </Flex>
      </Box>

      {/* Existing form fields */}
      {[
        { label: 'Title (English)', type: 'text', name: 'title', required: true },
        { label: 'Title (Arabic)', type: 'text', name: 'title_arabic', dir: 'rtl', required: true },
        { label: 'Carbohydrates (g)', type: 'number', name: 'carb', min: 0, required: true },
        { label: 'Protein (g)', type: 'number', name: 'protein', min: 0, required: true },
        { label: 'Calories (kcal)', type: 'number', name: 'kcal', min: 0, required: true },
      ].map((input, index) => (
        <FormControl key={index} mb={4} isRequired={input.required}>
          <FormLabel>{input.label}</FormLabel>
          <Input
            type={input.type}
            name={input.name}
            value={formData[input.name]}
            onChange={handleChange}
            min={input.min}
            placeholder={input.placeholder}
            dir={input.dir}
          />
        </FormControl>
      ))}

      <FormControl mb={4}>
        <FormLabel>Description (English)</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Description (Arabic)</FormLabel>
        <Textarea
          name="description_arabic"
          value={formData.description_arabic}
          onChange={handleChange}
          placeholder="أدخل الوصف"
          dir="rtl"
        />
      </FormControl>

      <FormControl mb={4} isRequired>
        <FormLabel>Price per Meal</FormLabel>
        <Input
          type="number"
          name="price_per_meal"
          value={formData.price_per_meal}
          onChange={handleChange}
          min={0}
          placeholder="Enter price per meal"
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="is_active" mb="0">
          Active
        </FormLabel>
        <Switch
          id="is_active"
          name="is_active"
          isChecked={formData.is_active}
          onChange={handleChange}
        />
      </FormControl>

      <Flex justify="flex-end" gap={2} mt={6}>
        <Button 
          onClick={onCancel} 
          variant="outline" 
          width="20%"
          isDisabled={isUploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          colorScheme="brand" 
          width="20%"
          isLoading={isUploading}
          loadingText="Saving..."
        >
          Save Plan
        </Button>
      </Flex>
    </form>
  )
}

export default PlanForm;