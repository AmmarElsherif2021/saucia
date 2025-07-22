
import dailyMealPlanImage from '../..//assets/premium/dailymealplan.png'
import saladsPlanImage from '../../assets/premium/proteinsaladplan.png'
import nonProteinSaladsPlanImage from '../../assets/premium/nonproteinsaladplan.png'
import gainWeightPlanImage from '../../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../../assets/premium/loseWeight.png'
import planIcon from '../../assets/premium/planIcon.svg'

// Map plan titles to fallback images
const planImages = {
  'Protein Salad Plan': saladsPlanImage,
  'Non-Protein Salad Plan': nonProteinSaladsPlanImage,
  'Daily Plan': dailyMealPlanImage,
  'Gain Weight': gainWeightPlanImage,
  'Keep Weight': keepWeightPlanImage,
  'Lose Weight': loseWeightPlanImage,
}

/**
 * Gets the full URL for a plan's avatar image from Supabase storage
 * @param {string} avatarUrl - The avatar_url from the plan object
 * @param {string} planTitle - The plan title for fallback image selection
 * @returns {string} - The full image URL
 */
export const getPlanImageUrl = (avatarUrl, planTitle = '') => {
  // If no avatar URL provided, use fallback based on title
  if (!avatarUrl) {
    return getPlanFallbackImage(planTitle)
  }
  
  // If it's already a full URL (http/https), return as is
  if (avatarUrl.startsWith('http')) {
    return avatarUrl
  }
  
  // Construct full URL for Supabase storage
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const bucket = 'plans' // Your bucket name
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${avatarUrl}`
}

/**
 * Gets fallback image based on plan title
 * @param {string} planTitle - The plan title
 * @returns {string} - The fallback image path
 */
export const getPlanFallbackImage = (planTitle = '') => {
  // Check for exact matches first
  if (planImages[planTitle]) {
    return planImages[planTitle]
  }
  
  // Check for partial matches
  for (const [key, image] of Object.entries(planImages)) {
    if (planTitle.toLowerCase().includes(key.toLowerCase())) {
      return image
    }
  }
  
  // Default fallback
  return dailyMealPlanImage
}

/**
 * Error handler for image loading failures
 * @param {Event} e - The error event
 * @param {string} planTitle - The plan title for fallback selection
 */
export const handleImageError = (e, planTitle = '') => {
  e.target.src = getPlanFallbackImage(planTitle)
}

/**
 * Creates a complete plan object with image URL
 * @param {Object} plan - The plan object from the API
 * @returns {Object} - Plan object with image property
 */
export const enrichPlanWithImage = (plan) => ({
  ...plan,
  image: getPlanImageUrl(plan.avatar_url, plan.title)
})

/**
 * Processes an array of plans to include image URLs
 * @param {Array} plans - Array of plan objects
 * @returns {Array} - Array of plans with image properties
 */
export const enrichPlansWithImages = (plans = []) => 
  plans.map(enrichPlanWithImage)