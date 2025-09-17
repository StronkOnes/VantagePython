import httpx
from fastapi import FastAPI, File, UploadFile, Request, HTTPException, Depends, status
from fastapi.responses import JSONResponse
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
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from sip_backtester import run_sip_simulation, DISTRIBUTIONS
from backtester import BacktesterSimulator, SIP, SLURP # Renamed import
from strategy_optimiser import StrategyOptimiser



from scipy.stats import norm, uniform, lognorm, beta
from database import SessionLocal, engine # New import
from jose import JWTError # New import
import models, auth_utils # New import

# Create uploads directory if it doesn't exist
UPLOADS_DIR = "uploads"
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

models.Base.metadata.create_all(bind=engine) # New line

app = FastAPI()

@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    if request.method == "OPTIONS":
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, DELETE, PUT"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={"Access-Control-Allow-Origin": "*"},
    )

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    return {"message": "ok"}

# --- Pydantic Models ---
class UserCreate(BaseModel):
    email: str
    password: str
    registration_code: str

class UserInDB(UserCreate):
    id: int
    is_active: bool

class Token(BaseModel):
    access_token: str
    token_type: str

class SimulationParams(BaseModel):
    timeHorizon: float
    monteCarloSimulations: int
    mode: str
    distribution_name: str = "Normal" # New field

class SimulationRequest(BaseModel):
    file_path: str
    column_name: Optional[str] = None
    distribution_name: str = "Normal" # New field

class TickerSimulationRequest(BaseModel):
    ticker: str
    years: int = 5
    distribution_name: str = "Normal" # New field

class TickerSearchRequest(BaseModel):
    query: str

class TickerSearchResult(BaseModel):
    ticker: str
    name: str

class ChatRequest(BaseModel):
    prompt: str

class BacktesterSimulationRequest(BaseModel):
    ticker: str
    years: int = 5
    take_profit_pct: Optional[float] = None
    stop_loss_pct: Optional[float] = None
    num_trials: int = 10000
    use_slurp: bool = False
    slurp_columns: Optional[List[str]] = None
    forecast_horizon: int = 5
    entry_long_percentile: float = 0.75
    entry_short_percentile: float = 0.25
    exit_long_percentile: float = 0.25
    exit_short_percentile: float = 0.75
    entry_threshold_factor: float = 1.005
    exit_threshold_factor: float = 0.995


class StrategyOptimiserRequest(BaseModel):
    ticker: str
    years: int = 5
    num_simulations: int = 1000 # User can pick number of simulations from 1000 upwards
    volatility_lookback_days: int = 20
    return_distribution_percentiles: List[float] = [0.05, 0.1, 0.25, 0.75, 0.9, 0.95] # Added 0.1 and 0.9
    strategy_count: int = 5 # Number of strategies to generate and rank





# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Helper Functions ---
async def get_ai_recommendation(prompt: str) -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    print(f"Using API Key: {api_key}") # DEBUG
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY environment variable not set.")

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
            {"role": "user", "content": prompt}
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
                return llm_response["choices"][0]["message"]["content"]
            else:
                raise HTTPException(status_code=500, detail="Invalid response from LLM API.")

    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to LLM API: {e}")
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=f"LLM API returned an error: {e.response.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: SessionLocal = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token: # Added check for empty token
        raise credentials_exception
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
    if user.registration_code != "VANTAGE2025":
        raise HTTPException(status_code=400, detail="Invalid registration code")
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
async def chat_completion(request: ChatRequest):
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY environment variable not set.")

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
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

class CsvColumnsRequest(BaseModel):
    file_path: str

@app.post("/api/get_csv_columns/")
async def get_csv_columns(request: CsvColumnsRequest):
    """Get CSV columns without authentication for simplified workflow"""
    try:
        df = pd.read_csv(request.file_path)
        return {"columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read CSV file: {str(e)}")

@app.post("/api/uploadfile/")
async def create_upload_file(file: UploadFile = File(...)):
    """Simplified file upload without authentication for typical use cases"""
    file_path = os.path.join(UPLOADS_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"file_path": file_path, "filename": file.filename}

@app.post("/api/run_simulation/")
async def run_simulation_from_file(request: SimulationRequest, db: SessionLocal = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    results = run_sip_simulation(request.file_path, request.column_name, request.distribution_name)
    
    prompt = f"""Based on the following Monte Carlo simulation results, provide a comprehensive investment recommendation for a user with a moderate risk tolerance.

Simulation Details:
- Data Source: User-uploaded file
- Distribution Used: {request.distribution_name}
- File: {request.file_path}
- Column: {request.column_name or 'First column'}

Summary Statistics:
{results['summary_stats']}

Please provide:
1. Key insights about the risk-return profile
2. What the chosen {request.distribution_name} distribution tells us about the data characteristics
3. Specific investment strategies based on these results
4. Risk management recommendations
5. Position sizing considerations

Keep the response practical and actionable for an investor."""
    ai_recommendation = await get_ai_recommendation(prompt)

    db_simulation = models.Simulation(
        user_id=current_user.id,
        simulation_mode="file",
        simulation_params=request.dict(),
        summary_stats=results['summary_stats'],
        ai_recommendation=ai_recommendation,
    )
    db.add(db_simulation)
    db.commit()

    results['ai_recommendation'] = ai_recommendation
    return results

@app.post("/api/run_ticker_simulation/")
async def run_ticker_simulation(request: TickerSimulationRequest, db: SessionLocal = Depends(get_db), current_user: models.User = Depends(get_current_user)):
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

        prompt = f"""Based on the following Monte Carlo simulation results, provide a comprehensive investment recommendation for a user with a moderate risk tolerance.

Simulation Details:
- Asset: {request.ticker}
- Data Source: {request.years} years of historical price data
- Distribution Used: {request.distribution_name}
- Analysis Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}

Summary Statistics:
{results['summary_stats']}

Please provide:
1. Key insights about {request.ticker}'s risk-return profile
2. How the {request.distribution_name} distribution captures this asset's behavior
3. Specific investment strategies for {request.ticker}
4. Risk management recommendations
5. Position sizing and portfolio allocation guidance
6. Market timing considerations if relevant

Keep the response practical and actionable for an investor considering {request.ticker}."""
        ai_recommendation = await get_ai_recommendation(prompt)

        db_simulation = models.Simulation(
            user_id=current_user.id,
            simulation_mode="ticker",
            simulation_params=request.dict(),
            summary_stats=results['summary_stats'],
            ai_recommendation=ai_recommendation,
        )
        db.add(db_simulation)
        db.commit()

        results['ai_recommendation'] = ai_recommendation
        
        return results
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}



@app.post("/users/me/", response_model=UserInDB)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/api/search_tickers/", response_model=List[TickerSearchResult])
async def search_tickers(request: TickerSearchRequest):
    try:
        # Attempt to get ticker info. This is a basic validation/search.
        # For a more comprehensive search, a dedicated API would be better.
        ticker_info = yf.Ticker(request.query).info
        if ticker_info and 'longName' in ticker_info and 'symbol' in ticker_info:
            return [{"ticker": ticker_info['symbol'], "name": ticker_info['longName']}]
        else:
            return []
    except Exception as e:
        # If yfinance can't find it, it's likely not a valid ticker or there's an issue.
        print(f"Ticker search failed for {request.query}: {e}")
        return []



# Simplified non-authenticated endpoints for typical use cases
@app.post("/api/simple_file_simulation/")
async def simple_file_simulation(request: SimulationRequest):
    """Simplified file simulation without authentication but with AI recommendations"""
    try:
        results = run_sip_simulation(request.file_path, request.column_name, request.distribution_name)
        
        prompt = f"""Based on the following Monte Carlo simulation results, provide a comprehensive investment recommendation for a user with a moderate risk tolerance.

Simulation Details:
- Data Source: User-uploaded file
- Distribution Used: {request.distribution_name}
- File: {request.file_path}
- Column: {request.column_name or 'First column'}

Summary Statistics:
{results['summary_stats']}

Please provide:
1. Key insights about the risk-return profile
2. What the chosen {request.distribution_name} distribution tells us about the data characteristics
3. Specific investment strategies based on these results
4. Risk management recommendations
5. Position sizing considerations

Keep the response practical and actionable for an investor."""
        
        ai_recommendation = await get_ai_recommendation(prompt)
        results['ai_recommendation'] = ai_recommendation
        
        return results
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

@app.post("/api/simple_ticker_simulation/")
async def simple_ticker_simulation(request: TickerSimulationRequest):
    """Simplified ticker simulation without authentication but with AI recommendations"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * request.years)
        
        # Download data
        data = yf.download(request.ticker, start=start_date, end=end_date)
        if 'Adj Close' in data.columns:
            data = data['Adj Close']
        elif 'Close' in data.columns:
            data = data['Close']
        else:
            return {"error": f"Could not find relevant price data for ticker {request.ticker}."}
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
        
        prompt = f"""Based on the following Monte Carlo simulation results, provide a comprehensive investment recommendation for a user with a moderate risk tolerance.

Simulation Details:
- Asset: {request.ticker}
- Data Source: {request.years} years of historical price data
- Distribution Used: {request.distribution_name}
- Analysis Period: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}

Summary Statistics:
{results['summary_stats']}

Please provide:
1. Key insights about {request.ticker}'s risk-return profile
2. How the {request.distribution_name} distribution captures this asset's behavior
3. Specific investment strategies for {request.ticker}
4. Risk management recommendations
5. Position sizing and portfolio allocation guidance
6. Market timing considerations if relevant

Keep the response practical and actionable for an investor considering {request.ticker}."""
        
        ai_recommendation = await get_ai_recommendation(prompt)
        results['ai_recommendation'] = ai_recommendation
        
        return results
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

@app.post("/api/run_backtester_simulation/")
async def run_backtester_simulation(request: BacktesterSimulationRequest, db: SessionLocal = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * request.years)
        
        # Download data
        data = yf.download(request.ticker, start=start_date, end=end_date)
        if 'Adj Close' in data.columns:
            historical_data = data[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
            historical_data['Close'] = historical_data['Adj Close'] # Use Adj Close as primary Close
        elif 'Close' in data.columns:
            historical_data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
        else:
            raise HTTPException(status_code=400, detail=f"Could not find relevant price data (e.g., 'Adj Close' or 'Close') for ticker {request.ticker}.")
        
        if historical_data.empty:
            raise HTTPException(status_code=400, detail=f"Could not fetch historical data for ticker {request.ticker}.")

        # Initialize the simulator
        simulator = BacktesterSimulator(
            historical_data=historical_data,
            num_trials=request.num_trials,
            take_profit_pct=request.take_profit_pct,
            stop_loss_pct=request.stop_loss_pct,
            use_slurp=request.use_slurp,
            slurp_columns=request.slurp_columns,
            forecast_horizon=request.forecast_horizon,
            entry_long_percentile=request.entry_long_percentile,
            entry_short_percentile=request.entry_short_percentile,
            exit_long_percentile=request.exit_long_percentile,
            exit_short_percentile=request.exit_short_percentile,
            entry_threshold_factor=request.entry_threshold_factor,
            exit_threshold_factor=request.exit_threshold_factor
        )

        # Run the simulation
        simulation_results = simulator.simulate_trade()

        # Generate AI recommendation
        prompt = f"""Based on the following backtester simulation results for {request.ticker}, provide a comprehensive analysis and investment recommendation.

Simulation Parameters:
- Ticker: {request.ticker}
- Historical Period: {request.years} years
- Take Profit: {request.take_profit_pct}
- Stop Loss: {request.stop_loss_pct}
- Number of Trials: {request.num_trials}
- Used SLURP: {request.use_slurp}
- SLURP Columns: {request.slurp_columns}
- Forecast Horizon: {request.forecast_horizon}
- Entry Long Percentile: {request.entry_long_percentile}
- Entry Short Percentile: {request.entry_short_percentile}
- Exit Long Percentile: {request.exit_long_percentile}
- Exit Short Percentile: {request.exit_short_percentile}
- Entry Threshold Factor: {request.entry_threshold_factor}
- Exit Threshold Factor: {request.exit_threshold_factor}

Simulation Results:
{simulation_results}

Please provide:
1. An evaluation of the strategy's performance (profit/loss, trade frequency).
2. Insights into the effectiveness of the entry, exit, TP, and SL rules.
3. Recommendations for optimising the strategy or adjusting parameters.
4. Risk assessment and position sizing advice.
5. Overall investment recommendation for {request.ticker} based on this strategy.

Keep the response practical and actionable for an investor."""
        ai_recommendation = await get_ai_recommendation(prompt)
        simulation_results['ai_recommendation'] = ai_recommendation

        # Store simulation results in DB (optional, based on models.py)
        # db_simulation = models.Simulation(
        #     user_id=current_user.id,
        #     simulation_mode="trading_strategy",
        #     simulation_params=request.dict(),
        #     summary_stats=simulation_results,
        #     ai_recommendation=ai_recommendation,
        # )
        # db.add(db_simulation)
        # db.commit()

        return simulation_results

    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        full_traceback = traceback.format_exc()
        print(f"ERROR: Full Traceback for 500 error:\n{full_traceback}") # DEBUG
        raise HTTPException(status_code=500, detail=f"An error occurred during trading strategy simulation: {str(e)}")


    raise HTTPException(status_code=500, detail=f"An error occurred during trading strategy simulation: {str(e)}")


    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * request.years)

        # Download data
        data = yf.download(request.ticker, start=start_date, end=end_date)
        if 'Adj Close' in data.columns:
            historical_data = data[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
            historical_data['Close'] = historical_data['Adj Close'] # Use Adj Close as primary Close
        elif 'Close' in data.columns:
            historical_data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
        else:
            raise HTTPException(status_code=400, detail=f"Could not find relevant price data (e.g., 'Adj Close' or 'Close') for ticker {request.ticker}.")

        if historical_data.empty:
            raise HTTPException(status_code=400, detail=f"Could not fetch historical data for ticker {request.ticker}.")

        # Initialize the AdvancedBacktester
        backtester = AdvancedBacktester(
            historical_data=historical_data,
            num_simulations=request.num_simulations,
            volatility_lookback_days=request.volatility_lookback_days,
            return_distribution_percentiles=request.return_distribution_percentiles,
            strategy_count=request.strategy_count
        )

        # Run the advanced backtest and get ranked strategies
        ranked_strategies = backtester.run_backtest()

        # Generate AI recommendation
        prompt = f"""Based on the following ranked trading strategies for {request.ticker}, provide a comprehensive analysis and investment recommendation.

Simulation Parameters:
- Ticker: {request.ticker}
- Historical Period: {request.years} years
- Number of Simulations: {request.num_simulations}
- Volatility Lookback Days: {request.volatility_lookback_days}
- Return Distribution Percentiles: {request.return_distribution_percentiles}
- Number of Strategies Generated: {request.strategy_count}

Ranked Strategies:
{ranked_strategies}

Please provide:
1. An evaluation of the top strategies' performance (PnL, drawdown, win rate, Sharpe/Sortino).
2. Insights into the effectiveness of the data-driven entry, exit, and stop rules.
3. Recommendations for optimizing the strategies or adjusting parameters.
4. Risk assessment and position sizing advice.
5. Overall investment recommendation for {request.ticker} based on these strategies, highlighting the most robust one under varying market conditions.

Keep the response practical and actionable for an investor.
"""
        ai_recommendation = await get_ai_recommendation(prompt)

        results = {
            "ranked_strategies": ranked_strategies,
            "ai_recommendation": ai_recommendation
        }

        # Store simulation results in DB (optional, based on models.py)
        # db_simulation = models.Simulation(
        #     user_id=current_user.id,
        #     simulation_mode="advanced_backtest",
        #     simulation_params=request.dict(),
        #     summary_stats=results, # Store the entire results dictionary
        #     ai_recommendation=ai_recommendation,
        # )
        # db.add(db_simulation)
        # db.commit()

        return results

    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        full_traceback = traceback.format_exc() 
        print(f"ERROR: Full Traceback for 500 error:\n{full_traceback}") # DEBUG
        raise HTTPException(status_code=500, detail=f"An error occurred during advanced backtesting: {str(e)}")

@app.get("/api/simulations/")
async def get_simulations(db: SessionLocal = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Simulation).filter(models.User.id == current_user.id).all()

@app.post("/api/optimise_strategy/")
async def optimise_strategy(request: StrategyOptimiserRequest, db: SessionLocal = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365 * request.years)

        # Download data
        data = yf.download(request.ticker, start=start_date, end=end_date)
        if 'Adj Close' in data.columns:
            historical_data = data[['Open', 'High', 'Low', 'Close', 'Adj Close', 'Volume']]
            historical_data['Close'] = historical_data['Adj Close'] # Use Adj Close as primary Close
        elif 'Close' in data.columns:
            historical_data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
        else:
            raise HTTPException(status_code=400, detail=f"Could not find relevant price data (e.g., 'Adj Close' or 'Close') for ticker {request.ticker}.")

        if historical_data.empty:
            raise HTTPException(status_code=400, detail=f"Could not fetch historical data for ticker {request.ticker}.")

        # Initialize the StrategyOptimiser
        optimiser = StrategyOptimiser(
            historical_data=historical_data,
            num_simulations=request.num_simulations,
            volatility_lookback_days=request.volatility_lookback_days,
            return_distribution_percentiles=request.return_distribution_percentiles,
            strategy_count=request.strategy_count
        )

        # Run the optimisation and get ranked strategies
        optimisation_results = optimiser.run_optimization()

        # Generate AI recommendation
        prompt = f"""Based on the following ranked trading strategies for {request.ticker}, provide a comprehensive analysis and investment recommendation in the format of "Example Trading Scenarios".

Simulation Parameters:
- Ticker: {request.ticker}
- Historical Period: {request.years} years
- Number of Simulations: {request.num_simulations}
- Volatility Lookback Days: {request.volatility_lookback_days}
- Return Distribution Percentiles: {request.return_distribution_percentiles}
- Number of Strategies Generated: {request.strategy_count}
- Last Close Price: {optimisation_results["last_close_price"]}

Ranked Strategies:
{optimisation_results["ranked_strategies"]}

Please provide the output in the following format:

**Example Trading Scenarios (Based on Price Distribution)**
The following scenarios are derived from the statistical distribution of the simulation data. They provide potential strategies for both long and short positions based on conservative and aggressive approaches. These are not financial advice but illustrative examples based on the simulation.

**Long Position Scenarios**
*   **Conservative Long Strategy**: Explain the strategy, entry point, take-profit target, and stop-loss.
*   **Aggressive Long Strategy**: Explain the strategy, entry point, take-profit target, and stop-loss.

**Short Position Scenarios**
*   **Conservative Short Strategy**: Explain the strategy, entry point, take-profit target, and stop-loss.
*   **Aggressive Short Strategy**: Explain the strategy, entry point, take-profit target, and stop-loss.

**Risk Assessment based on Volatility**
*   **Analysis**: Analyse the volatility of the asset.
*   **Strategic Recommendation**: Provide strategic recommendations based on the volatility analysis.

Keep the response practical and actionable for an investor. Use the provided `last_close_price` to convert the returns to price levels.
"""
        ai_recommendation = await get_ai_recommendation(prompt)

        results = {
            "ranked_strategies": optimisation_results["ranked_strategies"],
            "last_close_price": optimisation_results["last_close_price"],
            "ai_recommendation": ai_recommendation
        }

        # Store simulation results in DB (optional, based on models.py)
        # db_simulation = models.Simulation(
        #     user_id=current_user.id,
        #     simulation_mode="strategy_optimisation",
        #     simulation_params=request.dict(),
        #     summary_stats=results, # Store the entire results dictionary
        #     ai_recommendation=ai_recommendation,
        # )
        # db.add(db_simulation)
        # db.commit()

        return results

    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        full_traceback = traceback.format_exc() 
        print(f"ERROR: Full Traceback for 500 error:\n{full_traceback}") # DEBUG
        raise HTTPException(status_code=500, detail=f"An error occurred during strategy optimisation: {str(e)}")


@app.get("/api/simulations/")
async def get_simulations(db: SessionLocal = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Simulation).filter(models.User.id == current_user.id).all()


