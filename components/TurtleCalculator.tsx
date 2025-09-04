
import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Grid,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Button,
} from '@mui/material';

interface CalculationResults {
  positionSize: number;
  stopLoss: string;
  takeProfit: string;
  add1: string;
  add2: string;
  add3: string;
}

const TurtleCalculator: React.FC = () => {
  const [accountSize, setAccountSize] = useState<number | ''>('');
  const [riskPercentage, setRiskPercentage] = useState<number | ''>('');
  const [atr, setAtr] = useState<number | ''>('');
  const [entryPrice, setEntryPrice] = useState<number | ''>('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [results, setResults] = useState<CalculationResults | null>(null);

  const handleCalculate = () => {
    const accSize = parseFloat(accountSize as string);
    const riskPct = parseFloat(riskPercentage as string) / 100;
    const atrVal = parseFloat(atr as string);
    const entry = parseFloat(entryPrice as string);

    if (isNaN(accSize) || isNaN(riskPct) || isNaN(atrVal) || isNaN(entry)) {
      setResults(null);
      return;
    }

    const riskPerTrade = accSize * riskPct;
    const positionSize = Math.floor(riskPerTrade / (2 * atrVal));
    
    const stopLoss = direction === 'long' ? entry - (2 * atrVal) : entry + (2 * atrVal);
    const takeProfit = direction === 'long' ? entry + (4 * atrVal) : entry - (4 * atrVal);

    const add1 = direction === 'long' ? entry + (0.5 * atrVal) : entry - (0.5 * atrVal);
    const add2 = direction === 'long' ? entry + (1.0 * atrVal) : entry - (1.0 * atrVal);
    const add3 = direction === 'long' ? entry + (1.5 * atrVal) : entry - (1.5 * atrVal);

    setResults({
      positionSize,
      stopLoss: stopLoss.toFixed(4),
      takeProfit: takeProfit.toFixed(4),
      add1: add1.toFixed(4),
      add2: add2.toFixed(4),
      add3: add3.toFixed(4),
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Turtle Trading Calculator
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Account Size"
              type="number"
              fullWidth
              value={accountSize}
              onChange={(e) => setAccountSize(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Risk Percentage (%)"
              type="number"
              fullWidth
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="ATR (Average True Range)"
              type="number"
              fullWidth
              value={atr}
              onChange={(e) => setAtr(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Entry Price"
              type="number"
              fullWidth
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Trade Direction</FormLabel>
              <RadioGroup
                row
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'long' | 'short')}
              >
                <FormControlLabel value="long" control={<Radio />} label="Long" />
                <FormControlLabel value="short" control={<Radio />} label="Short" />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary" onClick={handleCalculate}>
              Calculate
            </Button>
          </Grid>
        </Grid>

        {results && (
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Results
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Position Size: {results.positionSize} units</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={{ color: 'red' }}>Stop-Loss: {results.stopLoss}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" sx={{ color: 'green' }}>Take-Profit: {results.takeProfit}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6">Pyramid/Scale-in Prices:</Typography>
                <ul>
                  <li><Typography>Add 1: {results.add1}</Typography></li>
                  <li><Typography>Add 2: {results.add2}</Typography></li>
                  <li><Typography>Add 3: {results.add3}</Typography></li>
                </ul>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default TurtleCalculator;
