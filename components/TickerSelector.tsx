import React, { useState } from 'react';
import {
    Box, Typography, Chip, Button, Modal, TextField, Card, CardContent, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TickerLexicon from './TickerLexicon';

interface TickerSelectorProps {
    onSelect: (ticker: string) => void;
}

const commodities = {
    Metals: [
        { name: 'Gold', ticker: 'GC=F' },
        { name: 'Silver', ticker: 'SI=F' },
        { name: 'Copper', ticker: 'HG=F' },
        { name: 'Platinum', ticker: 'PL=F' },
        { name: 'Palladium', ticker: 'PA=F' },
        { name: 'Aluminum', ticker: 'ALI=F' },
        { name: 'Zinc', ticker: 'ZN=F' },
        { name: 'Tin', ticker: 'TIN=F' },
        { name: 'Nickel', ticker: 'NICKEL=F' },
        { name: 'Lead', ticker: 'LEAD=F' },
    ],
    Energy: [
        { name: 'Crude Oil', ticker: 'CL=F' },
        { name: 'Brent Crude', ticker: 'BZ=F' },
        { name: 'Natural Gas', ticker: 'NG=F' },
        { name: 'Heating Oil', ticker: 'HO=F' },
        { name: 'Gasoline', ticker: 'RB=F' },
    ],
    Agriculture: [
        { name: 'Corn', ticker: 'ZC=F' },
        { name: 'Soybeans', ticker: 'ZS=F' },
        { name: 'Wheat', ticker: 'ZW=F' },
        { name: 'Coffee', ticker: 'KC=F' },
        { name: 'Cotton', ticker: 'CT=F' },
        { name: 'Sugar', ticker: 'SB=F' },
        { name: 'Cocoa', ticker: 'CC=F' },
        { name: 'Orange Juice', ticker: 'OJ=F' },
        { name: 'Live Cattle', ticker: 'LE=F' },
        { name: 'Feeder Cattle', ticker: 'GF=F' },
        { name: 'Lean Hogs', ticker: 'HE=F' },
    ],
    Lumber: [
        { name: 'Lumber', ticker: 'LBS=F' },
    ]
};

const indices = {
    US: [
        { name: 'S&P 500', ticker: '^GSPC' },
        { name: 'Dow Jones', ticker: '^DJI' },
        { name: 'NASDAQ', ticker: '^IXIC' },
        { name: 'Russell 2000', ticker: '^RUT' },
    ],
    Europe: [
        { name: 'FTSE 100', ticker: '^FTSE' },
        { name: 'DAX', ticker: '^GDAXI' },
        { name: 'CAC 40', ticker: '^FCHI' },
        { name: 'Euro Stoxx 50', ticker: '^STOXX50E' },
    ],
    Asia: [
        { name: 'Nikkei 225', ticker: '^N225' },
        { name: 'Hang Seng', ticker: '^HSI' },
        { name: 'Shanghai Composite', ticker: '000001.SS' },
        { name: 'CSI 300', ticker: '000300.SS' },
    ],
    Other: [
        { name: 'S&P/TSX Composite', ticker: '^GSPTSE' },
        { name: 'Bovespa Index', ticker: '^BVSP' },
        { name: 'S&P/ASX 200', ticker: '^AXJO' },
    ]
};

const TickerSelector: React.FC<TickerSelectorProps> = ({ onSelect }) => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const filteredCommodities = Object.entries(commodities).reduce((acc, [category, items]) => {
        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredItems.length > 0) {
            acc[category] = filteredItems;
        }
        return acc;
    }, {} as typeof commodities);

    const filteredIndices = Object.entries(indices).reduce((acc, [category, items]) => {
        const filteredItems = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.ticker.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredItems.length > 0) {
            acc[category] = filteredItems;
        }
        return acc;
    }, {} as typeof indices);

    return (
        <Card sx={{ my: 2, backgroundColor: '#1a202c' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Find a Ticker</Typography>
                    <Button onClick={handleOpen} variant="outlined">Open Ticker Lexicon</Button>
                </Box>

                <TextField
                    fullWidth
                    placeholder="Search for a ticker or instrument name"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Stocks</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    For stocks, use the company's ticker symbol. For example, Apple is AAPL, Google is GOOGL. You can find these on any financial website.
                </Typography>

                <Typography variant="subtitle1" gutterBottom>Currencies</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    For currencies, use the format XXXYYY=X, where XXX and YYY are the three-letter currency codes. For example, EUR/USD is EURUSD=X.
                </Typography>

                {Object.keys(filteredCommodities).length > 0 && Object.entries(filteredCommodities).map(([category, items]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>{category}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {items.map((item) => (
                                <Chip key={item.ticker} label={item.name} onClick={() => onSelect(item.ticker)} variant="outlined" />
                            ))}
                        </Box>
                    </Box>
                ))}

                {Object.keys(filteredIndices).length > 0 && Object.entries(filteredIndices).map(([category, items]) => (
                    <Box key={category} sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>{category}</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {items.map((item) => (
                                <Chip key={item.ticker} label={item.name} onClick={() => onSelect(item.ticker)} variant="outlined" />
                            ))}
                        </Box>
                    </Box>
                ))}
            </CardContent>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="ticker-lexicon-modal-title"
                aria-describedby="ticker-lexicon-modal-description"
            >
                <Box sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '80%',
                    maxWidth: 800,
                    bgcolor: '#1a202c',
                    border: '2px solid #000',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    <TickerLexicon />
                </Box>
            </Modal>
        </Card>
    );
};

export default TickerSelector;
