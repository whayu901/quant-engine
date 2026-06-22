# 📋 Testing Guide - Phase 0

## 🚀 Cara Menjalankan Aplikasi

### Opsi A: Dengan Docker (Recommended)
```bash
# Install Docker terlebih dahulu jika belum ada
# Kemudian jalankan:
docker compose up
```

### Opsi B: Manual Setup (Tanpa Docker)

#### Terminal 1: Backend API
```bash
cd backend

# Buat virtual environment (jika belum)
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env

# Run database migrations
alembic upgrade head

# Seed database dengan demo data
python seed.py

# Jalankan backend
uvicorn app.main:app --reload
```

#### Terminal 2: Celery Worker (Optional untuk Phase 0)
```bash
cd backend
source venv/bin/activate
celery -A app.celery_app worker --loglevel=info
```

#### Terminal 3: Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Cara Testing

### 1. **Cek Status Services**

```bash
# Backend API harus running di:
http://localhost:8000

# Frontend harus running di:
http://localhost:5173

# API Documentation:
http://localhost:8000/docs
```

### 2. **Test Login via Browser**

1. Buka browser: http://localhost:5173
2. Login dengan salah satu akun:
   - **Admin**: admin@demo.com / admin123
   - **Researcher**: researcher@demo.com / research123
   - **Viewer**: viewer@demo.com / viewer123

### 3. **Test API via curl**

```bash
# Health check
curl http://localhost:8000/health

# Login dan dapatkan token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=researcher@demo.com&password=research123"

# Gunakan token untuk akses API (ganti YOUR_TOKEN)
curl -X GET http://localhost:8000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. **Test Features Phase 0**

✅ **Yang harus berfungsi:**
- Login/Logout
- View Projects list
- View Project detail (Indonesian Consumer Behavior Study)
- View Transcript dengan konten code-mixed Indonesia-English
- View Analysis dengan themes
- SEA language support dalam data

✅ **Cek Demo Data:**
- Project: "Indonesian Consumer Behavior Study"
- Transcript: Focus group tentang e-commerce habits
- Content: Code-mixed (Bahasa Indonesia + English)
- Themes: Channel Preference, Payment Methods, Delivery Economics

### 5. **Run Automated Tests**

```bash
cd backend
pytest tests/test_phase0.py -v
```

Expected: 5 passed, 3 expected failures (database tables belum ada sebelum migration)

## 🔍 Troubleshooting

### Error: "Connection refused" port 8000
- Pastikan backend sudah running: `uvicorn app.main:app --reload`

### Error: "No such table"
- Run migrations: `alembic upgrade head`
- Run seed: `python seed.py`

### Error: "Module not found"
- Pastikan virtual environment aktif: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt`

### Frontend tidak bisa connect ke API
- Cek CORS settings di backend
- Pastikan .env file ada dengan CORS_ORIGINS=http://localhost:5173

## ✅ Checklist Validasi Phase 0

- [ ] Backend API running di port 8000
- [ ] Frontend running di port 5173
- [ ] Bisa login dengan demo credentials
- [ ] Demo project "Indonesian Consumer Behavior Study" muncul
- [ ] Transcript berisi konten code-mixed Indonesia-English
- [ ] Analysis menampilkan themes
- [ ] API docs accessible di /docs
- [ ] SEA configuration (currency, language) terlihat di data

## 📊 Demo Data yang Tersedia

**Organization:** Demo Research Firm (Indonesia)
- Currency: IDR
- Region: ap-southeast-3 (Jakarta)

**Users:**
- Admin (admin@demo.com)
- Researcher (researcher@demo.com)
- Viewer (viewer@demo.com)

**Project:** Indonesian Consumer Behavior Study
- Focus: Shopping habits di Jakarta dan Surabaya
- Language: Indonesian-English code-mixed

**Transcript:** Jakarta Focus Group - Session 1
- 10 segments diskusi
- Topics: Online shopping, payment methods, delivery preferences
- Real Indonesian consumer insights

**Analysis:**
- 3 themes dengan verbatims
- 5 implications untuk business strategy