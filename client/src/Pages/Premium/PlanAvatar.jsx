// Enhanced PlanAvatar.jsx with minimal changes but better loading
import { useState, useEffect } from 'react'
import { Image, Box, Skeleton, useColorModeValue } from '@chakra-ui/react'
import { getPlanImageUrl, handleImageError } from './planImageUtils'

export const PlanAvatar = ({ 
  plan, 
  size = '80px', 
  borderRadius = 'md',
  backgroundColor = '#FCEA80',
  padding = '5px',
  objectFit = 'cover',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  
  const imageUrl = getPlanImageUrl(plan.avatar_url, plan.title)
  const skeletonStartColor = useColorModeValue('gray.300', 'gray.600')
  const skeletonEndColor = useColorModeValue('gray.100', 'gray.800')
  
  // Reset loading state when plan changes
  useEffect(() => {
    setIsLoading(true)
    setImageError(false)
    setCurrentImageUrl(imageUrl)
  }, [imageUrl, plan.id])
  
  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }
  
  const handleImageErrorWithRetry = (event) => {
    const retryCount = parseInt(event.target.getAttribute('data-retry-count') || '0')
    
    // Use enhanced error handling
    handleImageError(event, plan.title, retryCount)
    
    // Update local state
    setImageError(true)
    setIsLoading(false)
    
    // If we switched to a different image, reset loading state
    if (event.target.src !== currentImageUrl) {
      setCurrentImageUrl(event.target.src)
      setIsLoading(true)
      setImageError(false)
    }
  }
  
  return (
    <Box
      w={size}
      h={size}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius={borderRadius}
      backgroundColor={backgroundColor}
      padding={padding}
      position="relative"
      overflow="hidden"
      {...props}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          borderRadius={borderRadius}
          startColor={skeletonStartColor}
          endColor={skeletonEndColor}
        />
      )}
      
      {/* Main image */}
      <Image
        src={currentImageUrl || imageUrl}
        alt={plan.title || 'Plan image'}
        width="100%"
        height="100%"
        borderRadius={borderRadius}
        objectFit={objectFit}
        onLoad={handleImageLoad}
        onError={handleImageErrorWithRetry}
        opacity={isLoading ? 0 : (imageError ? 0.8 : 1)}
        transition="opacity 0.3s ease"
        style={{
          position: 'relative',
          zIndex: 1
        }}
      />
    </Box>
  )
}

// Specialized avatar variants (minimal changes, just use enhanced PlanAvatar)
export const CircularPlanAvatar = ({ plan, size = '80px', ...props }) => (
  <PlanAvatar 
    plan={plan} 
    size={size} 
    borderRadius="50%" 
    {...props} 
  />
)

export const CardPlanAvatar = ({ plan, ...props }) => (
  <PlanAvatar 
    plan={plan} 
    size="150px" 
    borderRadius="md" 
    backgroundColor="transparent"
    padding="0"
    {...props} 
  />
)

export const ThumbnailPlanAvatar = ({ plan, ...props }) => (
  <PlanAvatar 
    plan={plan} 
    size="40px" 
    borderRadius="sm" 
    padding="2px"
    {...props} 
  />
)

// Optional: Enhanced version with progressive loading for high-quality images
export const ProgressivePlanAvatar = ({ plan, size = '80px', ...props }) => {
  const [highResLoaded, setHighResLoaded] = useState(false)
  const [lowResLoaded, setLowResLoaded] = useState(false)
  
  const baseImageUrl = getPlanImageUrl(plan.avatar_url, plan.title)
  // Create a low-res version (you might need to modify this based on your image service)
  const lowResUrl = baseImageUrl + (baseImageUrl.includes('?') ? '&w=50' : '?w=50')
  
  return (
    <Box
      w={size}
      h={size}
      position="relative"
      borderRadius="md"
      overflow="hidden"
      {...props}
    >
      {/* Low resolution image for progressive loading */}
      {!highResLoaded && (
        <Image
          src={lowResUrl}
          alt=""
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          objectFit="cover"
          filter="blur(2px)"
          opacity={lowResLoaded ? 0.7 : 0}
          transition="opacity 0.3s ease"
          onLoad={() => setLowResLoaded(true)}
          onError={() => setLowResLoaded(false)}
        />
      )}
      
      {/* High resolution image */}
      <Image
        src={baseImageUrl}
        alt={plan.title || 'Plan image'}
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        objectFit="cover"
        opacity={highResLoaded ? 1 : 0}
        transition="opacity 0.5s ease"
        onLoad={() => setHighResLoaded(true)}
        onError={(e) => handleImageError(e, plan.title)}
      />
      
      {/* Loading skeleton for when neither image has loaded */}
      {!highResLoaded && !lowResLoaded && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
        />
      )}
    </Box>
  )
}