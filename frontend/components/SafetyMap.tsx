import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in React Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LOCATIONS_MOCK = [
    { id: 1, lat: 6.9271, lng: 79.8612, intensity: 0.8, name: "Colombo Fort" },
    { id: 2, lat: 6.935, lng: 79.85, intensity: 0.5, name: "Pettah" },
    { id: 3, lat: 7.2906, lng: 80.6337, intensity: 0.6, name: "Kandy Center" },
    { id: 4, lat: 6.0535, lng: 80.2210, intensity: 0.4, name: "Galle Fort" },
    { id: 5, lat: 9.6615, lng: 80.0255, intensity: 0.7, name: "Jaffna Town" },
    { id: 6, lat: 6.5, lng: 80.1, intensity: 0.3, name: "Kalutara" },
];

interface MapLocation {
    id: string | number;
    lat: number;
    lng: number;
    intensity: number;
    name?: string;
    status?: string;
}

export default function SafetyMap({ locations }: { locations?: MapLocation[] }) {
    const displayLocations = locations && locations.length > 0 ? locations : LOCATIONS_MOCK;

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-[var(--color-border)] shadow-sm z-0 relative">
            <MapContainer
                center={[7.8731, 80.7718]}
                zoom={7}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {displayLocations.filter(l => !isNaN(l.lat) && !isNaN(l.lng)).map(loc => (
                    <CircleMarker
                        key={loc.id}
                        center={[loc.lat, loc.lng]}
                        pathOptions={{
                            color: loc.intensity > 0.7 ? '#ef4444' : loc.intensity > 0.5 ? '#f59e0b' : '#3b82f6',
                            fillColor: loc.intensity > 0.7 ? '#ef4444' : loc.intensity > 0.5 ? '#f59e0b' : '#3b82f6',
                            fillOpacity: 0.5,
                            weight: 2
                        }}
                        radius={20 * loc.intensity + 10}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                            <div className="font-bold text-xs">{loc.name || `Report ${String(loc.id).slice(0, 8)}`}</div>
                            <div className="text-[10px] uppercase font-bold text-slate-500">
                                {loc.status ? `Status: ${loc.status}` : `Active Reports: ${Math.floor(loc.intensity * 10)}`}
                            </div>
                        </Tooltip>
                    </CircleMarker>
                ))}
            </MapContainer>

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg text-xs font-semibold shadow-lg z-[1000] border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-50"></div>
                    <span>High Incidence</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500 opacity-50"></div>
                    <span>Moderate</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 opacity-50"></div>
                    <span>Low/Monitoring</span>
                </div>
            </div>
        </div>
    );
}
