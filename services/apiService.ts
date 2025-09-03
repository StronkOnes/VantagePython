
import { Portfolio, SimulationParams, SimulationResult } from '../types';

const getApiBaseUrl = () => {
    return localStorage.getItem('chatApiEndpoint') || 'http://localhost:8000';
};

const getApiKey = () => {
    return localStorage.getItem('chatApiKey') || '';
}

export const runPortfolioSimulation = async (
    portfolio: Portfolio,
    params: SimulationParams
): Promise<SimulationResult> => {
    const payload = {
        portfolio,
        simulationParams: params,
    };

    try {
        const response = await fetch(`${getApiBaseUrl()}/simulate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Backend error: ${response.status} ${errorBody}`);
        }

        return await response.json();

    } catch (error) {
        console.error("Error calling backend:", error);
        throw new Error("Failed to run portfolio simulation.");
    }
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

export const runFileSimulation = async (filePath: string, columnName?: string): Promise<any> => {
    const payload = { 
        file_path: filePath,
        column_name: columnName
     };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/run_simulation/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

export const runTickerSimulation = async (ticker: string, years: number): Promise<any> => {
    const payload = { 
        ticker,
        years
     };

    try {
        const response = await fetch(`${getApiBaseUrl()}/api/run_ticker_simulation/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

export const runChatCompletion = async (prompt: string): Promise<any> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API key not configured.");
    }

    const payload = {
        prompt
    };

    try {
        const response = await fetch(`${getApiBaseUrl()}/chat`, { // Assuming a /chat endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
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
