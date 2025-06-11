import { useState, useEffect, useCallback, useRef } from 'react'
import L from 'leaflet'
import { useToast } from '@chakra-ui/react'

// Import the marker images directly to fix Leaflet's default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

/**
 * Configure Leaflet icons to fix the default marker icon issue
 * This is necessary because Leaflet's default icon paths don't work with bundlers
 */
const configureLeafletIcons = () => {
  // Only configure icons in browser environment
  if (typeof window !== 'undefined') {
    // Remove the default icon URL getter
    delete L.Icon.Default.prototype._getIconUrl

    // Set the correct icon URLs
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    })
  }
}

// Initialize Leaflet icons immediately
configureLeafletIcons()

/**
 * Custom hook for managing map location functionality
 * @param {Array} initialCenter - Default map center coordinates [lat, lng]
 * @param {boolean} showUserLocation - Whether to show user location on map
 * @returns {Object} Map state and control functions
 */
export const useMapLocation = (initialCenter = [26.386145, 50.075073], showUserLocation = true) => {
  // Refs for managing map instance and cleanup state
  const mapInstance = useRef(null)
  const isCleanedUp = useRef(false)

  // State management
  const [mapReady, setMapReady] = useState(false)
  const [userPosition, setUserPosition] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [address, setAddress] = useState('')
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)

  // Toast notification hook
  const toast = useToast()

  /**
   * Safely set the map reference with cleanup of previous instances
   * @param {Object} map - Leaflet map instance
   */
  const setMapRef = useCallback((map) => {
    // Don't proceed if component is already cleaned up
    if (isCleanedUp.current) return

    // Clean up previous map instance if it's different
    if (mapInstance.current && mapInstance.current !== map) {
      try {
        // Only remove if it's actually a different map instance
        if (mapInstance.current._container && mapInstance.current._container !== map?._container) {
          mapInstance.current.remove()
        }
      } catch (error) {
        // Ignore cleanup errors as they're often harmless
        console.debug('Map cleanup warning (can be ignored):', error.message)
      }
    }

    // Set the new map instance
    mapInstance.current = map
  }, [])

  /**
   * Get user's current location using browser geolocation API
   * Also performs reverse geocoding to get human-readable address
   */
  const locateUser = useCallback(async () => {
    // Don't proceed if component is cleaned up
    if (isCleanedUp.current) return

    setIsLocating(true)

    try {
      // Get user's current position using browser geolocation
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // Use GPS if available
          timeout: 10000, // 10 second timeout
        })
      })

      // Check if component was cleaned up while waiting for geolocation
      if (isCleanedUp.current) return

      const { latitude, longitude } = position.coords
      setUserPosition([latitude, longitude])

      // Perform reverse geocoding to get address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        )

        // Check if component was cleaned up while waiting for geocoding
        if (isCleanedUp.current) return

        const data = await response.json()

        // Update address if geocoding was successful
        if (data?.display_name && !isCleanedUp.current) {
          setAddress(data.display_name)

          // Show success toast with location information
          toast({
            title: 'Location Found',
            description: `Your location: ${data.display_name}`,
            status: 'success',
            duration: 3000,
            isClosable: false,
          })
        }
      } catch (geocodeError) {
        // Handle geocoding errors silently (location still works without address)
        if (!isCleanedUp.current) {
          console.error('Geocoding error:', geocodeError)
        }
      }
    } catch (error) {
      // Handle geolocation errors
      if (!isCleanedUp.current) {
        toast({
          title: 'Location Error',
          description: error.message || 'Could not determine your location',
          status: 'error',
          duration: 3000,
          isClosable: false,
        })
      }
    } finally {
      // Reset loading state
      if (!isCleanedUp.current) {
        setIsLocating(false)
      }
    }
  }, [toast])

  /**
   * Convert coordinates to human-readable address using reverse geocoding
   * @param {Array} coordinates - [latitude, longitude] array
   * @returns {Promise<string>} Human-readable address
   */
  const getAddressFromCoordinates = useCallback(async (coordinates) => {
    if (!coordinates || coordinates.length !== 2) {
      throw new Error('Invalid coordinates provided')
    }

    setIsGeocodingAddress(true)

    try {
      const [lat, lng] = coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch address')
      }

      const data = await response.json()

      if (!data?.display_name) {
        throw new Error('No address found for these coordinates')
      }

      return data.display_name
    } catch (error) {
      console.error('Address geocoding error:', error)
      throw error
    } finally {
      setIsGeocodingAddress(false)
    }
  }, [])

  /**
   * Convert human-readable address to coordinates using forward geocoding
   * @param {string} addressText - Human-readable address
   * @returns {Promise<Array>} [latitude, longitude] array
   */
  const getLocationFromAddress = useCallback(async (addressText) => {
    if (!addressText || typeof addressText !== 'string') {
      throw new Error('Invalid address provided')
    }

    setIsGeocodingAddress(true)

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`,
      )

      if (!response.ok) {
        throw new Error('Failed to search for address')
      }

      const data = await response.json()

      if (!data || data.length === 0) {
        throw new Error('Address not found')
      }

      const location = data[0]
      return [parseFloat(location.lat), parseFloat(location.lon)]
    } catch (error) {
      console.error('Location geocoding error:', error)
      throw error
    } finally {
      setIsGeocodingAddress(false)
    }
  }, [])

  // Initialize map and auto-locate user on first mount
  useEffect(() => {
    // Don't proceed if component is cleaned up
    if (isCleanedUp.current) return

    // Mark map as ready
    setMapReady(true)

    // Auto-locate user only once when component mounts (if enabled and no position yet)
    if (showUserLocation && !userPosition) {
      const timer = setTimeout(() => {
        if (!isCleanedUp.current) {
          locateUser()
        }
      }, 500) // Small delay to ensure map is ready

      // Cleanup timer on unmount
      return () => clearTimeout(timer)
    }
  }, [showUserLocation]) // Minimal dependencies to prevent infinite loops

  /**
   * Reset map to default center position and clear address
   */
  const resetToDefault = useCallback(() => {
    // Don't proceed if component is cleaned up
    if (isCleanedUp.current) return

    setUserPosition(initialCenter)
    setAddress('')
  }, [initialCenter])

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Mark component as cleaned up
      isCleanedUp.current = true

      // Clean up map instance
      if (mapInstance.current) {
        try {
          const map = mapInstance.current
          // Only remove if map container still exists in DOM
          if (map && map._container && map._container.parentNode) {
            map.remove()
          }
        } catch (error) {
          // Ignore cleanup errors as they're often harmless
          console.debug('Map cleanup on unmount (can be ignored):', error.message)
        }
        mapInstance.current = null
      }
    }
  }, [])

  // Return all state and functions for external use
  return {
    mapReady,
    userPosition,
    isLocating,
    address,
    isGeocodingAddress,
    locateUser,
    resetToDefault,
    setMapRef,
    getAddressFromCoordinates,
    getLocationFromAddress,
    mapState: {
      center: userPosition || initialCenter,
      zoom: 13,
      scrollWheelZoom: true,
    },
  }
}

/**
 * Custom hook for recentering map view
 * @returns {Object} Map ref and recenter function
 */
export const useRecenterMap = () => {
  const mapRef = useRef(null)

  /**
   * Smoothly recenter map to new coordinates
   * @param {Array} center - New center coordinates [lat, lng]
   * @param {number} zoom - Optional zoom level
   */
  const recenter = useCallback((center, zoom) => {
    if (mapRef.current && center) {
      try {
        // Check if map is still valid before operating on it
        if (mapRef.current._container && mapRef.current._container.parentNode) {
          // Use current zoom if not specified
          const targetZoom = zoom ?? mapRef.current.getZoom()

          // Smoothly fly to new location
          if (typeof mapRef.current.flyTo === 'function') {
            mapRef.current.flyTo(center, targetZoom, {
              animate: true,
              duration: 1, // Animation duration in seconds
            })
          }
        }
      } catch (error) {
        // Log error but don't throw (map operations can be fragile)
        console.debug('Recenter error (can be ignored):', error.message)
      }
    }
  }, [])

  return { mapRef, recenter }
}
