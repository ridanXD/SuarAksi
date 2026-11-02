"use client";

import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface ReportMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  isInteractive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
}

export function ReportMap({
  latitude,
  longitude,
  address,
  isInteractive = false,
  onLocationChange,
  height = "240px",
}: ReportMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const customIcon = L.divIcon({
          html: `<div style="background-color: #DC2626; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: "",
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 15,
          zoomControl: isInteractive,
          attributionControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([latitude, longitude], {
          icon: customIcon,
          draggable: isInteractive,
        }).addTo(map);

        if (address) {
          marker.bindPopup(`<b>Lokasi Kejadian</b><br/>${address}`).openPopup();
        }

        if (isInteractive) {
          map.on("click", (e: any) => {
            const { lat, lng } = e.latlng;
            marker.setLatLng([lat, lng]);
            if (onLocationChange) {
              onLocationChange(lat, lng);
            }
          });

          marker.on("dragend", () => {
            const latLng = marker.getLatLng();
            if (onLocationChange) {
              onLocationChange(latLng.lat, latLng.lng);
            }
          });
        }

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.setView([latitude, longitude], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          if (address) {
            markerRef.current.setPopupContent(`<b>Lokasi Kejadian</b><br/>${address}`);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, isInteractive, address, onLocationChange]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%" }}
      className="rounded-lg overflow-hidden border border-surface-200 z-0"
    />
  );
}
