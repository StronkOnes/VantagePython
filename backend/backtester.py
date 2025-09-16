
import pandas as pd
import numpy as np
from scipy.stats import norm, uniform, lognorm, beta, multivariate_normal
import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional

# Define a simple SIP class for clarity, though a numpy array can serve as a SIP
class SIP:
    def __init__(self, trials: np.ndarray):
        if not isinstance(trials, np.ndarray):
            raise ValueError("SIP trials must be a NumPy array.")
        self.trials = trials
        self.num_trials = len(trials)

    def __add__(self, other):
        if isinstance(other, SIP):
            if self.num_trials != other.num_trials:
                raise ValueError("SIPs must have the same number of trials for arithmetic operations.")
            return SIP(self.trials + other.trials)
        return SIP(self.trials + other)

    def __sub__(self, other):
        if isinstance(other, SIP):
            if self.num_trials != other.num_trials:
                raise ValueError("SIPs must have the same number of trials for arithmetic operations.")
            return SIP(self.trials - other.trials)
        return SIP(self.trials - other)

    def __mul__(self, other):
        if isinstance(other, SIP):
            if self.num_trials != other.num_trials:
                raise ValueError("SIPs must have the same number of trials for arithmetic operations.")
            return SIP(self.trials * other.trials)
        return SIP(self.trials * other)
        
    def __truediv__(self, other):
        if isinstance(other, SIP):
            if self.num_trials != other.num_trials:
                raise ValueError("SIPs must have the same number of trials for arithmetic operations.")
            return SIP(self.trials / other.trials)
        return SIP(self.trials / other)

    def __repr__(self):
        return f"SIP(num_trials={self.num_trials}, mean={np.mean(self.trials):.2f}, std={np.std(self.trials):.2f})"

class SLURP:
    def __init__(self, sips: Dict[str, SIP]):
        if not sips:
            raise ValueError("SLURP must contain at least one SIP.")
        
        first_sip_trials = next(iter(sips.values())).num_trials
        for name, sip in sips.items():
            if not isinstance(sip, SIP):
                raise ValueError(f"All elements in SLURP must be SIP objects. '{name}' is not.")
            if sip.num_trials != first_sip_trials:
                raise ValueError("All SIPs in a SLURP must have the same number of trials.")
        
        self.sips = sips
        self.num_trials = first_sip_trials

    def __getitem__(self, key: str) -> SIP:
        return self.sips[key]

    def __repr__(self):
        return f"SLURP(num_trials={self.num_trials}, sips={list(self.sips.keys())})"

def generate_sip_from_distribution(distribution_name: str, params: tuple, num_trials: int = 10000) -> SIP:
    """Generates a SIP by sampling from a specified distribution."""
    DISTRIBUTIONS = {
        "Normal": norm,
        "Uniform": uniform,
        "Log-Normal": lognorm,
        "Beta": beta,
    }
    if distribution_name not in DISTRIBUTIONS:
        raise ValueError(f"Unsupported distribution: {distribution_name}")
    
    dist = DISTRIBUTIONS[distribution_name]
    samples = dist.rvs(*params, size=num_trials)
    return SIP(samples)

def generate_empirical_sip(data_series: pd.Series, num_trials: int = 10000) -> SIP:
    """Generates an empirical SIP by sampling with replacement from a given data series."""
    if data_series.empty:
        raise ValueError("Data series for empirical SIP cannot be empty.")
    samples = np.random.choice(data_series, size=num_trials, replace=True)
    return SIP(samples)

def generate_correlated_slurp(data: pd.DataFrame, columns: List[str], num_trials: int = 10000) -> SLURP:
    """
    Generates a SLURP for specified correlated columns from historical data.
    Assumes data is stationary and can be modeled by a multivariate normal distribution.
    """
    if not columns or len(columns) < 2:
        raise ValueError("At least two columns are required to generate a correlated SLURP.")
    
    # Ensure data is numeric and drop NaNs for covariance calculation
    clean_data = data[columns].dropna()
    
    if clean_data.empty:
        raise ValueError("Cleaned data for SLURP generation is empty. Check columns or NaNs.")

    mean_vec = clean_data.mean().values
    cov_mat = clean_data.cov().values

    # Generate correlated samples
    correlated_samples = multivariate_normal.rvs(mean=mean_vec, cov=cov_mat, size=num_trials)

    sips = {}
    for i, col_name in enumerate(columns):
        sips[col_name] = SIP(correlated_samples[:, i])
    
    return SLURP(sips)

class BacktesterSimulator:
    def __init__(self, 
                 historical_data: pd.DataFrame, 
                 num_trials: int = 10000,
                 take_profit_pct: float = None, # e.g., 0.02 for 2%
                 stop_loss_pct: float = None,    # e.g., 0.01 for 1%
                 use_slurp: bool = False, # New parameter to indicate SLURP usage
                 slurp_columns: Optional[List[str]] = None, # Columns to include in SLURP
                 # SIP-based entry/exit parameters
                 forecast_horizon: int = 5, # Number of days to forecast for SIP-based rules
                 entry_long_percentile: float = 0.75, # e.g., 75th percentile of future price SIP
                 entry_short_percentile: float = 0.25, # e.g., 25th percentile of future price SIP
                 exit_long_percentile: float = 0.25, # e.g., 25th percentile of future price SIP
                 exit_short_percentile: float = 0.75, # e.g., 75th percentile of future price SIP
                 entry_threshold_factor: float = 1.005, # e.g., 0.5% above/below current price
                 exit_threshold_factor: float = 0.995, # e.g., 0.5% above/below current price
                 ):
        self.historical_data = historical_data.copy()
        self.num_trials = num_trials
        self.take_profit_pct = take_profit_pct
        self.stop_loss_pct = stop_loss_pct
        self.use_slurp = use_slurp
        self.slurp_columns = slurp_columns
        self.forecast_horizon = forecast_horizon
        self.entry_long_percentile = entry_long_percentile
        self.entry_short_percentile = entry_short_percentile
        self.exit_long_percentile = exit_long_percentile
        self.exit_short_percentile = exit_short_percentile
        self.entry_threshold_factor = entry_threshold_factor
        self.exit_threshold_factor = exit_threshold_factor

        # Ensure historical data has 'Close' prices
        if 'Close' not in self.historical_data.columns:
            raise ValueError("Historical data must contain a 'Close' column.")
        
        # Prepare data for SIP/SLURP generation
        self.historical_data['Daily_Return'] = self.historical_data['Close'].pct_change()
        self.historical_data['Daily_Volatility'] = self.historical_data['Daily_Return'].rolling(window=20).std() # Example volatility
        
        # Drop NaN values created by rolling means and pct_change before SIP/SLURP generation
        self.historical_data.dropna(inplace=True)
        print(f"DEBUG: BacktesterSimulator __init__ - historical_data length after dropna: {len(self.historical_data)}")
        if len(self.historical_data) <= self.forecast_horizon:
            print(f"DEBUG: BacktesterSimulator __init__ - historical_data too short for forecast_horizon {self.forecast_horizon}")

        if self.use_slurp and self.slurp_columns:
            # Generate SLURP for specified columns
            # Ensure slurp_columns are available in historical_data after dropping NaNs
            valid_slurp_columns = [col for col in self.slurp_columns if col in self.historical_data.columns]
            if len(valid_slurp_columns) < 2:
                raise ValueError("Not enough valid columns for SLURP generation after data cleaning.")
            self.slurp = generate_correlated_slurp(self.historical_data, valid_slurp_columns, num_trials=self.num_trials)
            self.daily_returns_sip = self.slurp['Daily_Return'] # Still keep a reference for price simulation
        else:
            # Calculate daily returns SIP for future price uncertainty (default behavior)
            self.daily_returns_sip = generate_empirical_sip(self.historical_data['Daily_Return'].dropna(), num_trials=self.num_trials)
            self.slurp = None # No SLURP if not used

        # Pre-calculate SIP-derived indicators
        self._calculate_sip_indicators()

    def _calculate_sip_indicators(self):
        """
        Pre-calculates SIP-derived indicators for entry/exit rules for each day in historical data.
        This avoids generating SIPs within the main simulation loop.
        """
        # Initialize columns for SIP-derived indicators
        self.historical_data['SIP_Entry_Long_Price'] = np.nan
        self.historical_data['SIP_Entry_Short_Price'] = np.nan
        self.historical_data['SIP_Exit_Long_Price'] = np.nan
        self.historical_data['SIP_Exit_Short_Price'] = np.nan

        for i in range(len(self.historical_data) - self.forecast_horizon):
            current_date_index = self.historical_data.index[i]
            current_price = self.historical_data['Close'].iloc[i]
            if isinstance(current_price, pd.Series):
                current_price = current_price.iloc[0]
            
            # Generate a future price SIP for this specific point in time
            future_returns_trials = np.prod(1 + np.random.choice(self.daily_returns_sip.trials, 
                                                                size=(self.num_trials, self.forecast_horizon)), axis=1)
            future_prices = current_price * future_returns_trials
            future_price_sip = SIP(future_prices)

            # Calculate percentiles for entry/exit and ensure scalar assignment
            self.historical_data.loc[current_date_index, 'SIP_Entry_Long_Price'] = float(np.percentile(future_price_sip.trials, self.entry_long_percentile * 100))
            self.historical_data.loc[current_date_index, 'SIP_Entry_Short_Price'] = float(np.percentile(future_price_sip.trials, self.entry_short_percentile * 100))
            self.historical_data.loc[current_date_index, 'SIP_Exit_Long_Price'] = float(np.percentile(future_price_sip.trials, self.exit_long_percentile * 100))
            self.historical_data.loc[current_date_index, 'SIP_Exit_Short_Price'] = float(np.percentile(future_price_sip.trials, self.exit_short_percentile * 100))

        print(f"DEBUG: _calculate_sip_indicators - First few SIP_Entry_Long_Price: {self.historical_data['SIP_Entry_Long_Price'].head()}")
        print(f"DEBUG: _calculate_sip_indicators - Last few SIP_Entry_Long_Price: {self.historical_data['SIP_Entry_Long_Price'].tail()}")
        print(f"DEBUG: _calculate_sip_indicators - Number of NaNs in SIP_Entry_Long_Price: {self.historical_data['SIP_Entry_Long_Price'].isnull().sum()}")

    def _apply_entry_rule(self, current_index: int) -> Optional[str]: # Returns 'long' or 'short' or None
        print(f"DEBUG: _apply_entry_rule - Checking entry for index: {current_index}")
        # SIP-based Entry Rule using pre-calculated indicators
        if current_index >= len(self.historical_data) - self.forecast_horizon:
            print(f"DEBUG: _apply_entry_rule - Not enough future data for SIP forecast at index {current_index}")
            return None # Not enough future data for SIP forecast

        current_price = self.historical_data['Close'].iloc[current_index]
        if isinstance(current_price, pd.Series):
            current_price = current_price.iloc[0]

        sip_entry_long_price = self.historical_data['SIP_Entry_Long_Price'].iloc[current_index]
        sip_entry_short_price = self.historical_data['SIP_Entry_Short_Price'].iloc[current_index]

        # Ensure retrieved values are scalars
        if isinstance(sip_entry_long_price, pd.Series):
            sip_entry_long_price = sip_entry_long_price.iloc[0]
        if isinstance(sip_entry_short_price, pd.Series):
            sip_entry_short_price = sip_entry_short_price.iloc[0]

        print(f"DEBUG: _apply_entry_rule - current_price: {current_price:.4f}, sip_entry_long_price: {sip_entry_long_price:.4f}, sip_entry_short_price: {sip_entry_short_price:.4f}")

        # Check for long entry
        if sip_entry_long_price > current_price * self.entry_threshold_factor:
            print(f"DEBUG: _apply_entry_rule - Returning 'long' at index {current_index}")
            return "long"
        
        # Check for short entry
        if sip_entry_short_price < current_price * (2 - self.entry_threshold_factor): # (2 - factor) for inverse threshold
            print(f"DEBUG: _apply_entry_rule - Returning 'short' at index {current_index}")
            return "short"
            
        print(f"DEBUG: _apply_entry_rule - Returning None at index {current_index}")
        return None

    def _apply_exit_rule(self, current_index: int, position_type: str) -> bool:
        # SIP-based Exit Rule using pre-calculated indicators
        if current_index >= len(self.historical_data) - self.forecast_horizon:
            return False # Not enough future data for SIP forecast

        current_price = self.historical_data['Close'].iloc[current_index]
        if isinstance(current_price, pd.Series):
            current_price = current_price.iloc[0]

        sip_exit_long_price = self.historical_data['SIP_Exit_Long_Price'].iloc[current_index]
        sip_exit_short_price = self.historical_data['SIP_Exit_Short_Price'].iloc[current_index]

        # Ensure retrieved values are scalars
        if isinstance(sip_exit_long_price, pd.Series):
            sip_exit_long_price = sip_exit_long_price.iloc[0]
        if isinstance(sip_exit_short_price, pd.Series):
            sip_exit_short_price = sip_exit_short_price.iloc[0]

        if position_type == "long":
            # Exit long if future price is likely to drop
            if sip_exit_long_price < current_price * self.exit_threshold_factor:
                return True
        elif position_type == "short":
            # Exit short if future price is likely to rise
            if sip_exit_short_price > current_price * (2 - self.exit_threshold_factor):
                return True
        return False

    def simulate_trade(self, initial_capital: float = 100000) -> dict:
        """
        Simulates a single trade over the historical data using SIPs/SLURPs for future price movements.
        This is a simplified simulation for demonstration.
        """
        portfolio_value = initial_capital
        position_open = False
        position_type = None # "long" or "short"
        entry_price = 0
        position_size = 0
        
        trade_log = []

        # Start simulation after enough data for SIP indicators to be calculated
        start_index = self.forecast_horizon # Ensure enough data for SIP indicators
        print(f"DEBUG: simulate_trade - Starting simulation loop from index {start_index} to {len(self.historical_data) - 1}")

        for i in range(start_index, len(self.historical_data) - 1):
            current_date = self.historical_data.index[i]
            current_price = self.historical_data['Close'].iloc[i]
            # Ensure current_price is a scalar, not a Series
            if isinstance(current_price, pd.Series):
                current_price = current_price.iloc[0]

            print(f"DEBUG: simulate_trade - Loop iteration {i}, current_date: {current_date}, current_price: {current_price:.4f}, position_open: {position_open}")

            # If not in a position, check for entry
            if not position_open:
                signal = self._apply_entry_rule(i)
                if signal:
                    position_open = True
                    position_type = signal
                    entry_price = current_price
                    # For simplicity, assume fixed capital allocation for position size
                    position_size = (initial_capital / entry_price) # Can be refined
                    trade_log.append({"date": current_date, "event": f"ENTRY_{position_type.upper()}", "price": entry_price, "position_size": position_size})
                    print(f"DEBUG: simulate_trade - Position {position_type} opened at {entry_price:.4f} on {current_date}")
            else:
                # If in a position, check for exit, TP, or SL
                trial_index = np.random.randint(0, self.num_trials)

                if self.use_slurp and self.slurp:
                    simulated_next_return = self.slurp['Daily_Return'].trials[trial_index]
                    # Access other correlated SIPs if needed, e.g., simulated_next_volatility = self.slurp['Daily_Volatility'].trials[trial_index]
                else:
                    simulated_next_return = self.daily_returns_sip.trials[trial_index]

                simulated_next_price = current_price * (1 + simulated_next_return)

                trade_closed = False
                pnl_reason = ""

                # Check Take Profit
                if position_type == "long" and self.take_profit_pct and simulated_next_price >= entry_price * (1 + self.take_profit_pct):
                    trade_pnl = (simulated_next_price - entry_price) * position_size
                    pnl_reason = "TAKE_PROFIT"
                    trade_closed = True
                elif position_type == "short" and self.take_profit_pct and simulated_next_price <= entry_price * (1 - self.take_profit_pct):
                    trade_pnl = (entry_price - simulated_next_price) * position_size # For short, profit when price drops
                    pnl_reason = "TAKE_PROFIT"
                    trade_closed = True
                # Check Stop Loss
                elif position_type == "long" and self.stop_loss_pct and simulated_next_price <= entry_price * (1 - self.stop_loss_pct):
                    trade_pnl = (simulated_next_price - entry_price) * position_size
                    pnl_reason = "STOP_LOSS"
                    trade_closed = True
                elif position_type == "short" and self.stop_loss_pct and simulated_next_price >= entry_price * (1 + self.stop_loss_pct):
                    trade_pnl = (entry_price - simulated_next_price) * position_size # For short, loss when price rises
                    pnl_reason = "STOP_LOSS"
                    trade_closed = True
                # Check Exit Rule (SIP-based)
                elif self._apply_exit_rule(i, position_type):
                    trade_pnl = (simulated_next_price - entry_price) * position_size if position_type == "long" else (entry_price - simulated_next_price) * position_size
                    pnl_reason = "EXIT_RULE"
                    trade_closed = True
                
                if trade_closed:
                    portfolio_value += trade_pnl
                    position_open = False
                    position_type = None
                    trade_log.append({"date": current_date, "event": pnl_reason, "price": simulated_next_price, "pnl": trade_pnl})
                    print(f"DEBUG: simulate_trade - Position closed ({pnl_reason}) at {simulated_next_price:.4f} on {current_date}, PnL: {trade_pnl:.2f}")
                else:
                    # If still in position, update portfolio value based on simulated next price
                    # This assumes the PnL is realized daily, which is a simplification
                    if position_type == "long":
                        portfolio_value = initial_capital + (simulated_next_price - entry_price) * position_size
                    elif position_type == "short":
                        portfolio_value = initial_capital + (entry_price - simulated_next_price) * position_size
                    print(f"DEBUG: simulate_trade - Position still open, current simulated portfolio value: {portfolio_value:.2f}")

        return {
            "final_portfolio_value": portfolio_value,
            "total_pnl": portfolio_value - initial_capital,
            "trade_log": trade_log
        }

    def run_strategy_optimization(self, 
                                  ticker: str, 
                                  years: int = 5, 
                                  entry_params_range: dict = None, 
                                  exit_params_range: dict = None,
                                  tp_range: list = None,
                                  sl_range: list = None,
                                  objective_function=None # e.g., maximize total_pnl
                                  ) -> dict:
        """
        Placeholder for running an optimization loop to find best strategy parameters.
        This would involve iterating through parameter ranges and running simulate_trade for each combination.
        """
        best_params = {}
        best_score = -np.inf # For maximization
        
        # This is a very simplified example. A real optimization would be more complex.
        # For now, just return dummy best params.
        best_params = {
            "entry_rule": {"type": "SIP_based"},
            "exit_rule": {"type": "SIP_based"},
            "take_profit_pct": 0.02,
            "stop_loss_pct": 0.01,
        }
        best_score = 15000 # Dummy score

        return {
            "best_parameters": best_params,
            "best_score": best_score,
            "message": "Optimization placeholder executed. Implement actual optimization logic."
        }

