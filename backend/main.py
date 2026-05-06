import psycopg2 # BARIS INI YANG KURANG
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Tambahkan CORS agar React (port 5173) bisa memanggil API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="sig_123140124",
        user="postgres",
        password="papadian123",
        port="5432"
    )
    return conn

@app.get("/api/fasilitas/geojson")
async def get_geojson():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # GANTI 'nama_tabel_kamu' dengan nama tabel asli di pgAdmin!
        query = """
        SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(feature)
        ) FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(geom)::jsonb,
                'properties', to_jsonb(inputs) - 'geom'
            ) AS feature
            FROM (SELECT * FROM fasilitas_publik) inputs
        ) features;
        """
        cur.execute(query)
        result = cur.fetchone()
        cur.close()
        conn.close()
        return result['jsonb_build_object']
    except Exception as e:
        return {"error": str(e)}