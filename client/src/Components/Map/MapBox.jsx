// components/MapBox.jsx
import { useEffect, useRef, useState } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import Overlay from 'ol/Overlay'
import { toLonLat, fromLonLat } from 'ol/proj.js'
import { toStringHDMS } from 'ol/coordinate.js'
import { OSM } from 'ol/source.js'
import { Icon, Style } from 'ol/style.js'
import Feature from 'ol/Feature.js'
import { Vector as VectorSource } from 'ol/source.js'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js'
import Point from 'ol/geom/Point.js'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  useToast,
  VStack,
  HStack,
  FormHelperText
} from '@chakra-ui/react'

const markerIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
    <g id="iconCarrier">
      <path fill="#37805bff" d="M32,52.789l-12-18C18.5,32,16,28.031,16,24c0-8.836,7.164-16,16-16s16,7.164,16,16c0,4.031-2.055,8-4,10.789L32,52.789z"></path>
      <path fill="#ffd970" d="M32,0C18.746,0,8,10.746,8,24c0,5.219,1.711,10.008,4.555,13.93c0.051,0.094,0.059,0.199,0.117,0.289l16,24C29.414,63.332,30.664,64,32,64s2.586-0.668,3.328-1.781l16-24c0.059-0.09,0.066-0.195,0.117-0.289C54.289,34.008,56,29.219,56,24C56,10.746,45.254,0,32,0z M44,34.789l-12,18l-12-18C18.5,32,16,28.031,16,24c0-8.836,7.164-16,16-16s16,7.164,16,16C48,28.031,45.945,32,44,34.789z"></path>
      <circle fill="#ffd970" cx="32" cy="24" r="8"></circle>
    </g>
  </svg>
`

const MapBox = ({ onAddressSubmit }) => {
  const mapRef = useRef()
  const popupRef = useRef()
  const mapInstanceRef = useRef()
  const overlayRef = useRef()
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [label, setLabel] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [addressDetails, setAddressDetails] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    coordinates: null
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const toast = useToast()

  // Default coordinates [longitude, latitude] for Bahrain
  const defaultCoordinates = [50.1039991, 26.4367824]

  const osm = new TileLayer({
    preload: Infinity,
    source: new OSM(),
  })

  const iconFeature = new Feature({
    geometry: new Point(fromLonLat(defaultCoordinates)),
    name: 'Default Location',
  })

  const iconStyle = new Style({
    image: new Icon({
      anchor: [0.5, 46],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: 'data:image/svg+xml;utf8,' + encodeURIComponent(markerIconSvg),
    }),
  })

  iconFeature.setStyle(iconStyle)

  const vectorSource = new VectorSource({
    features: [iconFeature],
  })

  const vectorLayer = new VectorLayer({
    source: vectorSource,
  })

  // Function to get address details from coordinates
  const getAddressFromCoordinates = async (lon, lat) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()
      
      const address = {
        address_line1: data.display_name || '',
        city: data.address?.city || data.address?.town || data.address?.village || '',
        coordinates: [lat, lon]
      }
      
      setAddressDetails(address)
      return address
    } catch (error) {
      console.error('Error fetching address:', error)
      const fallbackAddress = {
        address_line1: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
        city: '',
        coordinates: [lat, lon]
      }
      setAddressDetails(fallbackAddress)
      return fallbackAddress
    }
  }

  // Function to get coordinates from address
  const getCoordinatesFromAddress = async (address) => {
    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const lon = parseFloat(data[0].lon)
        const lat = parseFloat(data[0].lat)
        const coordinate = fromLonLat([lon, lat])
        
        // Update map view
        mapInstanceRef.current.getView().animate({
          center: coordinate,
          zoom: 15,
          duration: 1000
        })
        
        // Create marker at the location
        createSelectedLocationMarker(coordinate)
        
        // Get address details
        const addressDetails = await getAddressFromCoordinates(lon, lat)
        
        // Show popup
        overlayRef.current.setPosition(coordinate)
        if (popupRef.current) {
          popupRef.current.innerHTML = `
            <div>
              <p><strong>📍 Searched Location:</strong></p>
              <p>${addressDetails.address_line1}</p>
              <p>City: ${addressDetails.city || 'Not specified'}</p>
              <code>${toStringHDMS([lon, lat])}</code>
            </div>
          `
        }
        
        toast({
          title: 'Location found',
          status: 'success',
        })
        
        return coordinate
      } else {
        toast({
          title: 'Address not found',
          description: 'Please try a different address or select the location manually on the map.',
          status: 'error',
        })
        return null
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      toast({
        title: 'Error searching address',
        status: 'error',
      })
      return null
    } finally {
      setIsSearching(false)
    }
  }

  // Function to create selected location marker
  const createSelectedLocationMarker = (coordinate) => {
    // Clear existing features except the default one
    vectorSource.clear()
    vectorSource.addFeature(iconFeature)

    // Create new marker for selected location
    const selectedLocationFeature = new Feature({
      geometry: new Point(coordinate),
      name: 'Selected Location',
    })

    const selectedLocationStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src:
          'data:image/svg+xml;base64,' +
          btoa(`
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="10" fill="#ff4444" stroke="white" stroke-width="3"/>
            <circle cx="16" cy="16" r="4" fill="white"/>
          </svg>
        `),
      }),
    })

    selectedLocationFeature.setStyle(selectedLocationStyle)
    vectorSource.addFeature(selectedLocationFeature)
    setSelectedLocation(selectedLocationFeature)
  }

  useEffect(() => {
    const overlay = new Overlay({
      element: popupRef.current,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    })
    overlayRef.current = overlay

    const map = new Map({
      target: mapRef.current,
      layers: [osm, vectorLayer],
      view: new View({
        center: fromLonLat(defaultCoordinates),
        zoom: 10,
      }),
      overlays: [overlay],
    })
    mapInstanceRef.current = map

    // Add click handler to the map
    map.on('singleclick', async function (evt) {
      const coordinate = evt.coordinate
      const lonLat = toLonLat(coordinate)
      
      // Create selected location marker
      createSelectedLocationMarker(coordinate)

      // Get address for clicked location
      const address = await getAddressFromCoordinates(lonLat[0], lonLat[1])
      const hdms = toStringHDMS(lonLat)

      // Show popup at clicked position
      overlay.setPosition(coordinate)

      if (popupRef.current) {
        popupRef.current.innerHTML = `
          <div>
            <p><strong>📍 Selected Location:</strong></p>
            <p>${address.address_line1}</p>
            <p>City: ${address.city || 'Not specified'}</p>
            <code>${hdms}</code>
            <div style="margin-top: 8px; padding: 6px; background-color: #fff3e0; border-radius: 4px; font-size: 12px;">
              <strong>📍 Location Info:</strong> Ready to add as address
            </div>
          </div>
        `
      }
    })

    // Cleanup function
    return () => {
      map.setTarget(null)
    }
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    await getCoordinatesFromAddress(searchQuery.trim())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!addressDetails.coordinates) {
      toast({
        title: 'Please select a location on the map',
        status: 'warning',
      })
      return
    }

    if (!label.trim()) {
      toast({
        title: 'Please provide a label for this address',
        status: 'warning',
      })
      return
    }

    try {
      const addressData = {
        external_id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        label: label.trim(),
        address_line1: addressDetails.address_line1,
        city: addressDetails.city,
        is_default: isDefault,
        coordinates: addressDetails.coordinates
      }

      if (onAddressSubmit) {
        await onAddressSubmit(addressData)
        
        toast({
          title: 'Address added successfully',
          status: 'success',
        })
        
        // Reset form
        setLabel('')
        setIsDefault(false)
        setAddressDetails({
          address_line1: '',
          city: '',
          coordinates: null
        })
        
        // Clear selected location
        vectorSource.clear()
        vectorSource.addFeature(iconFeature)
      }
    } catch (error) {
      toast({
        title: 'Error adding address',
        description: error.message,
        status: 'error',
      })
    }
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Address Search Input */}
        <form onSubmit={handleSearch}>
          <FormControl>
            <FormLabel>Search for an address</FormLabel>
            <HStack>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter an address to search..."
              />
              <Button 
                type="submit" 
                colorScheme="teal"
                isLoading={isSearching}
                loadingText="Searching"
              >
                Search
              </Button>
            </HStack>
            <FormHelperText>
              Enter a full address to move the map to that location
            </FormHelperText>
          </FormControl>
        </form>

        <Box>
          <div ref={mapRef} style={{ width: '100%', height: '400px', marginBottom: '16px' }} />
          <div ref={popupRef} className="ol-popup" style={popupStyle} />
          
          <div style={{ marginBottom: '16px', fontSize: '14px', color: '#666' }}>
            Click on the map to select a location for the new address
          </div>
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Address Label</FormLabel>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Home, Office, etc."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Address Line 1</FormLabel>
              <Input
                value={addressDetails.address_line1}
                
                variant="filled"
                placeholder="Select a location on the map"
              />
            </FormControl>
            <FormControl>
            <FormLabel>Address Line 2</FormLabel>
              <Input
                value={addressDetails.address_line2}
                variant="filled"
                placeholder="Select a location on the map"
              />
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Input
                value={addressDetails.city}
                variant="filled"
                placeholder="City will be auto-detected"
              />
            </FormControl>

            <FormControl>
              <Checkbox
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
              >
                Set as default address
              </Checkbox>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              isDisabled={!addressDetails.coordinates || !label.trim()}
            >
              Add Address
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  )
}

const popupStyle = {
  position: 'absolute',
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  transform: 'translate(-50%, -100%)',
  pointerEvents: 'auto',
  minWidth: '220px',
  maxWidth: '300px',
  color: 'black',
  fontSize: '14px',
}

export default MapBox