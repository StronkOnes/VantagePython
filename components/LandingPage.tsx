
import React, { useState, useCallback } from 'react';
import {
    Container, Box, Typography, Button, TextField, CircularProgress, Alert, Paper, Grid, IconButton, Divider,
    FormControl, InputLabel, Select, MenuItem, Tooltip // New import: Tooltip
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import { uploadFile, runFileSimulation, runTickerSimulation, runChatCompletion } from '../services/apiService';
import InvestorReport from './InvestorReport'; // New import
// import SimulationResults from './SimulationResults'; // Removed
import ApiConfig from './ApiConfig';
import ChatInterface from './ChatInterface';

import HowToUseDataModal from './HowToUseDataModal'; // New import

const LandingPage: React.FC = () => {
    // State for file simulation
    const [file, setFile] = useState<File | null>(null);
    const [columnName, setColumnName] = useState<string>('');
    
    // New state for HowToUseDataModal
    const [isHowToUseDataModalOpen, setIsHowToUseDataModalOpen] = useState(false);
    
    // State for ticker simulation
    const [ticker, setTicker] = useState<string>('AAPL');
    const [years, setYears] = useState<string>('5');

    // New state for distribution selection
    const [distributionName, setDistributionName] = useState<string>('Normal'); // Default to Normal

    // Common state
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

    // Loading states for different simulations
    const [isLoadingFile, setIsLoadingFile] = useState(false);
    const [isLoadingTicker, setIsLoadingTicker] = useState(false);

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleRunFileSim = useCallback(async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setIsLoadingFile(true);
        setError(null);
        setSimulationResult(null);
        try {
            const uploadResponse = await uploadFile(file);
            // Pass distributionName to the backend
            const result = await runFileSimulation(uploadResponse.file_path, columnName || undefined, distributionName);
            if (result.error) setError(result.error); else setSimulationResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingFile(false);
        }
    }, [file, columnName, distributionName]); // Add distributionName to dependencies

    const handleRunTickerSim = useCallback(async () => {
        if (!ticker) {
            setError('Please enter a ticker symbol.');
            return;
        }
        setIsLoadingTicker(true);
        setError(null);
        setSimulationResult(null);
        try {
            // Pass distributionName to the backend
            const result = await runTickerSimulation(ticker, parseInt(years, 10), distributionName);
            if (result.error) setError(result.error); else setSimulationResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoadingTicker(false);
        }
    }, [ticker, years, distributionName]); // Add distributionName to dependencies

    const handleSendMessage = useCallback(async (message: string) => {
        setChatMessages((prevMessages) => [...prevMessages, { sender: 'user', text: message }]);
        try {
            const response = await runChatCompletion(message);
            setChatMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: response.response }]); // Assuming response has a 'response' field
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred during chat.');
            setChatMessages((prevMessages) => [...prevMessages, { sender: 'ai', text: 'Error: Could not get a response.' }]);
        }
    }, []);

    return (
        <Container maxWidth="lg">
            <ApiConfig open={isApiConfigOpen} onClose={() => setIsApiConfigOpen(false)} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.svg" alt="Vantage Financial Modeler Logo" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                    <Typography variant="h1" component="h1" sx={{fontSize: '2rem'}}>
                        Vantage Financial Modeler
                    </Typography>
                </Box>
                <Box>
                    <IconButton onClick={() => setIsApiConfigOpen(true)} color="primary" sx={{ mr: 1 }}><SettingsIcon /></IconButton>
                    <IconButton onClick={() => setIsChatOpen(!isChatOpen)} color="primary" sx={{ mr: 1 }}><ChatIcon /></IconButton>
                    {/* New button to open HowToUseDataModal */}
                    <Button variant="outlined" onClick={() => setIsHowToUseDataModalOpen(true)}>How to Use Results</Button>
                </Box>
            </Box>
            
            <Grid container spacing={4}>
                {/* Distribution Selector */}
                <Grid item xs={12}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h2" sx={{fontSize: '1.5rem', mb: 2}}>Select Distribution</Typography>
                        <FormControl fullWidth>
                            <InputLabel id="distribution-select-label">Distribution Type</InputLabel>
                            <Select
                                labelId="distribution-select-label"
                                id="distribution-select"
                                value={distributionName}
                                label="Distribution Type"
                                onChange={(e) => setDistributionName(e.target.value as string)}
                            >
                                <MenuItem value="Normal">Normal</MenuItem>
                                <MenuItem value="Uniform">Uniform</MenuItem>
                                <MenuItem value="Log-Normal">Log-Normal</MenuItem>
                                <MenuItem value="Beta">Beta</MenuItem>
                                <MenuItem value="Empirical">Empirical (Bootstrapping)</MenuItem>
                                {/* Add more MenuItem components for other distributions as they are added to the backend */}
                            </Select>
                        </FormControl>
                    </Paper>
                </Grid>

                {/* File Simulation Card */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h2" sx={{fontSize: '1.5rem', mb: 2}}>Simulate from File</Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <Button variant="contained" component="label" fullWidth>
                                    Upload CSV/Excel File
                                    <input type="file" hidden onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                                </Button>
                                {file && <Typography sx={{ mt: 1 }}>Selected: {file.name}</Typography>}
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth label="Column Name (optional)" variant="outlined" value={columnName} onChange={(e) => setColumnName(e.target.value)} helperText="Leave blank to use the first column" />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="primary" onClick={handleRunFileSim} disabled={isLoadingFile || !file} fullWidth sx={{ height: '56px' }}>
                                    {isLoadingFile ? <CircularProgress size={24} /> : 'Run from File'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Ticker Simulation Card */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h2" sx={{fontSize: '1.5rem', mb: 2}}>Simulate from Ticker</Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Ticker Symbol" variant="outlined" value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())} />
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                    e.g., AAPL, MSFT, EURUSD=X, AUDJPY=X
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Years of History" variant="outlined" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="secondary" onClick={handleRunTickerSim} disabled={isLoadingTicker || !ticker} fullWidth sx={{ height: '56px' }}>
                                    {isLoadingTicker ? <CircularProgress size={24} /> : 'Run from Ticker'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>}

            {simulationResult && <InvestorReport result={simulationResult} />}

            {isChatOpen && (
                <Box sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    width: 350,
                    height: 450,
                    boxShadow: 3,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    zIndex: 1300,
                    display: 'flex',
                    flexDirection: 'column',
                }}>
                    <ChatInterface onSendMessage={handleSendMessage} messages={chatMessages} />
                </Box>
            )}

            {/* Render HowToUseDataModal */}
            <HowToUseDataModal
                open={isHowToUseDataModalOpen}
                onClose={() => setIsHowToUseDataModalOpen(false)}
            />
        </Container>
    );
};

export default LandingPage;
