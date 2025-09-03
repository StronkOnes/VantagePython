
import React, { useState, useCallback } from 'react';
import { 
    Container, Box, Typography, Button, TextField, CircularProgress, Alert, Paper, Grid, IconButton, Divider
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import { uploadFile, runFileSimulation, runTickerSimulation, runChatCompletion } from '../services/apiService';
import SimulationResults from './SimulationResults';
import ApiConfig from './ApiConfig';
import ChatInterface from './ChatInterface';

const LandingPage: React.FC = () => {
    // State for file simulation
    const [file, setFile] = useState<File | null>(null);
    const [columnName, setColumnName] = useState<string>('');
    
    // State for ticker simulation
    const [ticker, setTicker] = useState<string>('AAPL');
    const [years, setYears] = useState<string>('5');

    // Common state
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);

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
        setIsLoading(true);
        setError(null);
        setSimulationResult(null);
        try {
            const uploadResponse = await uploadFile(file);
            const result = await runFileSimulation(uploadResponse.file_path, columnName || undefined);
            if (result.error) setError(result.error); else setSimulationResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [file, columnName]);

    const handleRunTickerSim = useCallback(async () => {
        if (!ticker) {
            setError('Please enter a ticker symbol.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setSimulationResult(null);
        try {
            const result = await runTickerSimulation(ticker, parseInt(years, 10));
            if (result.error) setError(result.error); else setSimulationResult(result);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [ticker, years]);

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
                <Typography variant="h1" component="h1" sx={{fontSize: '2rem'}}>
                    Vantage Financial Modeler
                </Typography>
                <Box>
                    <IconButton onClick={() => setIsApiConfigOpen(true)} color="primary" sx={{ mr: 1 }}><SettingsIcon /></IconButton>
                    <IconButton onClick={() => setIsChatOpen(!isChatOpen)} color="primary"><ChatIcon /></IconButton>
                </Box>
            </Box>
            
            <Grid container spacing={4}>
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
                                <Button variant="contained" color="primary" onClick={handleRunFileSim} disabled={isLoading || !file} fullWidth sx={{ height: '56px' }}>
                                    {isLoading ? <CircularProgress size={24} /> : 'Run from File'}
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
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Years of History" variant="outlined" type="number" value={years} onChange={(e) => setYears(e.target.value)} />
                            </Grid>
                            <Grid item xs={12}>
                                <Button variant="contained" color="secondary" onClick={handleRunTickerSim} disabled={isLoading || !ticker} fullWidth sx={{ height: '56px' }}>
                                    {isLoading ? <CircularProgress size={24} /> : 'Run from Ticker'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>}

            {simulationResult && <SimulationResults result={simulationResult} />}

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
        </Container>
    );
};

export default LandingPage;
