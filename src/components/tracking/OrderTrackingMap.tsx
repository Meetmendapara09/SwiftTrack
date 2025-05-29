
"use client";
import { useEffect, useState, useRef } from 'react';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';
import { Truck, Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { LatLngExpression, Map as LeafletMapType } from 'leaflet';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full flex items-center justify-center bg-muted rounded-lg shadow">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="ml-2 text-muted-foreground">Loading map...</p>
    </div>
  ),
});
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface OrderTrackingMapProps {
  location?: { lat: number; lng: number };
  orderId?: string;
}

export function OrderTrackingMap({ location, orderId }: OrderTrackingMapProps) {
  const mapRef = useRef<LeafletMapType | null>(null);
  const [leafletGlobalsReady, setLeafletGlobalsReady] = useState(false);

  useEffect(() => {
    import('leaflet').then(LModule => {
      const L = LModule.default;
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').src,
        iconUrl: require('leaflet/dist/images/marker-icon.png').src,
        shadowUrl: require('leaflet/dist/images/marker-shadow.png').src,
      });
      setLeafletGlobalsReady(true); 
    }).catch(error => {
      console.error("Failed to load Leaflet for icon fix:", error);
    });
  }, []); 
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null; // Clear the ref
      }
    };
  }, []); 
  useEffect(() => {
    if (leafletGlobalsReady && location && mapRef.current) {
      if (mapRef.current.getContainer && mapRef.current.getContainer()) {
        const newPos: LatLngExpression = [location.lat, location.lng];
        const zoomLevel = mapRef.current.getZoom() ?? 14;
        try {
           mapRef.current.flyTo(newPos, zoomLevel);
        } catch (e) {
            console.warn("Error flying to new map location:", e);
            // Fallback if flyTo fails
            if(mapRef.current && mapRef.current.getContainer && mapRef.current.getContainer()) {
                mapRef.current.setView(newPos, zoomLevel);
            }
        }
      }
    }
  }, [location, leafletGlobalsReady]); // Depend on location and leafletGlobalsReady status

  const mapCenter: LatLngExpression = location
    ? [location.lat, location.lng]
    : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];

  if (!leafletGlobalsReady) {
    return (
      <div className="h-96 w-full flex items-center justify-center bg-muted rounded-lg shadow">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Initializing map utilities...</p>
      </div>
    );
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        key={orderId || 'leaflet-map-instance'} // A key helps React manage component instances
        center={mapCenter}
        zoom={14}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        whenCreated={mapInstance => {
          mapRef.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div className="p-1">
                <h4 className="font-semibold text-sm flex items-center">
                  <Truck size={14} className="mr-1.5 text-primary" />
                  Delivery {orderId ? `#${orderId.slice(0,6)}` : ''}
                </h4>
                <p className="text-xs text-muted-foreground">Current Location</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
