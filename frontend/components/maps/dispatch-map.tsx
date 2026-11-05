"use client"

import { useMemo } from "react"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import type { Language } from "@/lib/contracts"
import { t } from "@/lib/i18n"

export type DispatchMapPoint = {
  id: string
  label: string
  kind: "person" | "helper"
  latitude: number
  longitude: number
  detail?: string
}

function makeIcon(kind: DispatchMapPoint["kind"]) {
  return L.divIcon({
    className: "map-icon-host",
    html: `<span class="map-pin map-pin-${kind}" aria-hidden="true"></span>`,
    iconSize: new L.Point(28, 36),
    iconAnchor: new L.Point(14, 32),
    popupAnchor: new L.Point(0, -28),
  })
}

export default function DispatchMap({ points, language }: { points: DispatchMapPoint[]; language: Language }) {
  const icons = useMemo(() => ({ person: makeIcon("person"), helper: makeIcon("helper") }), [])
  const center: [number, number] = [points[0].latitude, points[0].longitude]

  return (
    <div className="map-frame" role="region" aria-label={t(language, "mapTitle")}>
      <MapContainer center={center} zoom={points.length > 1 ? 11 : 13} scrollWheelZoom={false} className="map-canvas">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={icons[point.kind]}
            title={point.label}
            alt={point.label}
            keyboard
          >
            <Popup>
              <div className="map-popup">
                <strong>{point.label}</strong>
                {point.detail ? <span>{point.detail}</span> : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
