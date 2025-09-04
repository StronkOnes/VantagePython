import pandas as pd

try:
    df = pd.read_csv("/home/kobese/vantagepython/Vantage for Financial Analysis/backend/uploads/apple_5yr_one.csv")
    print("File read successfully. First 5 rows:\n", df.head())
except Exception as e:
    print(f"Error reading file: {e}")
