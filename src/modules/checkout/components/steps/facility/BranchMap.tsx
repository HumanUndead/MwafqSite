'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import type { CheckoutBranch } from '../../../types/checkout.types';

const RIYADH: L.LatLngTuple = [24.7136, 46.6753];
const DEFAULT_ZOOM = 11;
const FOCUS_ZOOM = 15;

function markerIcon(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'mwafq-facility-marker-icon',
    html: `<div class="mwafq-facility-marker${selected ? ' is-selected' : ''}" data-marker><div class="mwafq-facility-marker-pin"></div><div class="mwafq-facility-marker-dot"></div></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function hasCoords(branch: CheckoutBranch): boolean {
  return Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude);
}

interface BranchMapProps {
  branches: CheckoutBranch[];
  selectedId: number | null;
  userLocation: { lat: number; lng: number } | null;
  ariaLabel: string;
  onSelect: (branch: CheckoutBranch) => void;
  /** Viewport centre after the user pans/zooms (not on programmatic moves). */
  onCenterChange: (center: { latitude: number; longitude: number }) => void;
}

/** Leaflet map of facilities. Browser-only: load with `next/dynamic`. */
export default function BranchMap({
  branches,
  selectedId,
  userLocation,
  ariaLabel,
  onSelect,
  onCenterChange,
}: BranchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const handlersRef = useRef({ onSelect, onCenterChange });
  const programmaticRef = useRef(false);

  useEffect(() => {
    handlersRef.current = { onSelect, onCenterChange };
  });

  // Create the map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const map = L.map(container, {
      center: RIYADH,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: false,
      minZoom: 5,
      maxZoom: 18,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    map.on('moveend', () => {
      if (programmaticRef.current) {
        programmaticRef.current = false;
        return;
      }
      const center = map.getCenter();
      handlersRef.current.onCenterChange({
        latitude: Math.round(center.lat * 10000) / 10000,
        longitude: Math.round(center.lng * 10000) / 10000,
      });
    });
    mapRef.current = map;
    const markers = markersRef.current;
    return () => {
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync branch markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = markersRef.current;
    markers.forEach((marker) => marker.remove());
    markers.clear();
    const bounds: L.LatLngTuple[] = [];
    for (const branch of branches) {
      if (!hasCoords(branch)) continue;
      const position: L.LatLngTuple = [branch.latitude, branch.longitude];
      bounds.push(position);
      const marker = L.marker(position, {
        icon: markerIcon(branch.id === selectedId),
        title: branch.name,
        keyboard: true,
      })
        .addTo(map)
        .bindPopup(
          `<b>${escapeHtml(branch.name)}</b>${branch.address ? `<span>${escapeHtml(branch.address)}</span>` : ''}`
        );
      marker.on('click', () => handlersRef.current.onSelect(branch));
      markers.set(branch.id, marker);
    }
    // Only auto-fit on the first set of pins, never while the user explores.
    if (bounds.length > 0 && !map.getBounds().intersects(L.latLngBounds(bounds))) {
      programmaticRef.current = true;
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: FOCUS_ZOOM });
    }
    // selectedId is handled by the next effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branches]);

  // Highlight + focus the selected branch.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((marker, id) =>
      marker.setIcon(markerIcon(id === selectedId))
    );
    if (selectedId === null) return;
    const marker = markersRef.current.get(selectedId);
    if (!marker) return;
    programmaticRef.current = true;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 13), { duration: 0.6 });
    marker.openPopup();
  }, [selectedId]);

  // User location pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation) return;
    const position = L.latLng(userLocation.lat, userLocation.lng);
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(position);
    } else {
      userMarkerRef.current = L.marker(position, {
        icon: L.divIcon({
          className: 'mwafq-user-marker-icon',
          html: '<div class="mwafq-user-marker" aria-hidden="true"><div class="mwafq-user-marker-pin"></div><div class="mwafq-user-marker-dot"></div></div>',
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        }),
        zIndexOffset: 1000,
        interactive: false,
      }).addTo(map);
    }
  }, [userLocation]);

  return (
    <div className='relative h-[420px] w-full overflow-hidden rounded-[20px] border-2 border-[#e5e7f0] bg-[#eaf3f8] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:font-[inherit] [&_.leaflet-popup-content]:m-0 [&_.leaflet-popup-content]:px-3.5 [&_.leaflet-popup-content]:py-2.5 [&_.leaflet-popup-content]:text-[12.5px] [&_.leaflet-popup-content]:text-[#1e2364] [&_.leaflet-popup-content_b]:block [&_.leaflet-popup-content_b]:font-extrabold [&_.leaflet-popup-content_span]:text-[#6b7196] [&_.leaflet-popup-content-wrapper]:rounded-xl'>
      <div ref={containerRef} className='h-full w-full' role='region' aria-label={ariaLabel} />
    </div>
  );
}
