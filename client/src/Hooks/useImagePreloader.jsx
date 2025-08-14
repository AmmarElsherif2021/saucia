import { useState, useEffect } from 'react'
import { preloadAllPlanImages } from './planImageUtils'

export const useImagePreloader = (autoStart = true) => {
  const [preloadStatus, setPreloadStatus] = useState({
    isLoading: false,
    isComplete: false,
    successCount: 0,
    totalCount: 0,
    errors: []
  })

  const startPreloading = async () => {
    if (preloadStatus.isLoading) return // Prevent multiple simultaneous preloads
    
    setPreloadStatus(prev => ({ ...prev, isLoading: true }))
    
    try {
      const results = await preloadAllPlanImages()
      const successful = results.filter(result => result.status === 'fulfilled')
      const failed = results.filter(result => result.status === 'rejected')
      
      setPreloadStatus({
        isLoading: false,
        isComplete: true,
        successCount: successful.length,
        totalCount: results.length,
        errors: failed.map(f => f.reason?.message || 'Unknown error')
      })
    } catch (error) {
      setPreloadStatus(prev => ({
        ...prev,
        isLoading: false,
        errors: [...prev.errors, error.message]
      }))
    }
  }

  // Auto-start preloading when component mounts
  useEffect(() => {
    if (autoStart) {
      // Small delay to not block initial render
      const timer = setTimeout(startPreloading, 100)
      return () => clearTimeout(timer)
    }
  }, [autoStart])

  return {
    ...preloadStatus,
    startPreloading
  }
}

// Simple component to add to your app root for preloading
export const ImagePreloader = ({ children }) => {
  const { isLoading, isComplete, successCount, totalCount } = useImagePreloader(true)
  
  // Optional: Log preload status for debugging
  useEffect(() => {
    if (isComplete) {
      console.log(`Plan images preloaded: ${successCount}/${totalCount}`)
    }
  }, [isComplete, successCount, totalCount])
  
  return children // This component doesn't render anything visible
}