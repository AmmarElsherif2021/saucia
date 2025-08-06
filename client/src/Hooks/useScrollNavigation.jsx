import { useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

export const useScrollNavigation = (sectionRefs) => {
  const location = useLocation()

  const scrollToSection = useCallback((sectionName) => {
    const ref = sectionRefs[sectionName]
    if (ref && ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      })
    }
  }, [sectionRefs])

  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      // Add a small delay to ensure component is mounted
      const timer = setTimeout(() => {
        scrollToSection(location.state.scrollTo)
        
        // Clear the state to prevent re-scrolling on subsequent renders
        window.history.replaceState({}, document.title)
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [location, scrollToSection])

  return { scrollToSection }
}