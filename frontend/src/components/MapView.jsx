import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  const [geoData, setGeoData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  const [formData, setFormData] = useState({
    nama: '',
    jenis: 'Sekolah',
    lat: 0,
    lng: 0
  });

  const center = [-5.358, 105.314];

  // FETCH DATA
  const fetchData = () => {
    const token = localStorage.getItem('token');

    axios.get('http://localhost:8000/api/fasilitas/geojson', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setGeoData(res.data))
    .catch(err => console.error('Gagal mengambil data spasial:', err));
  };

  useEffect(() => { fetchData(); }, []);

  // MAP CLICK
  const MapEvents = () => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setFormData({ ...formData, lat, lng });
        setShowModal(true);
      }
    });

    return null;
  };

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      await axios.post('http://localhost:8000/api/fasilitas',
        {
          nama: formData.nama,
          jenis: formData.jenis,
          alamat: 'Lampung Selatan',
          longitude: formData.lng,
          latitude: formData.lat
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Data Berhasil Ditambahkan!');
      setShowModal(false);
      setFormData({ ...formData, nama: '' });
      fetchData();

    } catch (err) {
      alert('Gagal menambah data. Pastikan Anda sudah login.');
    }
  };

  // UPDATE
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      await axios.put(
        `http://localhost:8000/api/fasilitas/${selectedFeature.id}`,
        {
          nama: selectedFeature.nama,
          jenis: selectedFeature.jenis,
          alamat: 'Lampung Selatan',
          longitude: selectedFeature.lng,
          latitude: selectedFeature.lat
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Data berhasil diperbarui!');
      setShowEditModal(false);
      fetchData();

    } catch (err) {
      alert('Gagal update data');
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus fasilitas ini?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(
        `http://localhost:8000/api/fasilitas/${selectedFeature.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Data berhasil dihapus!');
      setShowEditModal(false);
      fetchData();

    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  // MARKER STYLE
  const markerStyle = (feature) => {
    let color = 'gray';

    switch (feature.properties.jenis) {
      case 'Kampus': color = '#9b59b6'; break;
      case 'Masjid': color = '#2ecc71'; break;
      case 'Sekolah': color = '#3498db'; break;
      case 'Rumah Sakit': color = '#e74c3c'; break;
      case 'Pelatihan': color = '#f39c12'; break;
      default: color = '#34495e';
    }

    return {
      radius: 8,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.9
    };
  };

  // FEATURE
  const onEachFeature = (feature, layer) => {
    layer.bindPopup(`
      <div style="font-family: Arial, sans-serif;">
        <h4 style="margin:0 0 5px 0; color:#2c3e50;">${feature.properties.nama}</h4>
        <hr/>
        <p style="margin:5px 0;"><b>Kategori:</b> ${feature.properties.jenis}</p>
        <p style="margin:5px 0;"><b>Alamat:</b> ${feature.properties.alamat}</p>
        <small style="color:#64748b;">Klik marker untuk edit</small>
      </div>
    `);

    layer.on({
      mouseover: (e) => {
        e.target.setStyle({
          radius: 12,
          fillColor: 'yellow',
          weight: 3
        });

        e.target.bringToFront();
      },

      mouseout: (e) => {
        e.target.setStyle(markerStyle(feature));
      },

      click: (e) => {
        L.DomEvent.stopPropagation(e);

        const props = feature.properties;

        setSelectedFeature({
          id: props.id,
          nama: props.nama,
          jenis: props.jenis,
          alamat: props.alamat,
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });

        setShowEditModal(true);
      }
    });
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>

      {/* MAP */}
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <MapEvents />

        {geoData && (
          <GeoJSON
            key={JSON.stringify(geoData)}
            data={geoData}
            pointToLayer={(feature, latlng) => L.circleMarker(latlng, markerStyle(feature))}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* MODAL TAMBAH */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={titleStyle}>Tambah Fasilitas</h3>

            <form onSubmit={handleSubmit}>
              <label style={labelStyle}>Nama Fasilitas</label>

              <input
                type="text"
                required
                placeholder="Masukkan Nama"
                style={inputStyle}
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />

              <label style={labelStyle}>Kategori / Jenis</label>

              <select
                style={inputStyle}
                value={formData.jenis}
                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
              >
                <option value="Sekolah">Sekolah</option>
                <option value="Kampus">Kampus</option>
                <option value="Masjid">Masjid</option>
                <option value="Rumah Sakit">Rumah Sakit</option>
                <option value="Pelatihan">Pelatihan</option>
              </select>

              <div style={locationStyle}>
                Lokasi: {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
              </div>

              <div style={buttonGroupStyle}>
                <button type="submit" style={saveButtonStyle}>Simpan</button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={cancelButtonStyle}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {showEditModal && selectedFeature && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3 style={titleStyle}>Edit Fasilitas</h3>

            <form onSubmit={handleUpdate}>
              <label style={labelStyle}>Nama Fasilitas</label>

              <input
                type="text"
                required
                value={selectedFeature.nama}
                onChange={(e) => setSelectedFeature({ ...selectedFeature, nama: e.target.value })}
                style={inputStyle}
              />

              <label style={labelStyle}>Kategori / Jenis</label>

              <select
                value={selectedFeature.jenis}
                onChange={(e) => setSelectedFeature({ ...selectedFeature, jenis: e.target.value })}
                style={inputStyle}
              >
                <option value="Sekolah">Sekolah</option>
                <option value="Kampus">Kampus</option>
                <option value="Masjid">Masjid</option>
                <option value="Rumah Sakit">Rumah Sakit</option>
                <option value="Pelatihan">Pelatihan</option>
              </select>

              <div style={locationStyle}>
                Lokasi: {selectedFeature.lat.toFixed(5)}, {selectedFeature.lng.toFixed(5)}
              </div>

              <div style={buttonGroupStyle}>
                <button type="submit" style={saveButtonStyle}>Simpan</button>

                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={cancelButtonStyle}
                >
                  Batal
                </button>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                style={deleteButtonStyle}
              >
                Hapus Fasilitas Ini
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// STYLES
const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 2000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const modalStyle = {
  background: 'white',
  padding: '2rem',
  borderRadius: '12px',
  width: '380px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const titleStyle = {
  margin: '0 0 1.5rem 0',
  color: '#1e293b'
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontSize: '14px',
  fontWeight: 'bold'
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e0',
  boxSizing: 'border-box'
};

const locationStyle = {
  padding: '10px',
  background: '#f1f5f9',
  borderRadius: '6px',
  fontSize: '12px',
  color: '#64748b',
  marginBottom: '1.5rem'
};

const buttonGroupStyle = {
  display: 'flex',
  gap: '10px'
};

const saveButtonStyle = {
  flex: 1,
  padding: '12px',
  background: '#22c55e',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const cancelButtonStyle = {
  flex: 1,
  padding: '12px',
  background: '#94a3b8',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

const deleteButtonStyle = {
  width: '100%',
  marginTop: '10px',
  padding: '12px',
  background: '#ef4444',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default MapView;
