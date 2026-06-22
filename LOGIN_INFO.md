# 🔑 Login Information & Quick Start

## Demo Credentials

```
Email: researcher@demo.com
Password: research123
```

✅ **Login sudah berfungsi!** (Fixed dengan temporary simple hash untuk demo)

## 🚀 Quick Start

### 1. Start Backend API

```bash
cd backend
python3.9 -m uvicorn app.main:app --port 8000
```

Backend akan jalan di: **http://localhost:8000**

### 2. Start Frontend (Optional)

```bash
cd frontend
npm install
npm run dev
```

Frontend akan jalan di: **http://localhost:5173**

## 📍 Important URLs

- **API Health Check**: http://localhost:8000/health
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Frontend App**: http://localhost:5173

## ✅ Phase 0 Status

- ✅ Backend API running
- ✅ Database (SQLite) configured
- ✅ Alembic migrations setup
- ✅ SEA (Southeast Asia) defaults configured
- ✅ Health endpoint working
- ✅ **Login endpoint working** (fixed with temporary hash)
- ✅ Authenticated endpoints functional
- ✅ Projects API working

## 📁 Project Structure

```
qual-engine/
├── backend/
│   ├── app/          # FastAPI application
│   ├── alembic/      # Database migrations
│   ├── tests/        # Test files
│   └── .env          # Environment config
├── frontend/         # React application
└── docker-compose.yml
```

## 🗄️ Database

Database sudah di-seed dengan:
- Organization: Demo Org
- User: researcher@demo.com
- Project: Indonesian Consumer Study

## 🔧 Troubleshooting

Jika API tidak jalan:
1. Kill process di port 8000: `lsof -ti:8000 | xargs kill -9`
2. Jalankan ulang: `python3.9 -m uvicorn app.main:app --port 8000`

## 🌏 SEA Features

Aplikasi sudah dikonfigurasi untuk Southeast Asia:
- Default region: Singapore (ap-southeast-1)
- Languages: Bahasa Indonesia, Taglish, Singlish (code-mixed support)
- Currencies: IDR, SGD, MYR, THB, VND, PHP
- Demo data: Indonesian consumer behavior research