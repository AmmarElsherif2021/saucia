// Components/PlanAvatar.jsx
import { Image, Box } from '@chakra-ui/react'
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
  const imageUrl = getPlanImageUrl(plan.avatar_url, plan.title)
  
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
      {...props}
    >
      <Image
        src={imageUrl}
        alt={plan.title || 'Plan image'}
        width="100%"
        height="100%"
        borderRadius={borderRadius}
        objectFit={objectFit}
        onError={(e) => handleImageError(e, plan.title)}
      />
    </Box>
  )
}

// Specialized avatar variants for different use cases
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