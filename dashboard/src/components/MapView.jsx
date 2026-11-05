import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function popup(title, lines) {
  const d = document.createElement("div");
  const b = document.createElement("b");
  b.textContent = title;
  d.appendChild(b);
  lines.forEach((l) => {
    const p = document.createElement("div");
    p.textContent = l;
    d.appendChild(p);
  });
  return d;
}

export default function MapView({ people, helpers, shelters }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const fitted = useRef(false);

  useEffect(() => {
    map.current = L.map(el.current).setView([26.45, 80.33], 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    layer.current.clearLayers();
    const pts = [];
    const dot = (pos, color, radius, pop) => {
      pts.push(pos);
      L.circleMarker(pos, { radius, color, fillColor: color, fillOpacity: 0.85, weight: 2 })
        .bindPopup(pop).addTo(layer.current);
    };
    people.filter((p) => p.lat != null && p.lat !== 0).forEach((p) => {
      const color = p.needs_help ? "#dc2626" : p.priority_score >= 60 ? "#ea580c" : "#ca8a04";
      dot([p.lat, p.lon], color, 10, popup(p.name, [`Priority ${p.priority_score}`, `Helpers: ${p.helpers.join(", ") || "none"}`]));
    });
    helpers.forEach((h) => {
      const color = h.status === "unreachable" ? "#6b7280" : "#2563eb";
      dot([h.lat, h.lon], color, 7, popup(h.name, [`Status: ${h.status}`, `Skills: ${h.skills || "none"}`]));
    });
    shelters.forEach((s) => {
      dot([s.lat, s.lon], "#16a34a", 8, popup(s.name, [`${s.occupancy}/${s.capacity} occupied`, s.accessible ? "Accessible" : "Not accessible"]));
    });
    if (!fitted.current && pts.length) {
      map.current.fitBounds(pts, { padding: [30, 30], maxZoom: 15 });
      fitted.current = true;
    }
  }, [people, helpers, shelters]);

  return (
    <div>
      <div ref={el} className="map" />
      <div className="legend">
        <span><i style={{ background: "#dc2626" }} />Needs help</span>
        <span><i style={{ background: "#ea580c" }} />High priority</span>
        <span><i style={{ background: "#ca8a04" }} />Person</span>
        <span><i style={{ background: "#2563eb" }} />Helper</span>
        <span><i style={{ background: "#6b7280" }} />Silent helper</span>
        <span><i style={{ background: "#16a34a" }} />Shelter</span>
      </div>
      <p className="muted small">People appear on the map only while an event is active.</p>
    </div>
  );
}
