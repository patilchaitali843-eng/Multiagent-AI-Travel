import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Hotel, 
  Compass, 
  Navigation, 
  Maximize2, 
  Layers, 
  Star, 
  Clock, 
  ExternalLink, 
  X,
  Plus,
  Minus,
  RotateCcw
} from 'lucide-react';
import { AccommodationOption, ActivityOption, TripRequest } from '../../shared/types.ts';

interface InteractiveTripMapProps {
  destination: string;
  selectedAccommodation: AccommodationOption;
  activities: ActivityOption[];
  currency: string;
}

// Known city center coordinates fallback dictionary
const DESTINATION_COORDS: Record<string, [number, number]> = {
  goa: [15.39, 73.88],
  mumbai: [19.0760, 72.8777],
  tokyo: [35.6762, 139.6503],
  interlaken: [46.6863, 7.8632],
  bali: [-8.4095, 115.1889],
  paris: [48.8566, 2.3522],
  london: [51.5074, -0.1278],
  delhi: [28.6139, 77.2090],
  bangkok: [13.7563, 100.5018],
  rome: [41.9028, 12.4964],
  zurich: [47.3769, 8.5417],
  jaipur: [26.9124, 75.7873],
};

// Goa specific known sub-locations for precision
const GOA_GEO_OFFSETS: Record<string, [number, number]> = {
  candolim: [15.5168, 73.7667],
  palolem: [15.0100, 74.0232],
  panjim: [15.4909, 73.8278],
  fontainhas: [15.4989, 73.8340],
  anjuna: [15.5800, 73.7420],
  nerul: [15.5030, 73.7890],
  dudhsagar: [15.3144, 74.3143],
  ponda: [15.4026, 74.0151],
  canacona: [14.9950, 74.0450],
  ashvem: [15.6560, 73.7170],
  morjim: [15.6260, 73.7370],
  benaulim: [15.2570, 73.9280],
};

function getCoordinatesForPlace(dest: string, placeName: string, locationStr: string, index: number): [number, number] {
  const destKey = dest.toLowerCase().trim();
  const base = DESTINATION_COORDS[destKey] || [15.39, 73.88];

  // If Goa, match micro-locations
  if (destKey.includes('goa')) {
    const combined = `${placeName} ${locationStr}`.toLowerCase();
    for (const [key, coords] of Object.entries(GOA_GEO_OFFSETS)) {
      if (combined.includes(key)) {
        return coords;
      }
    }
  }

  // Deterministic realistic dispersion around the base center
  // Uses trigonometric angle based on index and character codes
  const seed = (placeName.length * 17 + locationStr.length * 31 + index * 53) % 360;
  const angle = (seed * Math.PI) / 180;
  // Radius between 0.03 to 0.14 degrees (~3km to 15km)
  const radius = 0.03 + (index % 5) * 0.022;

  const latOffset = Math.sin(angle) * radius;
  const lngOffset = Math.cos(angle) * (radius * 1.1);

  return [base[0] + latOffset, base[1] + lngOffset];
}

// Haversine formula to compute distance in km
function calculateDistanceKm(c1: [number, number], c2: [number, number]): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2[0] - c1[0]) * Math.PI) / 180;
  const dLon = ((c2[1] - c1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1[0] * Math.PI) / 180) *
      Math.cos((c2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export const InteractiveTripMap: React.FC<InteractiveTripMapProps> = ({
  destination,
  selectedAccommodation,
  activities,
  currency,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  const [activePin, setActivePin] = useState<{
    type: 'hotel' | 'activity';
    data: AccommodationOption | ActivityOption;
    coords: [number, number];
    distanceFromHotel?: number;
  } | null>(null);

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState<'dark' | 'street'>('dark');

  // Compute hotel coords
  const hotelCoords = getCoordinatesForPlace(
    destination,
    selectedAccommodation.name,
    selectedAccommodation.location,
    0
  );

  // Compute activity coords
  const activityItemsWithCoords = activities.map((act, idx) => {
    const coords = getCoordinatesForPlace(destination, act.name, act.location, idx + 1);
    const dist = calculateDistanceKm(hotelCoords, coords);
    return {
      act,
      coords,
      distanceFromHotel: dist,
    };
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: hotelCoords,
        zoom: 11,
        zoomControl: false, // Custom styled zoom controls
        attributionControl: false,
      });

      // Dark Matter tile layer by CartoDB (matches premium dark UI)
      const tileUrl = mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      const tiles = L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      });
      tiles.addTo(map);

      // Attribution small text
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" class="text-slate-500 hover:text-slate-400">OpenStreetMap</a> &copy; CARTO')
        .addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    } else {
      // Update tile style if switched
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapInstanceRef.current?.removeLayer(layer);
        }
      });
      const tileUrl = mapStyle === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(mapInstanceRef.current);
    }

    return () => {
      // cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapStyle]);

  // Update Markers & Filter
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
      routeLineRef.current = null;
    }

    const bounds = L.latLngBounds([]);

    // 1. Add Hotel Marker
    if (selectedCategoryFilter === 'all' || selectedCategoryFilter === 'hotel') {
      const hotelIcon = L.divIcon({
        className: 'custom-hotel-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-2 bg-cyan-500/30 rounded-full animate-ping opacity-75"></div>
            <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-white flex items-center justify-center shadow-xl shadow-cyan-500/40 border-2 border-white ring-2 ring-cyan-400/50">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 22v-6.57"/><path d="M12 11h.01"/><path d="M12 7h.01"/><path d="M14 15.43V22"/><path d="M15 11h.01"/><path d="M15 7h.01"/><path d="M16 16h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M18 11h.01"/><path d="M18 7h.01"/><path d="M8 15.43V22"/><path d="M9 11h.01"/><path d="M9 7h.01"/></svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-md bg-slate-950/90 text-[10px] font-bold text-cyan-300 border border-cyan-500/40 shadow-lg pointer-events-none">
              Stay: ${selectedAccommodation.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const hotelMarker = L.marker(hotelCoords, { icon: hotelIcon });
      hotelMarker.on('click', () => {
        setActivePin({
          type: 'hotel',
          data: selectedAccommodation,
          coords: hotelCoords,
        });
        if (routeLineRef.current && mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
      });
      layer.addLayer(hotelMarker);
      bounds.extend(hotelCoords);
    }

    // 2. Add Activity Markers
    activityItemsWithCoords.forEach(({ act, coords, distanceFromHotel }) => {
      if (
        selectedCategoryFilter !== 'all' &&
        selectedCategoryFilter !== 'activities' &&
        act.category.toLowerCase() !== selectedCategoryFilter.toLowerCase()
      ) {
        return;
      }

      // Color coding per category
      let badgeColor = 'from-amber-400 to-orange-500 border-amber-300 text-amber-950 ring-amber-400/40';
      if (act.category === 'Adventure') badgeColor = 'from-amber-400 to-orange-500 border-amber-300 text-amber-950 ring-amber-400/40';
      else if (act.category === 'Beaches') badgeColor = 'from-sky-400 to-cyan-500 border-sky-200 text-sky-950 ring-sky-400/40';
      else if (act.category === 'Cultural') badgeColor = 'from-purple-400 to-indigo-500 border-purple-200 text-purple-950 ring-purple-400/40';
      else if (act.category === 'Nature') badgeColor = 'from-emerald-400 to-teal-500 border-emerald-200 text-emerald-950 ring-emerald-400/40';
      else if (act.category === 'Food & Culinary') badgeColor = 'from-rose-400 to-pink-500 border-rose-200 text-rose-950 ring-rose-400/40';
      else if (act.category === 'Hidden Gem') badgeColor = 'from-cyan-400 to-emerald-500 border-cyan-200 text-cyan-950 ring-cyan-400/40';

      const actIcon = L.divIcon({
        className: 'custom-act-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br ${badgeColor} flex items-center justify-center shadow-lg border-2 ring-2 transition-transform duration-200 group-hover:scale-125">
              <span class="text-[11px] font-extrabold tracking-tight font-mono">${act.category[0]}</span>
            </div>
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.2 rounded bg-slate-950/85 text-[9px] font-semibold text-slate-200 border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              ${act.name.slice(0, 18)}...
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(coords, { icon: actIcon });
      marker.on('click', () => {
        setActivePin({
          type: 'activity',
          data: act,
          coords,
          distanceFromHotel,
        });

        // Draw transit connection line between stay and this activity
        if (mapInstanceRef.current) {
          if (routeLineRef.current) {
            mapInstanceRef.current.removeLayer(routeLineRef.current);
          }
          const polyline = L.polyline([hotelCoords, coords], {
            color: '#f59e0b',
            weight: 3,
            dashArray: '6, 8',
            opacity: 0.85,
          }).addTo(mapInstanceRef.current);
          routeLineRef.current = polyline;
        }
      });

      layer.addLayer(marker);
      bounds.extend(coords);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [selectedAccommodation, activities, selectedCategoryFilter, destination]);

  // Center on hotel helper
  const handleCenterHotel = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(hotelCoords, 13, { duration: 1.2 });
      setActivePin({
        type: 'hotel',
        data: selectedAccommodation,
        coords: hotelCoords,
      });
    }
  };

  // Fit all pins helper
  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([hotelCoords, ...activityItemsWithCoords.map(a => a.coords)]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Distinct category tags for filtering
  const filterCategories = [
    { id: 'all', label: 'All Pinned Locations' },
    { id: 'hotel', label: 'Hotel / Stay Only' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'beaches', label: 'Beaches' },
    { id: 'cultural', label: 'Cultural' },
    { id: 'nature', label: 'Nature' },
    { id: 'food & culinary', label: 'Food & Culinary' },
  ];

  return (
    <section className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Navigation className="w-3.5 h-3.5" />
            <span>Interactive Geospatial Map</span>
            <span aria-hidden="true">·</span>
            <span>{activities.length + 1} Points Pinned</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Destination Map & Itinerary Exploration
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Map style toggle */}
          <button
            onClick={() => setMapStyle(mapStyle === 'dark' ? 'street' : 'dark')}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Toggle Dark / Street Map Tiles"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="capitalize">{mapStyle} Tiles</span>
          </button>

          {/* Center Hotel */}
          <button
            onClick={handleCenterHotel}
            className="px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs text-cyan-300 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Hotel className="w-3.5 h-3.5" />
            <span>Center Stay</span>
          </button>

          {/* Fit all */}
          <button
            onClick={handleFitAll}
            className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Fit All Locations in View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {filterCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
              selectedCategoryFilter === cat.id
                ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Map Canvas with overlay pin preview drawer */}
      <div className="relative w-full h-[420px] sm:h-[480px] rounded-xl overflow-hidden border border-slate-800 bg-[#0a0e17]">
        {/* Leaflet Target Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Custom Zoom Controls (Top-Right) */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitAll}
            className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
            title="Reset Map Fit"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Legend Overlay (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-10 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 space-y-1.5 shadow-xl hidden sm:block">
          <div className="font-semibold text-slate-400 uppercase text-[9px] tracking-wider mb-1">
            Map Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-cyan-400 border border-white" />
            <span>Selected Hotel ({selectedAccommodation.name.split(' ')[0]})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-white" />
            <span>Adventure / Experiences</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-400 border border-white" />
            <span>Beaches & Nature</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 border border-white" />
            <span>Culinary & Food</span>
          </div>
        </div>

        {/* Selected Pin Details Overlay Card (Top-Left / Bottom-Center) */}
        {activePin && (
          <div className="absolute top-4 left-4 z-20 w-80 sm:w-88 p-4 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                {activePin.type === 'hotel' ? (
                  <>
                    <Hotel className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-cyan-300 font-bold uppercase">Selected Accommodation</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-bold uppercase">{(activePin.data as ActivityOption).category}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => {
                  setActivePin(null);
                  if (routeLineRef.current && mapInstanceRef.current) {
                    mapInstanceRef.current.removeLayer(routeLineRef.current);
                    routeLineRef.current = null;
                  }
                }}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white leading-snug">
                {activePin.type === 'hotel'
                  ? (activePin.data as AccommodationOption).name
                  : (activePin.data as ActivityOption).name}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>
                  {activePin.type === 'hotel'
                    ? (activePin.data as AccommodationOption).location
                    : (activePin.data as ActivityOption).location}
                </span>
              </div>
            </div>

            {/* Description or Amenities */}
            {activePin.type === 'hotel' ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {(activePin.data as AccommodationOption).amenities.slice(0, 3).map((a) => (
                    <span key={a} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                      {a}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-mono text-cyan-300 font-bold text-sm">
                    {currency} {(activePin.data as AccommodationOption).pricePerNight.toLocaleString()}/night
                  </span>
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {(activePin.data as AccommodationOption).rating}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {(activePin.data as ActivityOption).description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800 font-mono">
                  <span>
                    Cost: <strong className="text-emerald-400">{(activePin.data as ActivityOption).estimatedCost === 0 ? 'Free' : `${currency} ${(activePin.data as ActivityOption).estimatedCost.toLocaleString()}`}</strong>
                  </span>
                  {activePin.distanceFromHotel !== undefined && (
                    <span className="text-amber-300">
                      ~{activePin.distanceFromHotel} km from stay
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* External Google Maps Direction Link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${activePin.type === 'hotel' ? (activePin.data as AccommodationOption).name : (activePin.data as ActivityOption).name} ${destination}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-slate-200 border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>View in External Navigation</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        )}
      </div>

      {/* Geospatial Insights Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Navigation className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            Click any pin to inspect transit distance and highlight direct travel connection from <strong>{selectedAccommodation.name}</strong>.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-400 flex-shrink-0">
          Average Sight Proximity: ~{Math.round(activityItemsWithCoords.reduce((a, b) => a + b.distanceFromHotel, 0) / (activities.length || 1))} km
        </span>
      </div>
    </section>
  );
};
