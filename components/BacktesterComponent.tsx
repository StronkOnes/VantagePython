import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Typography, Paper, Checkbox, FormControlLabel, FormGroup, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { runBacktesterSimulation } from '../services/apiService';

interface BacktesterSimulationResults {
  final_portfolio_value: number;
  total_pnl: number;
  trade_log: any[];
  ai_recommendation: string;
}

const BacktesterComponent: React.FC = () => {
  const [ticker, setTicker] = useState('EURUSD=X');
  const [years, setYears] = useState(5);
  const [takeProfitPct, setTakeProfitPct] = useState(0.02);
  const [stopLossPct, setStopLossPct] = useState(0.01);
  const [numTrials, setNumTrials] = useState(10000);
  const [useSlurp, setUseSlurp] = useState(false);
  const [slurpColumns, setSlurpColumns] = useState<string[]>(['Daily_Return', 'Daily_Volatility']);
  const [forecastHorizon, setForecastHorizon] = useState(5);
  const [entryLongPercentile, setEntryLongPercentile] = useState(0.75);
  const [entryShortPercentile, setEntryShortPercentile] = useState(0.25);
  const [exitLongPercentile, setExitLongPercentile] = useState(0.25);
  const [exitShortPercentile, setExitShortPercentile] = useState(0.75);
  const [entryThresholdFactor, setEntryThresholdFactor] = useState(1.005);
  const [exitThresholdFactor, setExitThresholdFactor] = useState(0.995);

  const [results, setResults] = useState<BacktesterSimulationResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSlurpColumnsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      setSlurpColumns(prev => [...prev, value]);
    } else {
      setSlurpColumns(prev => prev.filter(col => col !== value));
    }
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await runBacktesterSimulation({
        ticker,
        years,
        take_profit_pct: takeProfitPct,
        stop_loss_pct: stopLossPct,
        num_trials: numTrials,
        use_slurp: useSlurp,
        slurp_columns: useSlurp ? slurpColumns : undefined,
        forecast_horizon: forecastHorizon,
        entry_long_percentile: entryLongPercentile,
        entry_short_percentile: entryShortPercentile,
        exit_long_percentile: exitLongPercentile,
        exit_short_percentile: exitShortPercentile,
        entry_threshold_factor: entryThresholdFactor,
        exit_threshold_factor: exitThresholdFactor,
      });
      setResults(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Backtester</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <TextField
          label="Ticker (e.g., EURUSD=X)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Historical Years"
          type="number"
          value={years}
          onChange={(e) => setYears(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Take Profit % (e.g., 0.02 for 2%)"
          type="number"
          value={takeProfitPct}
          onChange={(e) => setTakeProfitPct(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Stop Loss % (e.g., 0.01 for 1%)"
          type="number"
          value={stopLossPct}
          onChange={(e) => setStopLossPct(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Number of Trials (SIPs)"
          type="number"
          value={numTrials}
          onChange={(e) => setNumTrials(Number(e.target.value))}
          fullWidth
          margin="normal"
        />

        <FormControlLabel
          control={<Checkbox checked={useSlurp} onChange={(e) => setUseSlurp(e.target.checked)} />}
          label="Use SLURP (Stochastic Library Unit with Relationships Preserved)"
        />
        {useSlurp && (
          <FormGroup>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Select Columns for SLURP:</Typography>
            <FormControlLabel
              control={<Checkbox checked={slurpColumns.includes('Daily_Return')} onChange={handleSlurpColumnsChange} value="Daily_Return" />}
              label="Daily Return"
            />
            <FormControlLabel
              control={<Checkbox checked={slurpColumns.includes('Daily_Volatility')} onChange={handleSlurpColumnsChange} value="Daily_Volatility" />}
              label="Daily Volatility"
            />
            {/* Add more options for SLURP columns as needed */}
          </FormGroup>
        )}

        <Typography variant="h5" sx={{ mt: 3, mb: 1 }}>SIP-based Entry/Exit Parameters</Typography>
        <TextField
          label="Forecast Horizon (days)"
          type="number"
          value={forecastHorizon}
          onChange={(e) => setForecastHorizon(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Entry Long Percentile (e.g., 0.75 for 75th)"
          type="number"
          value={entryLongPercentile}
          onChange={(e) => setEntryLongPercentile(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Entry Short Percentile (e.g., 0.25 for 25th)"
          type="number"
          value={entryShortPercentile}
          onChange={(e) => setEntryShortPercentile(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Exit Long Percentile (e.g., 0.25 for 25th)"
          type="number"
          value={exitLongPercentile}
          onChange={(e) => setExitLongPercentile(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Exit Short Percentile (e.g., 0.75 for 75th)"
          type="number"
          value={exitShortPercentile}
          onChange={(e) => setExitShortPercentile(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Entry Threshold Factor (e.g., 1.005 for 0.5% above current price)"
          type="number"
          value={entryThresholdFactor}
          onChange={(e) => setEntryThresholdFactor(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Exit Threshold Factor (e.g., 0.995 for 0.5% below current price)"
          type="number"
          value={exitThresholdFactor}
          onChange={(e) => setExitThresholdFactor(Number(e.target.value))}
          fullWidth
          margin="normal"
        />

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRunSimulation} 
          disabled={loading} 
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Run Backtester Simulation'}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}

      {results && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>Simulation Results</Typography>
          <Typography><strong>Final Portfolio Value:</strong> {results.final_portfolio_value.toFixed(2)}</Typography>
          <Typography><strong>Total PnL:</strong> {results.total_pnl.toFixed(2)}</Typography>
          
          <Typography variant="h6" sx={{ mt: 2 }}>AI Recommendation:</Typography>
          <Typography whiteSpace="pre-wrap"> {results.ai_recommendation}</Typography>

          <Typography variant="h6" sx={{ mt: 2 }}>Trade Log:</Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid #eee', p: 1 }}>
            {results.trade_log.map((log, index) => (
              <Typography key={index} variant="body2">{JSON.stringify(log)}</Typography>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default BacktesterComponent;
