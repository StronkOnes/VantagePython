
import { SimulationParams } from '../types';

const getApiBaseUrl = () => {
    if (import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    return 'http://localhost:8000';
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    }
    return {
        'Content-Type': 'application/json',
    };
};




export const uploadFile = async (file: File): Promise<{ file_path: string, filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/uploadfile/`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`File upload failed: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Failed to upload file.");
    }
};

export const getCsvColumns = async (filePath: string): Promise<string[]> => {
    const payload = { file_path: filePath };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/get_csv_columns/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Get CSV columns failed: ${response.status} ${errorBody}`);
        }

        const data = await response.json();
        return data.columns;

    } catch (error) {
        console.error("Error getting CSV columns:", error);
        throw new Error("Failed to get CSV columns.");
    }
};

export const runFileSimulation = async (filePath: string, columnName?: string, distribution_name?: string): Promise<any> => {
    const payload = {
        file_path: filePath,
        column_name: columnName,
        distribution_name
     };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/run_simulation/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Simulation failed: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error running simulation:", error);
        throw new Error("Failed to run simulation.");
    }
};

export const runTickerSimulation = async (ticker: string, years: number, distribution_name?: string): Promise<any> => {
    const payload = {
        ticker,
        years,
        distribution_name
     };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/run_ticker_simulation/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ticker simulation failed: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error running ticker simulation:", error);
        throw new Error("Failed to run ticker simulation.");
    }
};



// Simplified non-authenticated simulation functions
export const runSimpleFileSimulation = async (filePath: string, columnName?: string, distribution_name?: string): Promise<any> => {
    const payload = {
        file_path: filePath,
        column_name: columnName,
        distribution_name
     };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/simple_file_simulation/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Simple file simulation failed: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error running simple file simulation:", error);
        throw new Error("Failed to run simple file simulation.");
    }
};

export const validateTicker = async (ticker: string): Promise<boolean> => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/validate_ticker`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker }),
    });
    if (!response.ok) {
        return false;
    }
    const data = await response.json();
    return data.is_valid;
  } catch (error) {
    console.error('Error validating ticker:', error);
    return false;
  }
};

// Simple simulation using a ticker
export const runSimpleTickerSimulation = async (ticker: string, years: number, distribution: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/simple_ticker_simulation`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticker, years, distribution }),
    });
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Simple ticker simulation failed: ${response.status} ${errorBody}`);
    }
    return await response.json();
};


export const getSimulations = async (): Promise<any[]> => {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/simulations/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch simulations: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error fetching simulations:", error);
        throw new Error("Failed to fetch simulations.");
    }
};

export const runChatCompletion = async (prompt: string): Promise<any> => {
    const payload = {
        prompt
    };

    try {
        const response = await fetch(`${getApiBaseUrl()}/chat`, { // Assuming a /chat endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Chat API error: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error with chat API:", error);
        throw new Error("Failed to get chat completion.");
    }
};

export const loginUser = async (email: string, password: string): Promise<{ access_token: string; token_type: string }> => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await fetch(`${getApiBaseUrl()}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            const errorBody = await response.json(); // Assuming JSON error response from FastAPI
            throw new Error(errorBody.detail || `Login failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
};

export const registerUser = async (email: string, password: string, registrationCode: string): Promise<any> => {
    const payload = { email, password, registration_code: registrationCode };

    try {
        const response = await fetch(`${getApiBaseUrl()}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.json(); // Assuming JSON error response from FastAPI
            throw new Error(errorBody.detail || `Registration failed: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};

export const searchTickers = async (query: string): Promise<{ ticker: string; name: string }[]> => {
    const payload = { query };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/search_tickers/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Ticker search failed: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error searching tickers:", error);
        throw new Error("Failed to search tickers.");
    }
};

interface TradingStrategySimulationRequest {
    ticker: string;
    years: number;
    take_profit_pct?: number;
    stop_loss_pct?: number;
    num_trials: number;
    use_slurp: boolean;
    slurp_columns?: string[];
    forecast_horizon: number;
    entry_long_percentile: number;
    entry_short_percentile: number;
    exit_long_percentile: number;
    exit_short_percentile: number;
    entry_threshold_factor: number;
    exit_threshold_factor: number;
}

export const runBacktesterSimulation = async (params: any) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/run_backtester_simulation/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Backtester simulation failed: ${response.status} ${errorBody}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error running backtester simulation:", error);
    throw new Error("Failed to run backtester simulation.");
  }
};

interface StrategyOptimiserRequest {
    ticker: string;
    years: number;
    num_simulations: number;
    volatility_lookback_days: number;
    return_distribution_percentiles: number[];
    strategy_count: number;
}

export const runStrategyOptimiser = async (params: StrategyOptimiserRequest) => {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/optimise_strategy/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Strategy optimisation failed: ${response.status} ${errorBody}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error running strategy optimisation:", error);
    throw new Error("Failed to run strategy optimisation.");
  }
};
