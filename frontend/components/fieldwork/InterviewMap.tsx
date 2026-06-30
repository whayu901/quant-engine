'use client';

// Leaflet map for Fieldwork QC. CLIENT-ONLY: leaflet touches `window`, so this
// module must never be server-rendered. Import it via next/dynamic with
// { ssr: false } at the call site (see the interview detail page).
//
// Markers use an inline-SVG L.divIcon (not the default PNG marker) which both
// fixes the well-known "invisible marker in bundlers" bug and lets us colour
// each pin. OSM tiles, no API key.

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Tooltip, Rectangle } from 'react-leaflet';
import type { GpsBbox } from '@/types/fieldwork';

export interface MapPoint {
  lat: number;
  lng: number;
  color: string;   // hex
  label: string;   // tooltip text
}

interface InterviewMapProps {
  points: MapPoint[];
  bbox?: GpsBbox | null;
  height?: number;
}

function pinIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'fwqc-pin',
    html: `<svg width="26" height="38" viewBox="0 0 26 38" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.82 0 0 5.82 0 13c0 9.2 13 25 13 25s13-15.8 13-25C26 5.82 20.18 0 13 0z"
            fill="${color}" stroke="#ffffff" stroke-width="2"/>
      <circle cx="13" cy="13" r="5" fill="#ffffff"/>
    </svg>`,
    iconSize: [26, 38],
    iconAnchor: [13, 38],
    tooltipAnchor: [0, -34],
  });
}

export default function InterviewMap({ points, bbox, height = 320 }: InterviewMapProps) {
  // Collect corner coordinates so the view frames every pin AND the bbox — the
  // whole point is to see out-of-area pins fall outside the rectangle.
  const corners: [number, number][] = points.map((p) => [p.lat, p.lng]);
  if (bbox) {
    corners.push([bbox.lat_min, bbox.lng_min], [bbox.lat_max, bbox.lng_max]);
  }

  const hasBounds = corners.length >= 2;
  const center: [number, number] = corners.length
    ? [corners[0][0], corners[0][1]]
    : [-6.2, 106.8];

  return (
    <MapContainer
      {...(hasBounds ? { bounds: corners as L.LatLngBoundsExpression } : { center, zoom: 12 })}
      boundsOptions={{ padding: [30, 30] }}
      style={{ height, width: '100%', borderRadius: 12 }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bbox && (
        <Rectangle
          bounds={[[bbox.lat_min, bbox.lng_min], [bbox.lat_max, bbox.lng_max]]}
          pathOptions={{ color: '#0066FF', weight: 2, fillOpacity: 0.05 }}
        />
      )}
      {points.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={pinIcon(p.color)}>
          <Tooltip>{p.label}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
