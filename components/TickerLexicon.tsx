import React, { useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Link, TextField, Button } from '@mui/material';

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

const TickerLexicon: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [yahooSearchTerm, setYahooSearchTerm] = useState('');

    const handleYahooSearch = () => {
        if (yahooSearchTerm) {
            window.open(`https://finance.yahoo.com/lookup/all?s=${encodeURIComponent(yahooSearchTerm)}`, '_blank');
        }
    };

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
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Ticker Lexicon</Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Search Tickers</Typography>
            <TextField
                fullWidth
                label="Search by name or ticker"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Search on Yahoo Finance</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                    fullWidth
                    label="Enter a company name or ticker"
                    variant="outlined"
                    value={yahooSearchTerm}
                    onChange={(e) => setYahooSearchTerm(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleYahooSearch();
                        }
                    }}
                />
                <Button variant="contained" onClick={handleYahooSearch}>Search</Button>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Stocks</Typography>
            <Typography paragraph>
                For individual stocks, you typically use the company's official ticker symbol. For example, Apple Inc. is <strong>AAPL</strong>, and Microsoft Corporation is <strong>MSFT</strong>. You can usually find these symbols on any major financial news website (e.g., Yahoo Finance, Google Finance) or your brokerage platform.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Currencies (Forex)</Typography>
            <Typography paragraph>
                For currency pairs, the convention is usually a combination of the two currency codes followed by <strong>=X</strong>. For example, the Euro against the US Dollar is <strong>EURUSD=X</strong>, and the British Pound against the Japanese Yen is <strong>GBPJPY=X</strong>. The '=X' suffix is common for currency pairs on Yahoo Finance.
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Commodities</Typography>
            {Object.entries(filteredCommodities).map(([category, items]) => (
                <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom><strong>{category}</strong></Typography>
                    <List dense>
                        {items.map((item) => (
                            <ListItem key={item.ticker}>
                                <ListItemText primary={`${item.name}: ${item.ticker}`} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Indices</Typography>
            {Object.entries(filteredIndices).map(([category, items]) => (
                <Box key={category} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom><strong>{category}</strong></Typography>
                    <List dense>
                        {items.map((item) => (
                            <ListItem key={item.ticker}>
                                <ListItemText primary={`${item.name}: ${item.ticker}`} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>External Resources</Typography>
            <Typography paragraph>
                If you cannot find a specific ticker, you can often use external financial data websites to search for them. Here are some reliable sources:
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemText>
                        <Link href="https://finance.yahoo.com/" target="_blank" rel="noopener">Yahoo Finance</Link> - A widely used source for stock, commodity, and currency tickers.
                    </ListItemText>
                </ListItem>
                <ListItem>
                    <ListItemText>
                        <Link href="https://www.investing.com/" target="_blank" rel="noopener">Investing.com</Link> - Another comprehensive financial portal with a good search function for various assets.
                    </ListItemText>
                </ListItem>
            </List>
        </Box>
    );
};

export default TickerLexicon;
