# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Vantage for Financial Analysis is a full-stack financial simulation and analysis application. It provides Monte Carlo simulation tools, detailed investor reporting, and trade planning calculators. The application consists of a React/TypeScript frontend with a FastAPI Python backend.

## Architecture

### Frontend (React/TypeScript)
- **Framework**: React 19.1.1 with TypeScript, bundled using Vite
- **UI Library**: Material-UI (MUI) v5.15.11 with custom theming
- **Routing**: React Router DOM v7.8.2 with authentication-based routing
- **Charts**: Chart.js and Recharts for data visualization
- **Entry Point**: `index.tsx` → `App.tsx` → component routing

### Backend (FastAPI/Python)
- **Framework**: FastAPI with Uvicorn server
- **Database**: SQLAlchemy with SQLite (`backend/sql_app.db`)
- **Authentication**: JWT tokens with OAuth2 password flow
- **Key Services**:
  - File upload and processing (CSV/Excel)
  - Monte Carlo simulations via `sip_modeler.py`
  - Stock data fetching via yfinance
  - AI recommendations via OpenRouter API

### Core Application Flow
1. **Authentication**: Users register/login through JWT authentication
2. **Data Source Selection**: Choose between single asset, portfolio, or file upload
3. **Asset Definition**: Configure tickers, upload files, or define portfolios
4. **Simulation Parameters**: Set time horizon, number of simulations, and statistical distributions
5. **Monte Carlo Simulation**: Run simulations using various distributions (Normal, Log-Normal, Uniform, Beta, Empirical)
6. **Investor Report**: Generate AI-powered analysis and trading recommendations

### Key Components

#### Frontend Components
- `LandingPage.tsx`: Main simulation wizard with step-by-step flow
- `AuthContext.tsx`: Authentication state management
- `Dashboard.tsx`: User dashboard with simulation history
- `TurtleCalculator.tsx`: Position sizing calculator based on Turtle Trading system
- `InvestorReport.tsx`: Results display with charts and AI analysis
- Step components (`steps/`): Wizard flow for simulation configuration

#### Backend Modules
- `main.py`: FastAPI application with all API endpoints
- `sip_modeler.py`: Core Monte Carlo simulation engine with distribution fitting
- `models.py`: SQLAlchemy database models (User, Simulation)
- `auth_utils.py`: JWT token management and password hashing
- `database.py`: Database connection and session management

### Statistical Distributions Supported
- Normal, Log-Normal, Uniform, Beta, Empirical
- Automatic parameter fitting for uploaded datasets

## Development Commands

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server (frontend only)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate  # Windows

# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Full Stack Development
```bash
# Terminal 1: Start backend
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

# Terminal 2: Start frontend  
npm run dev
```

### Testing
```bash
# Backend testing (manual test file)
cd backend && python test_read_file.py

# No formal test suite currently exists - tests should be added
```

### Environment Setup
1. Create `.env` file in root directory with `GEMINI_API_KEY`
2. Create `backend/.env` file with `OPENROUTER_API_KEY` for AI recommendations
3. Database is automatically created on first backend startup

## File Structure
```
/
├── components/           # React components
│   ├── steps/           # Wizard step components
│   ├── common/          # Reusable components
│   └── *.tsx           # Main components
├── backend/             # Python FastAPI backend
│   ├── main.py         # Main API application
│   ├── sip_modeler.py  # Simulation engine
│   ├── models.py       # Database models
│   ├── uploads/        # File upload storage
│   └── venv/           # Python virtual environment
├── services/           # API service functions
├── public/            # Static assets
└── dist/              # Build output
```

## API Endpoints
- `POST /register` - User registration
- `POST /token` - User authentication
- `POST /api/uploadfile/` - File upload
- `POST /api/run_simulation/` - Run simulation from file
- `POST /api/run_ticker_simulation/` - Run simulation from ticker
- `POST /api/search_tickers/` - Search for stock tickers
- `POST /chat` - AI chat completions
- `GET /api/simulations/` - Get user simulation history

## Dependencies Management
- Frontend dependencies managed via npm (package.json)
- Backend dependencies in requirements.txt
- Python virtual environment recommended for backend development

## Development Notes
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 8000
- CORS is configured to allow all origins for development
- SQLite database created automatically in backend directory
- File uploads stored in `backend/uploads/` directory
- AI recommendations require OpenRouter API key