
import pandas as pd
import pymetalog

def run_sip_simulation(file_path: str, column_name: str = None):
    """
    Runs a SIP simulation from a given data file (CSV or Excel).

    Args:
        file_path (str): The absolute path to the data file.
        column_name (str, optional): The name of the column containing the data. 
                                     If None, the first column is used.

    Returns:
        dict: A dictionary containing simulation results or an error message.
    """
    try:
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

        # Fit the metalog distribution
        metalog_dist = pymetalog.metalog(x=data_series.to_numpy())

        # Generate random variates (simulation)
        num_trials = 10000
        simulation_data = metalog_dist.rvs(num_trials)
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
        return {"error": f"An error occurred during simulation: {str(e)}"}

