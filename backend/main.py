import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

logging.getLogger('passlib').setLevel(logging.ERROR)

SECRET_KEY = "itera_secret_key_123140124"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__ident="2b")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserAuth(BaseModel):
    email: str
    password: str

class FasilitasCreate(BaseModel):
    nama: str
    jenis: str
    alamat: str
    longitude: float
    latitude: float

def get_db():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="sig_123140124",
            user="postgres",
            password="papadian123"
        )
        yield conn
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection failed")
    finally:
        conn.close()


@app.post("/register")
def register(user: UserAuth, conn=Depends(get_db)):
    cur = conn.cursor()
    safe_password = user.password[:72]
    hashed = pwd_context.hash(safe_password)
    try:
        cur.execute(
            "INSERT INTO users (email, password_hash) VALUES (%s, %s)", 
            (user.email.strip().lower(), hashed)
        )
        conn.commit()
        return {"message": "Registrasi berhasil"}
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
    user = cur.fetchone()
    if not user or not pwd_context.verify(form_data.password[:72], user['password_hash']):
        raise HTTPException(status_code=401, detail="Email atau password salah")
    token = jwt.encode({"sub": user['email'], "exp": datetime.utcnow() + timedelta(hours=1)}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}


@app.get("/api/fasilitas/geojson")
def get_geojson(conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=RealDictCursor)
    query = """
    SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(feature)
    ) FROM (
        SELECT jsonb_build_object(
            'type', 'Feature',
            'id', id,
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', to_jsonb(inputs) - 'geom'
        ) AS feature
        FROM public.fasilitas_publik inputs
    ) features;
    """
    cur.execute(query)
    result = cur.fetchone()
    return result['jsonb_build_object'] if result['jsonb_build_object'] else {"type": "FeatureCollection", "features": []}


@app.post("/api/fasilitas")
def create_point(data: FasilitasCreate, token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    cur = conn.cursor()
    try:
        query = """
            INSERT INTO fasilitas_publik (nama, jenis, alamat, geom) 
            VALUES (%s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326))
        """
        cur.execute(query, (data.nama, data.jenis, data.alamat, data.longitude, data.latitude))
        conn.commit()
        return {"status": "success", "message": "Data fasilitas berhasil ditambahkan"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Gagal menambah data: {str(e)}")


@app.put("/api/fasilitas/{id}")
def update_point(id: int, data: FasilitasCreate, token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    cur = conn.cursor()
    try:
        query = """
            UPDATE fasilitas_publik 
            SET nama = %s, jenis = %s, geom = ST_SetSRID(ST_Point(%s, %s), 4326)
            WHERE id = %s
        """
        cur.execute(query, (data.nama, data.jenis, data.longitude, data.latitude, id))
        conn.commit()
        return {"status": "success", "message": "Data berhasil diperbarui"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/api/fasilitas/{id}")
def delete_point(id: int, token: str = Depends(oauth2_scheme), conn=Depends(get_db)):
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM fasilitas_publik WHERE id = %s", (id,))
        conn.commit()
        return {"status": "success", "message": "Data berhasil dihapus"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
