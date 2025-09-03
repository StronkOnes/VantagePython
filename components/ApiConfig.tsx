
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box } from '@mui/material';

interface ApiConfigProps {
    open: boolean;
    onClose: () => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ open, onClose }) => {
    const [endpoint, setEndpoint] = useState('');
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        const savedEndpoint = localStorage.getItem('chatApiEndpoint') || '';
        const savedApiKey = localStorage.getItem('chatApiKey') || '';
        setEndpoint(savedEndpoint);
        setApiKey(savedApiKey);
    }, []);

    const handleSave = () => {
        localStorage.setItem('chatApiEndpoint', endpoint);
        localStorage.setItem('chatApiKey', apiKey);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Configure Chat API</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="API Endpoint"
                        variant="outlined"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        helperText="Enter the base URL of the chat API"
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <TextField
                        fullWidth
                        label="API Key"
                        variant="outlined"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained">Save</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApiConfig;
