import React, { useRef, useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, Filter } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

// Custom healthy heart icon (SVG as data URI, green color)
const heartIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;utf8,<svg width='32' height='32' viewBox='0 0 32 32' fill='%2316a34a' xmlns='http://www.w3.org/2000/svg'><path d='M23.6,5.6c-2.1,0-4.1,1-5.6,2.7C16.5,6.6,14.5,5.6,12.4,5.6c-3.3,0-6,2.7-6,6c0,7.1,10,13.7,10,13.7s10-6.6,10-13.7C29.6,8.3,26.9,5.6,23.6,5.6z'/></svg>",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper for map fly animation
function FlyToLocation({ position }) {
  const map = useMap()
  React.useEffect(() => {
    if (position) {
      map.flyTo(position, 14, { duration: 1.5 })
    }
  }, [position, map])
  return null
}

export default function MapView() {
  // Kengeri, Bangalore as default
  const defaultCenter = [12.9180, 77.4758]
  const [userPosition, setUserPosition] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [healthySpots, setHealthySpots] = useState([])
  const [fetching, setFetching] = useState(true)
  const mapRef = useRef()

  // Fetch healthy spots from OSM Overpass API
  useEffect(() => {
    // Overpass QL for healthy spots in 2km radius around Kengeri or user
    const radius = 2000 // meters
    const lat = userPosition ? userPosition[0] : defaultCenter[0]
    const lon = userPosition ? userPosition[1] : defaultCenter[1]
    const query = `
      [out:json][timeout:25];
      (
        node["shop"="greengrocer"](around:${radius},${lat},${lon});
        node["shop"="supermarket"]["organic"="yes"](around:${radius},${lat},${lon});
        node["leisure"="fitness_centre"](around:${radius},${lat},${lon});
        node["leisure"="gym"](around:${radius},${lat},${lon});
      );
      out body;
    `
    const url = "https://overpass-api.de/api/interpreter"
    setFetching(true)
    fetch(url, {
      method: "POST",
      body: query,
      headers: { "Content-Type": "text/plain" }
    })
      .then(res => res.json())
      .then(data => {
        const spots = (data.elements || []).map(el => ({
          id: el.id,
          position: [el.lat, el.lon],
          type:
            el.tags.shop === "greengrocer" ||
            (el.tags.shop === "supermarket" && el.tags.organic === "yes")
              ? "Green Grocery"
              : el.tags.leisure && (el.tags.leisure === "fitness_centre" || el.tags.leisure === "gym")
              ? "Gym"
              : "Other",
          name: el.tags.name || "Unnamed",
          desc: el.tags.description || el.tags["addr:street"] || ""
        }))
        setHealthySpots(spots)
        setFetching(false)
      })
      .catch(() => {
        setError("Unable to fetch nearby healthy spots. Please try again later.")
        setFetching(false)
      })
    // eslint-disable-next-line
  }, [userPosition])

  // Geolocation
  const handleMyLocation = () => {
    setError("")
    setLoading(true)
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude]
        setUserPosition(coords)
        setLoading(false)
      },
      () => {
        setError("Unable to retrieve your location. Permission denied or unavailable.")
        setLoading(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Page title and actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-10 ml-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white mb-1">Map View</h1>
            <p className="text-emerald-300 mb-2">
              Find nearby healthy spots (organic groceries, gyms) in Kengeri, Bangalore
            </p>
          </div>
          <div className="flex space-x-3 md:mt-0 mt-4">
            <Button variant="outline" className="rounded-full px-6 font-semibold border-emerald-500 text-emerald-400 bg-transparent hover:bg-emerald-900/10 transition">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button
              className="rounded-full px-6 font-semibold bg-emerald-500 text-white hover:bg-emerald-600 shadow-none flex items-center"
              onClick={handleMyLocation}
              disabled={loading}
            >
              <Navigation className="w-4 h-4 mr-2" />
              {loading ? "Locating..." : "My Location"}
            </Button>
          </div>
        </div>

        <Card className="mt-8 mx-4 bg-[#151a23]/90 border border-emerald-600 rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-white text-lg">Interactive Map</CardTitle>
            <CardDescription className="text-emerald-200 text-sm">
              Healthy groceries and gyms are flagged below with a heart icon. Click markers for info.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl overflow-hidden" style={{ height: 400 }}>
              <MapContainer
                center={userPosition || defaultCenter}
                zoom={14}
                style={{ width: "100%", height: "100%" }}
                whenCreated={map => (mapRef.current = map)}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Healthy Spots from OSM */}
                {healthySpots.map((spot) => (
                  <Marker
                    key={spot.id}
                    position={spot.position}
                    icon={heartIcon}
                  >
                    <Popup>
                      <span className="font-bold">{spot.name}</span>
                      <br />
                      <span className="text-xs text-gray-500">{spot.type}</span>
                      <br />
                      <span className="text-xs">{spot.desc}</span>
                    </Popup>
                  </Marker>
                ))}
                {/* User's Position */}
                {userPosition && (
                  <>
                    <Marker position={userPosition}>
                      <Popup>
                        <div className="font-bold text-emerald-700">You are here</div>
                      </Popup>
                    </Marker>
                    <FlyToLocation position={userPosition} />
                  </>
                )}
              </MapContainer>
            </div>
            {fetching && (
              <div className="text-emerald-400 mt-2">Loading healthy spots from OpenStreetMap...</div>
            )}
            {error && <div className="text-red-400 mt-2">{error}</div>}
            {healthySpots.length === 0 && !fetching && !error && (
              <div className="text-gray-400 mt-2">No healthy spots found nearby.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}