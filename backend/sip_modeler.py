
import pandas as pd
from scipy.stats import norm, uniform, lognorm, beta
import numpy as np
import traceback

DISTRIBUTIONS = {
    "Normal": norm,
    "Uniform": uniform,
    "Log-Normal": lognorm,
    "Beta": beta,
    "Empirical": None, # Empirical data doesn't have a scipy.stats object
    # Add more distributions as needed
}

def run_sip_simulation(file_path: str, column_name: str = None, distribution_name: str = "Normal"):
    """
    Runs a SIP simulation from a given data file (CSV or Excel).

    Args:
        file_path (str): The absolute path to the data file.
        column_name (str, optional): The name of the column containing the data. 
                                     If None, the first column is used.
        distribution_name (str, optional): The name of the distribution to fit. Defaults to "Normal".

    Returns:
        dict: A dictionary containing simulation results or an error message.
    """
    try:
        num_trials = 10000 # Define num_trials at the beginning of the function
        # Read the data from the file
        if file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        elif file_path.endswith(('.xls', '.xlsx')):
            df = pd.read_excel(file_path)
        else:
            return {"error": "Unsupported file format. Please use CSV or Excel."}

        # Select the data column
        if column_name and column_name in df.columns:
            data_series = df[column_name]
        else:
            data_series = df.iloc[:, 0]
        
        # Ensure data is numeric and drop non-numeric values
        data_series = pd.to_numeric(data_series, errors='coerce').dropna()

        if data_series.empty:
            return {"error": "No valid numeric data found in the selected column."}

        # Get the selected distribution
        if distribution_name not in DISTRIBUTIONS:
            return {"error": f"Unsupported distribution: {distribution_name}. Available distributions are: {', '.join(DISTRIBUTIONS.keys())}"}
        
        dist = DISTRIBUTIONS[distribution_name]

        # Fit the distribution
        if distribution_name == "Empirical":
            # For empirical, directly sample from the data_series
            simulation_data = np.random.choice(data_series, size=num_trials, replace=True)
        elif distribution_name == "Uniform":
            # Uniform distribution fit requires min and max
            loc, scale = data_series.min(), data_series.max() - data_series.min()
            params = (loc, scale)
            simulation_data = dist.rvs(*params, size=num_trials)
        elif distribution_name == "Beta":
            # Beta distribution requires data to be in [0, 1]
            # Normalize data to [0, 1] for Beta distribution fitting
            min_val = data_series.min()
            max_val = data_series.max()
            if min_val == max_val: # Handle constant data
                normalized_data = np.full_like(data_series, 0.5)
            else:
                normalized_data = (data_series - min_val) / (max_val - min_val)
            
            # Ensure no exact 0 or 1 values for beta fit
            normalized_data = np.clip(normalized_data, 1e-10, 1 - 1e-10)
            
            a, b, loc, scale = dist.fit(normalized_data)
            params = (a, b, loc, scale)
            simulation_data = dist.rvs(*params, size=num_trials)
            simulation_data = simulation_data * (max_val - min_val) + min_val
        else:
            # For Normal, Log-Normal, etc., use standard fit
            params = dist.fit(data_series)
            simulation_data = dist.rvs(*params, size=num_trials)
        
        
        simulation_data = np.asarray(simulation_data) # Ensure it's a NumPy array

        # Calculate summary statistics
        summary_stats = {
            "mean": np.mean(simulation_data),
            "std_dev": np.std(simulation_data),
            "min": np.min(simulation_data),
            "max": np.max(simulation_data),
            "percentile_5th": np.percentile(simulation_data, 5),
            "percentile_50th": np.percentile(simulation_data, 50),
            "percentile_95th": np.percentile(simulation_data, 95),
        }

        return {
            "summary_stats": summary_stats,
            "simulation_data": simulation_data.tolist(), # Convert to list for JSON serialization
            "error": None
        }

    except Exception as e:
        full_traceback = traceback.format_exc()
        return {"error": f"An error occurred during simulation: {str(e)}\nFull Traceback:\n{full_traceback}"}

