import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const [geoData, setGeoData] = useState(null);
  const center = [-5.358, 105.314]; 

  useEffect(() => {
    axios.get('http://localhost:8000/api/fasilitas/geojson')
      .then(res => {
        setGeoData(res.data);
      })
      .catch(err => {
        console.error("Gagal mengambil data spasial:", err);
      });
  }, []);

  const markerStyle = (feature) => {
    let color = "gray";
    
    switch (feature.properties.jenis) {
      case 'Kampus': color = "#9b59b6"; break; // Ungu
      case 'Masjid': color = "#2ecc71"; break; // Hijau
      case 'Sekolah': color = "#3498db"; break; // Biru
      case 'Rumah Sakit': color = "#e74c3c"; break; // Merah
      case 'Pelatihan': color = "#f39c12"; break; // Oranye
      default: color = "#34495e"; // Hitam/Gelap
    }

    return {
      radius: 8,
      fillColor: color,
      color: "#ffffff",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    };
  };

  const onEachFeature = (feature, layer) => {
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif;">
        <h4 style="margin: 0 0 5px 0; color: #2c3e50;">${feature.properties.nama}</h4>
        <hr/>
        <p style="margin: 5px 0;"><b>Kategori:</b> ${feature.properties.jenis}</p>
        <p style="margin: 5px 0;"><b>Alamat:</b> ${feature.properties.alamat}</p>
      </div>
    `);

    layer.on({
      mouseover: (e) => {
        const target = e.target;
        target.setStyle({
          radius: 12,
          fillColor: "yellow",
          weight: 3
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        e.target.setStyle(markerStyle(feature));
      },
      click: (e) => {
        const map = e.target._map;
        map.setView(e.latlng, 17);
      }
    });
  };

  return (
    <MapContainer 
      center={center} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {geoData && (
        <GeoJSON 
          data={geoData} 
          pointToLayer={(feature, latlng) => L.circleMarker(latlng, markerStyle(feature))}
          onEachFeature={onEachFeature}
        />
      )}
    </MapContainer>
  );
};

export default MapView;