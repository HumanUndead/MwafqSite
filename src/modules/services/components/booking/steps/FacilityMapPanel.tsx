'use client';

import { useCallback, useEffect, useRef } from 'react';
import L from 'leaflet';

import type { ServiceProviderBranch } from '@/modules/services/types/booking.types';

import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: L.LatLngTuple = [24.7136, 46.6753];
const RIYADH_LATLNG = L.latLng(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
/** Street-level zoom centered on the user pin at init. */
const USER_LOCATION_ZOOM = 15;
const SELECTED_BRANCH_ZOOM = 15;

function branchHasMapCoords(branch: ServiceProviderBranch): boolean {
  return (
    Number.isFinite(branch.latitude) && Number.isFinite(branch.longitude)
  );
}

function branchToLatLngTuple(
  branch: ServiceProviderBranch
): [number, number] | null {
  if (!branchHasMapCoords(branch)) return null;
  return [branch.latitude, branch.longitude];
}

function createFacilityMarkerIcon(selected: boolean): L.DivIcon {
  return L.divIcon({
    className: 'mwafq-facility-marker-icon',
    html: `<div class="mwafq-facility-marker${selected ? ' is-selected' : ''}" data-marker><div class="mwafq-facility-marker-pin"></div><div class="mwafq-facility-marker-dot"></div></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'mwafq-user-marker-icon',
    html: `<div class="mwafq-user-marker" data-user-marker aria-hidden="true"><div class="mwafq-user-marker-pin"></div><div class="mwafq-user-marker-dot"></div></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function upsertUserLocationMarker(
  map: L.Map,
  latlng: L.LatLng,
  label: string,
  markerRef: { current: L.Marker | null },
  latlngRef: { current: L.LatLng | null }
) {
  latlngRef.current = latlng;

  if (markerRef.current) {
    markerRef.current.setLatLng(latlng);
    markerRef.current.setPopupContent(`<b>${label}</b>`);
    return;
  }

  markerRef.current = L.marker(latlng, {
    icon: createUserLocationIcon(),
    zIndexOffset: 1000,
  }).addTo(map);
  markerRef.current.bindPopup(`<b>${label}</b>`, { closeButton: false });
}

function mapHasLayout(map: L.Map): boolean {
  const container = map.getContainer();
  return (
    container.isConnected &&
    container.clientWidth > 0 &&
    container.clientHeight > 0
  );
}

function isMapOperational(map: L.Map | null): map is L.Map {
  if (!map) return false;
  if (!mapHasLayout(map)) return false;
  return map.getPane('mapPane') != null;
}

function runMapViewOp(map: L.Map, op: () => void): boolean {
  if (!isMapOperational(map)) return false;
  try {
    op();
    return true;
  } catch {
    return false;
  }
}

function centerMapOnUser(map: L.Map, userLatLng: L.LatLng): boolean {
  return runMapViewOp(map, () => {
    map.setView(userLatLng, USER_LOCATION_ZOOM, { animate: false });
  });
}

function focusMapOnBranch(
  map: L.Map,
  branch: ServiceProviderBranch,
  animate: boolean
): boolean {
  const coords = branchToLatLngTuple(branch);
  if (!coords) return false;

  const latlng = L.latLng(coords[0], coords[1]);

  return runMapViewOp(map, () => {
    if (animate) {
      map.flyTo(latlng, SELECTED_BRANCH_ZOOM, { duration: 0.6 });
    } else {
      map.setView(latlng, SELECTED_BRANCH_ZOOM, { animate: false });
    }
  });
}

type FacilityMapPanelProps = {
  branches: ServiceProviderBranch[];
  selectedBranchId: number | null;
  userLocationLabel: string;
  userLocationFallbackLabel: string;
  onSelect: (branch: ServiceProviderBranch) => void;
};

export function FacilityMapPanel({
  branches,
  selectedBranchId,
  userLocationLabel,
  userLocationFallbackLabel,
  onSelect,
}: FacilityMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const branchMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userLatLngRef = useRef<L.LatLng | null>(null);
  const branchesRef = useRef(branches);
  const userLocationLabelRef = useRef(userLocationLabel);
  const userLocationFallbackLabelRef = useRef(userLocationFallbackLabel);
  const skipNextFitRef = useRef(false);
  const isMountedRef = useRef(true);
  const viewOpIdRef = useRef(0);
  const onSelectRef = useRef(onSelect);

  branchesRef.current = branches;
  userLocationLabelRef.current = userLocationLabel;
  userLocationFallbackLabelRef.current = userLocationFallbackLabel;
  onSelectRef.current = onSelect;

  const syncBranchMarkers = useCallback((map: L.Map) => {
    branchMarkersRef.current.forEach((marker) => marker.remove());
    branchMarkersRef.current.clear();

    branchesRef.current.forEach((branch) => {
      const coords = branchToLatLngTuple(branch);
      if (!coords) return;

      const marker = L.marker(coords, {
        icon: createFacilityMarkerIcon(false),
      }).addTo(map);

      const popupHtml = `<b>${branch.name}</b>${branch.address ? `<span>${branch.address}</span>` : ''}`;
      marker.bindPopup(popupHtml);
      marker.on('click', () => onSelectRef.current(branch));
      branchMarkersRef.current.set(branch.id, marker);
    });
  }, []);

  const requestUserCenteredView = useCallback((attempt = 0) => {
    const opId = viewOpIdRef.current;
    const map = mapRef.current;
    const MAX_ATTEMPTS = 12;

    if (!isMountedRef.current || !map) return;

    const run = () => {
      if (
        !isMountedRef.current ||
        viewOpIdRef.current !== opId ||
        !mapRef.current
      ) {
        return;
      }

      const activeMap = mapRef.current;
      if (!isMapOperational(activeMap)) {
        if (attempt < MAX_ATTEMPTS) {
          window.setTimeout(() => requestUserCenteredView(attempt + 1), 100);
        }
        return;
      }

      activeMap.invalidateSize({ animate: false });
      centerMapOnUser(activeMap, userLatLngRef.current ?? RIYADH_LATLNG);
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run);
    });
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    viewOpIdRef.current += 1;

    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: DEFAULT_CENTER,
      zoom: USER_LOCATION_ZOOM,
      zoomControl: true,
      scrollWheelZoom: false,
      minZoom: 5,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    mapRef.current = map;
    syncBranchMarkers(map);

    map.whenReady(() => {
      if (!isMountedRef.current || mapRef.current !== map) return;

      upsertUserLocationMarker(
        map,
        RIYADH_LATLNG,
        userLocationFallbackLabelRef.current,
        userMarkerRef,
        userLatLngRef
      );
      requestUserCenteredView();

      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMountedRef.current || mapRef.current !== map) return;

          const latlng = L.latLng(
            position.coords.latitude,
            position.coords.longitude
          );
          upsertUserLocationMarker(
            map,
            latlng,
            userLocationLabelRef.current,
            userMarkerRef,
            userLatLngRef
          );
          requestUserCenteredView();
        },
        () => {
          if (!isMountedRef.current || mapRef.current !== map) return;
          upsertUserLocationMarker(
            map,
            RIYADH_LATLNG,
            userLocationFallbackLabelRef.current,
            userMarkerRef,
            userLatLngRef
          );
          requestUserCenteredView();
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
      );
    });

    return () => {
      isMountedRef.current = false;
      viewOpIdRef.current += 1;
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      userLatLngRef.current = null;
      branchMarkersRef.current.forEach((marker) => marker.remove());
      branchMarkersRef.current.clear();
      map.remove();
      mapRef.current = null;
    };
  }, [requestUserCenteredView, syncBranchMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    syncBranchMarkers(map);

    if (!skipNextFitRef.current) {
      requestUserCenteredView();
    }
    skipNextFitRef.current = false;
  }, [branches, requestUserCenteredView, syncBranchMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    branchMarkersRef.current.forEach((mk, id) => {
      const selected = id === selectedBranchId;
      const inner = mk.getElement()?.querySelector('[data-marker]');
      inner?.classList.toggle('is-selected', selected);
      mk.setIcon(createFacilityMarkerIcon(selected));
    });

    if (selectedBranchId == null) return;

    const marker = branchMarkersRef.current.get(selectedBranchId);
    const branch = branches.find((b) => b.id === selectedBranchId);
    if (!marker || !branch || !branchHasMapCoords(branch)) return;

    skipNextFitRef.current = true;

    const focus = () => {
      if (!isMountedRef.current || !mapRef.current) return;
      focusMapOnBranch(mapRef.current, branch, true);
      marker.openPopup();
    };

    map.whenReady(focus);
  }, [selectedBranchId, branches]);

  return (
    <div className='relative h-full min-h-[200px] w-full bg-[#eaf3f8] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:bg-[#eaf3f8] [&_.leaflet-container]:font-[inherit] [&_.leaflet-control-attribution]:rounded-md [&_.leaflet-control-attribution]:text-[10px] [&_.leaflet-control-attribution]:text-[#6b7196] [&_.leaflet-control-zoom]:m-3 [&_.leaflet-control-zoom]:flex [&_.leaflet-control-zoom]:flex-col [&_.leaflet-control-zoom]:gap-1 [&_.leaflet-control-zoom]:border-0 [&_.leaflet-control-zoom]:shadow-none [&_.leaflet-control-zoom_a]:rounded-[10px] [&_.leaflet-control-zoom_a]:border-2 [&_.leaflet-control-zoom_a]:border-[#e5e7f0] [&_.leaflet-control-zoom_a]:bg-white [&_.leaflet-control-zoom_a]:font-extrabold [&_.leaflet-control-zoom_a]:text-[#1e2364] [&_.leaflet-control-zoom_a]:shadow-none [&_.leaflet-popup-content-wrapper]:rounded-xl [&_.leaflet-popup-content-wrapper]:border-2 [&_.leaflet-popup-content-wrapper]:border-[#e5e7f0] [&_.leaflet-popup-content-wrapper]:shadow-none [&_.leaflet-popup-content]:m-0 [&_.leaflet-popup-content]:px-3.5 [&_.leaflet-popup-content]:py-2.5 [&_.leaflet-popup-content]:text-[12.5px] [&_.leaflet-popup-content]:text-[#1e2364] [&_.leaflet-popup-content_b]:mb-0.5 [&_.leaflet-popup-content_b]:block [&_.leaflet-popup-content_b]:text-[13px] [&_.leaflet-popup-content_b]:font-extrabold [&_.leaflet-popup-content_span]:font-medium [&_.leaflet-popup-content_span]:text-[#6b7196] [&_.leaflet-popup-tip]:bg-white'>
      <div
        ref={containerRef}
        className='h-full w-full'
        aria-label='Facility map'
      />
    </div>
  );
}
