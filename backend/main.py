import httpx
from fastapi import FastAPI, File, UploadFile, Request, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm # New import
from pydantic import BaseModel
from typing import List, Optional

import numpy as np
import pandas as pd
import yfinance as yf
import os
import shutil
from datetime import datetime, timedelta

from sip_modeler import run_sip_simulation
from database import SessionLocal, engine # New import
import models, auth_utils # New import

# Create uploads directory if it doesn't exist
UPLOADS_DIR = "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

models.Base.metadata.create_all(bind=engine) # New line

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Pydantic Models ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserInDB(UserCreate):
    id: int
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class Asset(BaseModel):
    name: str
    ticker: Optional[str] = None
    quantity: float

class Portfolio(BaseModel):
    assets: List[Asset]

class SimulationParams(BaseModel):
    timeHorizon: float
    monteCarloSimulations: int
    mode: str

class SimulationPayload(BaseModel):
    portfolio: Portfolio
    simulationParams: SimulationParams

class SimulationRequest(BaseModel):
    file_path: str
    column_name: Optional[str] = None
    distribution_name: str = "Normal" # New field

class TickerSimulationRequest(BaseModel):
    ticker: str
    years: int = 5
    distribution_name: str = "Normal" # New field

class ChatRequest(BaseModel):
    prompt: str

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Helper Functions ---
def get_historical_data(tickers, start_date, end_date):
    data = yf.download(tickers, start=start_date, end=end_date)['Adj Close']
    return data

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: SessionLocal = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = auth_utils.decode_access_token(token)
        if payload is None:
            raise credentials_exception
        user_id: int = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user is None:
            raise credentials_exception
        return user
    except JWTError:
        raise credentials_exception

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Vantage Backend"}

@app.post("/register", response_model=UserInDB)
async def register_user(user: UserCreate, db: SessionLocal = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth_utils.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/chat")
async def chat_completion(request: ChatRequest, http_request: Request):
    api_key = http_request.headers.get("Authorization")
    if not api_key:
        raise HTTPException(status_code=401, detail="API key missing or invalid.")
    
    # Remove "Bearer " prefix if present
    api_key = api_key.replace("Bearer ", "")

    # OpenRouter API endpoint and model (can be configured)
    OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
    OPENROUTER_MODEL = "mistralai/mistral-7b-instruct" # Example model, can be changed

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "user", "content": request.prompt}
        ]
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{OPENROUTER_API_BASE}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0 # Add a timeout for the request
            )
            response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
            
            llm_response = response.json()
            
            # Extract the content from the LLM response
            if llm_response and llm_response["choices"] and llm_response["choices"][0]["message"]["content"]:
                return {"response": llm_response["choices"][0]["message"]["content"]}
            else:
                raise HTTPException(status_code=500, detail="Invalid response from LLM API.")

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to LLM API: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"LLM API returned an error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: SessionLocal = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth_utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth_utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_utils.create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"file_path": file_path, "filename": file.filename}

@app.post("/api/run_simulation/")
async def run_simulation_from_file(request: SimulationRequest):
    results = run_sip_simulation(request.file_path, request.column_name, request.distribution_name)
    return results

@app.post("/api/run_ticker_simulation/")
async def run_ticker_simulation(request: TickerSimulationRequest):
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * request.years)
        
        # Download data
        data = yf.download(request.ticker, start=start_date, end=end_date)
        if 'Adj Close' in data.columns:
            data = data['Adj Close']
        elif 'Close' in data.columns:
            data = data['Close'] # Use Close if Adj Close is not available
        else:
            return {"error": f"Could not find relevant price data (e.g., 'Adj Close' or 'Close') for ticker {request.ticker}."}
        if data.empty:
            return {"error": f"Could not fetch historical data for ticker {request.ticker}."}
        
        # Save to a temporary file
        temp_file_path = os.path.join(UPLOADS_DIR, f"{request.ticker}_temp_data.csv")
        data.to_csv(temp_file_path)
        
        # Run simulation
        column_to_use = data.name if hasattr(data, 'name') else data.columns[0]
        results = run_sip_simulation(temp_file_path, column_to_use, request.distribution_name)
        
        # Clean up temp file
        os.remove(temp_file_path)
        
        return results
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}


@app.get("/users/me/", response_model=UserInDB)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/simulate")
async def simulate(payload: SimulationPayload):
    tickers = [asset.ticker for asset in payload.portfolio.assets if asset.ticker]
    
    end_date = pd.to_datetime('today')
    start_date = end_date - pd.DateOffset(years=5)
    
    try:
        historical_data = get_historical_data(tickers, start_date, end_date)
        if historical_data.empty:
            return {"error": "Could not fetch historical data for the given tickers."}
    except Exception as e:
        return {"error": f"An error occurred while fetching historical data: {str(e)}"}

    log_returns = np.log(historical_data / historical_data.shift(1)).dropna()
    mean_returns = log_returns.mean()
    cov_matrix = log_returns.cov()
    
    total_value = sum([asset.quantity * historical_data[asset.ticker].iloc[-1] for asset in payload.portfolio.assets if asset.ticker])
    weights = np.array([asset.quantity * historical_data[asset.ticker].iloc[-1] / total_value for asset in payload.portfolio.assets if asset.ticker])
    
    num_simulations = payload.simulationParams.monteCarloSimulations
    time_horizon = int(payload.simulationParams.timeHorizon * 252)
    
    results = np.zeros((num_simulations, time_horizon))
    
    for i in range(num_simulations):
        daily_returns = np.random.multivariate_normal(mean_returns, cov_matrix, time_horizon)
        portfolio_daily_returns = np.sum(daily_returns * weights, axis=1)
        cumulative_returns = np.cumprod(1 + portfolio_daily_returns)
        results[i, :] = cumulative_returns

    initial_portfolio_value = total_value
    ending_values = initial_portfolio_value * results[:, -1]
    
    best_case = np.max(ending_values)
    worst_case = np.min(ending_values)
    median_outcome = np.median(ending_values)
    
    confidence_interval_lower = np.percentile(ending_values, 5)
    confidence_interval_upper = np.percentile(ending_values, 95)
    
    portfolio_std_dev = np.std(np.sum(log_returns * weights, axis=1)) * np.sqrt(252)
    portfolio_return = np.sum(mean_returns * weights) * 252
    risk_free_rate = 0.02
    sharpe_ratio = (portfolio_return - risk_free_rate) / portfolio_std_dev if portfolio_std_dev != 0 else 0

    cumulative_returns_percent = (results / results[:, 0][:, np.newaxis])
    peak = np.maximum.accumulate(cumulative_returns_percent, axis=1)
    drawdown = (cumulative_returns_percent - peak) / peak
    max_drawdown = np.min(drawdown) * 100

    var_5 = np.percentile(ending_values, 5)
    cvar_5 = ending_values[ending_values <= var_5].mean()

    prob_negative_return = (np.sum(ending_values < initial_portfolio_value) / num_simulations) * 100
    
    percentiles = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    scenario_distribution = [{"percentile": p, "value": np.percentile(ending_values, p)} for p in percentiles]

    return {
        "riskScore": int(np.clip(portfolio_std_dev * 100, 0, 100)),
        "bestCase": best_case,
        "worstCase": worst_case,
        "medianOutcome": median_outcome,
        "confidenceInterval": {
            "lower": confidence_interval_lower,
            "upper": confidence_interval_upper
        },
        "sharpeRatio": sharpe_ratio,
        "maxDrawdown": max_drawdown,
        "cvar": cvar_5,
        "probNegativeReturn": prob_negative_return,
        "analysisSummary": "The simulation is based on historical data from the last 5 years and projects future performance using a Monte Carlo simulation.",
        "scenarioDistribution": scenario_distribution
    }