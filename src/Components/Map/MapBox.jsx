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
import { useUser } from '../../Contexts/UserContext'
const markerIconSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
    <g id="iconCarrier">
      <path fill="#F76D57" d="M32,52.789l-12-18C18.5,32,16,28.031,16,24c0-8.836,7.164-16,16-16s16,7.164,16,16c0,4.031-2.055,8-4,10.789L32,52.789z"></path>
      <path fill="#ffd970" d="M32,0C18.746,0,8,10.746,8,24c0,5.219,1.711,10.008,4.555,13.93c0.051,0.094,0.059,0.199,0.117,0.289l16,24C29.414,63.332,30.664,64,32,64s2.586-0.668,3.328-1.781l16-24c0.059-0.09,0.066-0.195,0.117-0.289C54.289,34.008,56,29.219,56,24C56,10.746,45.254,0,32,0z M44,34.789l-12,18l-12-18C18.5,32,16,28.031,16,24c0-8.836,7.164-16,16-16s16,7.164,16,16C48,28.031,45.945,32,44,34.789z"></path>
      <circle fill="#ffd970" cx="32" cy="24" r="8"></circle>
    </g>
  </svg>
`
const MapBox = () => {
  const mapRef = useRef()
  const popupRef = useRef()
  const mapInstanceRef = useRef()
  const overlayRef = useRef()
  const [currentLocationMarker, setCurrentLocationMarker] = useState(null)
  const [confirmedAddress, setConfirmedAddress] = useState(null)
  const { userAddress, setUserAddress } = useUser()
  // Default coordinates [longitude, latitude] for [26.4367824, 50.1039991]
  const defaultCoordinates = [50.1039991, 26.4367824]

  const osm = new TileLayer({
    preload: Infinity,
    source: new OSM(),
  })

  const iconFeature = new Feature({
    geometry: new Point(fromLonLat(defaultCoordinates)),
    name: 'Default Location',
    population: 4000,
    rainfall: 500,
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

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lon, lat) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()
      // set context address
      setUserAddress(data)
      console.log('Address data:', userAddress)
      return data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    } catch (error) {
      console.error('Error fetching address:', error)
      return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
    }
  }

  // Function to get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const coordinate = fromLonLat([longitude, latitude])

        // Remove existing current location marker if it exists
        if (currentLocationMarker) {
          vectorSource.removeFeature(currentLocationMarker)
        }

        // Create new marker for current location
        const currentLocationFeature = new Feature({
          geometry: new Point(coordinate),
          name: 'Current Location',
        })

        const currentLocationStyle = new Style({
          image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: 'fraction',
            anchorYUnits: 'pixels',
            src:
              'data:image/svg+xml;base64,' +
              btoa(`
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="8" fill="#4285f4" stroke="white" stroke-width="4"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
            `),
          }),
        })

        currentLocationFeature.setStyle(currentLocationStyle)
        vectorSource.addFeature(currentLocationFeature)
        setCurrentLocationMarker(currentLocationFeature)

        // Center map on current location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.getView().animate({
            center: coordinate,
            zoom: 15,
            duration: 1000,
          })
        }

        // Get address and show popup
        const address = await getAddressFromCoordinates(longitude, latitude)
        const hdms = toStringHDMS([longitude, latitude])

        if (overlayRef.current && popupRef.current) {
          overlayRef.current.setPosition(coordinate)
          popupRef.current.innerHTML = `
            <div>
              <p><strong>📍 Current Location:</strong></p>
              <p>${address}</p>
              <code>${hdms}</code>
              <div style="margin-top: 8px; padding: 6px; background-color: #e3f2fd; border-radius: 4px; font-size: 12px;">
                <strong>🚚 Delivery Info:</strong> Orders can be delivered to this location
              </div>
            </div>
          `
        }
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Unable to retrieve your location. Please check your browser settings.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
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
        center: fromLonLat(defaultCoordinates), // Transform coordinates to map projection
        zoom: 10,
      }),
      overlays: [overlay],
    })
    mapInstanceRef.current = map

    // Add click handler to the map
    map.on('singleclick', async function (evt) {
      const coordinate = evt.coordinate
      const lonLat = toLonLat(coordinate)
      const hdms = toStringHDMS(lonLat)

      // Get address for clicked location
      const address = await getAddressFromCoordinates(lonLat[0], lonLat[1])

      // Show popup at clicked position
      overlay.setPosition(coordinate)

      if (popupRef.current) {
        popupRef.current.innerHTML = `
          <div>
            <p><strong>📍 You clicked here:</strong></p>
            <p>${address}</p>
            <code>${hdms}</code>
            <div style="margin-top: 8px; padding: 6px; background-color: #fff3e0; border-radius: 4px; font-size: 12px;">
              <strong>📍 Location Info:</strong> Check if delivery is available to this area
            </div>
          </div>
        `
      }
    })

    return () => map.setTarget(null)
  }, [])

  // Function to go to restaurant location
  const goToRestaurantLocation = async () => {
    const coordinate = fromLonLat(defaultCoordinates)

    // Center map on restaurant location
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getView().animate({
        center: coordinate,
        zoom: 15,
        duration: 1000,
      })
    }

    // Get address and show popup with delivery info
    const address = await getAddressFromCoordinates(defaultCoordinates[0], defaultCoordinates[1])
    const hdms = toStringHDMS(defaultCoordinates)

    if (overlayRef.current && popupRef.current) {
      overlayRef.current.setPosition(coordinate)
      popupRef.current.innerHTML = `
        <div>
          <p><strong>🍽️ Restaurant Location:</strong></p>
          <p>${address}</p>
          <code>${hdms}</code>
          <div style="margin-top: 8px; padding: 6px; background-color: #e8f5e8; border-radius: 4px; font-size: 12px;">
            <strong>📦 Delivery Available:</strong> You can order delivery from this location
          </div>
        </div>
      `
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
        <button
          onClick={getCurrentLocation}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          📍 Get My Location
        </button>
        <button
          onClick={goToRestaurantLocation}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ff6b35',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🍽️ Restaurant Location
        </button>
      </div>
      <div ref={mapRef} style={{ width: '100%', height: '400px' }} />
      <div ref={popupRef} className="ol-popup" style={popupStyle} />
    </div>
  )
}

const popupStyle = {
  position: 'absolute',
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  transform: 'translate(-50%, -100%)',
  pointerEvents: 'none',
  minWidth: '220px',
  maxWidth: '300px',
  color: 'black',
  fontSize: '14px',
}

export default MapBox
