import pandas as pd
import numpy as np
from typing import List, Dict, Any
from scipy.stats import norm, uniform, lognorm, beta, multivariate_normal # Import necessary distributions

# Assuming SIP and SLURP classes are defined elsewhere or will be defined here
# For now, I'll include simplified versions or assume they are available.
# If they are in backtester.py, we might need to import them or copy them.
# For now, I'll copy them to make this module self-contained.

# --- SIP and SLURP Classes (Copied from backtester.py for self-containment) ---
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
# --- End SIP and SLURP Classes ---


class StrategyOptimiser:
    def __init__(self, historical_data: pd.DataFrame, num_simulations: int,
                 volatility_lookback_days: int, return_distribution_percentiles: List[float],
                 strategy_count: int):
        self.historical_data = historical_data
        self.num_simulations = num_simulations
        self.volatility_lookback_days = volatility_lookback_days
        self.return_distribution_percentiles = return_distribution_percentiles
        self.strategy_count = strategy_count

        # Ensure sufficient historical data
        if len(self.historical_data) < self.volatility_lookback_days + 2: # Need at least 2 for pct_change, and then enough for rolling window
            raise ValueError(f"Insufficient historical data for the specified volatility lookback days ({self.volatility_lookback_days}). "
                             f"Need at least {self.volatility_lookback_days + 2} data points, but got {len(self.historical_data)}.")

        self.returns = self._calculate_returns()
        self.volatility = self._calculate_volatility()
        self.slurp_data = self._prepare_slurp_data()

    def _calculate_returns(self) -> pd.Series:
        """Calculates daily returns from 'Close' prices."""
        close_prices = self.historical_data['Close']
        if isinstance(close_prices, pd.DataFrame):
            # If 'Close' is a DataFrame (e.g., single column DataFrame), convert to Series
            close_prices = close_prices.squeeze()
            if isinstance(close_prices, pd.DataFrame): # Still a DataFrame after squeeze (e.g., multiple columns named 'Close')
                raise ValueError("Multiple 'Close' columns found or 'Close' is not a single Series.")

        if len(close_prices) <= 1:
            raise ValueError("Insufficient 'Close' price data to calculate returns.")
        
        return close_prices.astype(float).pct_change().dropna()

    def _calculate_volatility(self) -> pd.Series:
        """Calculates rolling volatility (standard deviation of returns)."""
        if len(self.returns) < self.volatility_lookback_days:
            raise ValueError(f"Insufficient returns data ({len(self.returns)} points) to calculate rolling volatility "
                             f"with a lookback of {self.volatility_lookback_days} days.")
        # Ensure we are operating on a Series, and the result is a Series
        return self.returns.rolling(window=self.volatility_lookback_days).std().dropna().squeeze()

    def _prepare_slurp_data(self) -> pd.DataFrame:
        """Prepares data for SLURPS, including returns and volatility."""
        # Align returns and volatility by date
        # Ensure returns and volatility are not empty
        if self.returns.empty:
            raise ValueError("Returns data is empty. Cannot prepare SLURPS data.")
        if self.volatility.empty:
            raise ValueError("Volatility data is empty. Cannot prepare SLURPS data.")

        print(f"DEBUG: self.returns type: {type(self.returns)}, shape: {self.returns.shape}, head: {self.returns.head()}")
        print(f"DEBUG: self.volatility type: {type(self.volatility)}, shape: {self.volatility.shape}, head: {self.volatility.head()}")

        df = pd.DataFrame({
            'returns': self.returns,
            'volatility': self.volatility
        }).dropna()
        if df.empty:
            raise ValueError("Prepared SLURPS data (returns and volatility) is empty after alignment and dropping NaNs. "
                             "This might indicate insufficient or misaligned data.")
        return df

    def _run_slurp_simulation(self, initial_price: float, num_trials: int, forecast_horizon: int) -> np.ndarray:
        """
        Runs a SLURPS simulation to generate correlated price paths.
        Leverages generate_correlated_slurp to get correlated returns and volatility.
        """
        if self.slurp_data.empty:
            raise ValueError("SLURPS data (returns and volatility) is empty. Cannot run simulation.")

        # Generate correlated samples for returns and volatility for each day in the forecast horizon
        slurp_samples = generate_correlated_slurp(
            self.slurp_data,
            columns=['returns', 'volatility'],
            num_trials=num_trials * forecast_horizon
        )

        # Extract simulated returns and volatility
        simulated_returns = slurp_samples['returns'].trials.reshape(num_trials, forecast_horizon)
        # simulated_volatility = slurp_samples['volatility'].trials.reshape(num_trials, forecast_horizon) # Not directly used for price path here

        # Initialize price paths
        price_paths = np.zeros((num_trials, forecast_horizon + 1))
        price_paths[:, 0] = initial_price

        # Generate price paths
        for t in range(forecast_horizon):
            # Simple price path generation: Price_t+1 = Price_t * (1 + simulated_return_t)
            price_paths[:, t + 1] = price_paths[:, t] * (1 + simulated_returns[:, t])

        return price_paths

    def _generate_strategy_rules(self, last_close_price: float) -> List[Dict[str, Any]]:
        """
        Generates a list of data-driven entry, exit, and stop rules based on historical
        returns and volatility percentiles, including aggressive and conservative versions.
        """
        strategies = []

        # Calculate key percentiles for returns and volatility
        # These will be used to define entry/exit/stop levels
        return_percentiles = {p: np.percentile(self.returns, p * 100) for p in self.return_distribution_percentiles}
        volatility_percentiles = {p: np.percentile(self.volatility, p * 100) for p in [0.1, 0.9]} # 10th and 90th percentile for volatility

        # --- Aggressive Strategies ---
        # Aggressive Long Entry: High return percentile, low volatility percentile
        # Aggressive Short Entry: Low return percentile, high volatility percentile

        # Strategy 1: Aggressive Long (High Return, Low Volatility)
        strategies.append({
            "name": "Aggressive Long (High Return, Low Volatility)",
            "entry_rule": f"Enter long if daily return > {return_percentiles[0.95]:.4f} AND daily volatility < {volatility_percentiles[0.1]:.4f}",
            "exit_rule": f"Exit long if daily return < {return_percentiles[0.25]:.4f}",
            "stop_level": f"Stop loss at {return_percentiles[0.05]:.4f} percentile of returns",
            "type": "long",
            "aggressiveness": "aggressive",
            "entry_threshold_return": return_percentiles[0.95],
            "exit_threshold_return": return_percentiles[0.25],
            "stop_threshold_return": return_percentiles[0.05],
            "entry_threshold_volatility": volatility_percentiles[0.1]
        })

        # Strategy 2: Aggressive Short (Low Return, High Volatility)
        strategies.append({
            "name": "Aggressive Short (Low Return, High Volatility)",
            "entry_rule": f"Enter short if daily return < {return_percentiles[0.05]:.4f} AND daily volatility > {volatility_percentiles[0.9]:.4f}",
            "exit_rule": f"Exit short if daily return > {return_percentiles[0.75]:.4f}",
            "stop_level": f"Stop loss at {return_percentiles[0.95]:.4f} percentile of returns",
            "type": "short",
            "aggressiveness": "aggressive",
            "entry_threshold_return": return_percentiles[0.05],
            "exit_threshold_return": return_percentiles[0.75],
            "stop_threshold_return": return_percentiles[0.95],
            "entry_threshold_volatility": volatility_percentiles[0.9]
        })

        # --- Conservative Strategies ---
        # Conservative Long Entry: Moderate return percentile, moderate volatility
        # Conservative Short Entry: Moderate return percentile, moderate volatility

        # Strategy 3: Conservative Long (Moderate Return)
        strategies.append({
            "name": "Conservative Long (Moderate Return)",
            "entry_rule": f"Enter long if daily return > {return_percentiles[0.75]:.4f}",
            "exit_rule": f"Exit long if daily return < {return_percentiles[0.1]:.4f}",
            "stop_level": f"Stop loss at {return_percentiles[0.05]:.4f} percentile of returns",
            "type": "long",
            "aggressiveness": "conservative",
            "entry_threshold_return": return_percentiles[0.75],
            "exit_threshold_return": return_percentiles[0.1],
            "stop_threshold_return": return_percentiles[0.05],
            "entry_threshold_volatility": None # Not using volatility for this conservative strategy
        })

        # Strategy 4: Conservative Short (Moderate Return)
        strategies.append({
            "name": "Conservative Short (Moderate Return)",
            "entry_rule": f"Enter short if daily return < {return_percentiles[0.25]:.4f}",
            "exit_rule": f"Exit short if daily return > {return_percentiles[0.9]:.4f}",
            "stop_level": f"Stop loss at {return_percentiles[0.95]:.4f} percentile of returns",
            "type": "short",
            "aggressiveness": "conservative",
            "entry_threshold_return": return_percentiles[0.25],
            "exit_threshold_return": return_percentiles[0.9],
            "stop_threshold_return": return_percentiles[0.95],
            "entry_threshold_volatility": None # Not using volatility for this conservative strategy
        })
        
        # Add more strategies based on self.strategy_count if needed, or adjust the above to be more dynamic
        # For now, we generate a fixed set of 4 strategies.
        
        return strategies

    def _simulate_strategy(self, strategy_rules: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulates a single strategy using the generated SLURPS data,
        calculating key performance metrics.
        """
        initial_price_series = self.historical_data['Close'].iloc[-1]
        # Ensure initial_price is a scalar float, not a Series
        if isinstance(initial_price_series, pd.Series):
            initial_price = initial_price_series.iloc[0]
        else:
            initial_price = initial_price_series

        price_paths = self._run_slurp_simulation(initial_price, self.num_simulations, self.volatility_lookback_days) # Using volatility_lookback_days as forecast_horizon for now

        trial_pnls = []
        peak_values = np.zeros(self.num_simulations)
        drawdowns = np.zeros(self.num_simulations)
        wins = 0
        
        # Extract rules for easier access
        entry_threshold_return = strategy_rules.get("entry_threshold_return")
        exit_threshold_return = strategy_rules.get("exit_threshold_return")
        stop_threshold_return = strategy_rules.get("stop_threshold_return")
        entry_threshold_volatility = strategy_rules.get("entry_threshold_volatility")
        strategy_type = strategy_rules.get("type")

        for i in range(self.num_simulations):
            current_price = initial_price
            portfolio_value = initial_price # Assuming 1 unit of asset
            in_position = False
            position_entry_price = 0
            
            trial_returns = np.diff(price_paths[i]) / price_paths[i, :-1] # Daily returns for this path

            for t in range(len(trial_returns)):
                daily_return = trial_returns[t]
                # daily_volatility = ... (would need to be simulated or derived from simulated returns)
                # For simplicity, we'll use the simulated daily_return for now.

                # Entry Logic
                if not in_position:
                    if strategy_type == "long":
                        if daily_return > entry_threshold_return: # Simplified entry condition
                            if entry_threshold_volatility is None or self.volatility.iloc[-1] < entry_threshold_volatility: # Using last historical volatility for entry
                                in_position = True
                                position_entry_price = price_paths[i, t+1] # Price at which position is entered
                    elif strategy_type == "short":
                        if daily_return < entry_threshold_return: # Simplified entry condition
                            if entry_threshold_volatility is None or self.volatility.iloc[-1] > entry_threshold_volatility: # Using last historical volatility for entry
                                in_position = True
                                position_entry_price = price_paths[i, t+1] # Price at which position is entered
                # Exit and Stop Loss Logic
                elif in_position:
                    current_price = price_paths[i, t+1]
                    
                    # Calculate PnL for the current position
                    if strategy_type == "long":
                        pnl_pct = (current_price - position_entry_price) / position_entry_price
                    else: # short
                        pnl_pct = (position_entry_price - current_price) / position_entry_price

                    # Check for exit rule
                    if strategy_type == "long" and daily_return < exit_threshold_return:
                        in_position = False
                        trial_pnls.append(pnl_pct)
                        if pnl_pct > 0: wins += 1
                    elif strategy_type == "short" and daily_return > exit_threshold_return:
                        in_position = False
                        trial_pnls.append(pnl_pct)
                        if pnl_pct > 0: wins += 1
                    
                    # Check for stop loss
                    elif strategy_type == "long" and daily_return < stop_threshold_return:
                        in_position = False
                        trial_pnls.append(pnl_pct) # Stop loss implies a negative PnL
                    elif strategy_type == "short" and daily_return > stop_threshold_return:
                        in_position = False
                        trial_pnls.append(pnl_pct) # Stop loss implies a negative PnL

            # If still in position at the end of the forecast horizon, close it
            if in_position:
                if strategy_type == "long":
                    pnl_pct = (price_paths[i, -1] - position_entry_price) / position_entry_price
                else: # short
                    pnl_pct = (position_entry_price - price_paths[i, -1]) / position_entry_price
                trial_pnls.append(pnl_pct)
                if pnl_pct > 0: wins += 1

            # Calculate drawdown for this trial's price path
            if len(price_paths[i]) > 0:
                print(f"DEBUG: price_paths[i] type: {type(price_paths[i])}, shape: {price_paths[i].shape}")
                print(f"DEBUG: initial_price type: {type(initial_price)}, value: {initial_price}")
                cumulative_returns = price_paths[i] / initial_price
                peak_values[i] = np.maximum.accumulate(cumulative_returns).max()
                drawdowns[i] = ((peak_values[i] - cumulative_returns) / peak_values[i]).max()
            else:
                drawdowns[i] = 0 # No drawdown if no price path

        if not trial_pnls: # Handle case where no trades were made
            total_pnl = 0
            win_rate = 0
            final_portfolio_value = initial_price
            sharpe_ratio = 0
            sortino_ratio = 0
            max_drawdown = 0
        else:
            total_pnl = np.mean(trial_pnls) * 100 # Average PnL percentage
            final_portfolio_value = initial_price * (1 + np.mean(trial_pnls))
            win_rate = (wins / len(trial_pnls)) * 100 if len(trial_pnls) > 0 else 0

            # Calculate Sharpe Ratio
            returns_series = pd.Series(trial_pnls)
            if returns_series.std() > 0:
                sharpe_ratio = returns_series.mean() / returns_series.std() * np.sqrt(252) # Annualized
            else:
                sharpe_ratio = 0

            # Calculate Sortino Ratio
            downside_returns = returns_series[returns_series < 0]
            if downside_returns.std() > 0:
                sortino_ratio = returns_series.mean() / downside_returns.std() * np.sqrt(252) # Annualized
            else:
                sortino_ratio = 0
            
            max_drawdown = np.mean(drawdowns) # Average max drawdown across trials

        return {
            "final_portfolio_value": final_portfolio_value,
            "total_pnl": total_pnl,
            "max_drawdown": max_drawdown,
            "win_rate": win_rate,
            "sharpe_ratio": sharpe_ratio,
            "sortino_ratio": sortino_ratio
        }

    def run_optimization(self) -> Dict[str, Any]:
        """
        Main method to run the advanced backtest, generate strategies, simulate, and rank them.
        """
        last_close_price = self.historical_data['Close'].iloc[-1]
        generated_strategies = self._generate_strategy_rules(last_close_price)
        
        results = []
        for strategy in generated_strategies:
            performance = self._simulate_strategy(strategy)
            strategy_with_performance = {**strategy, **performance}
            results.append(strategy_with_performance)
            
        # Rank strategies using a composite score
        # Composite Score = (Weight_PnL * PnL) + (Weight_Sharpe * Sharpe) - (Weight_Drawdown * Drawdown)
        # Higher PnL, higher Sharpe, lower Drawdown are better.
        
        # Define weights for the composite score
        WEIGHT_PNL = 0.4
        WEIGHT_SHARPE = 0.3
        WEIGHT_DRAWDOWN = 0.3 # Negative weight as lower drawdown is better

        for strategy in results:
            # Normalize metrics if necessary, or use raw values if ranges are comparable
            # For simplicity, using raw values for now.
            composite_score = (
                WEIGHT_PNL * strategy.get('total_pnl', 0) +
                WEIGHT_SHARPE * strategy.get('sharpe_ratio', 0) -
                WEIGHT_DRAWDOWN * strategy.get('max_drawdown', 0)
            )
            strategy['composite_score'] = composite_score
            
        ranked_strategies = sorted(results, key=lambda x: x.get('composite_score', -np.inf), reverse=True)
        
        return {
            "ranked_strategies": ranked_strategies[:self.strategy_count],
            "last_close_price": last_close_price
        }