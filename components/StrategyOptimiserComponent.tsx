import React, { useState } from 'react';
import { Box, TextField, Button, CircularProgress, Typography, Paper, MenuItem, Select, FormControl, InputLabel, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { runStrategyOptimiser } from '../services/apiService';
import StrategyCard from './StrategyCard';
import OptimiserTutorial from './OptimiserTutorial';

interface StrategyOptimiserResults {
  ranked_strategies: any[];
  ai_recommendation: string;
  last_close_price: number;
}

const StrategyOptimiserComponent: React.FC = () => {
  const [ticker, setTicker] = useState('EURUSD=X');
  const [years, setYears] = useState(5);
  const [numSimulations, setNumSimulations] = useState(1000);
  const [volatilityLookbackDays, setVolatilityLookbackDays] = useState(20);
  const [returnDistributionPercentiles, setReturnDistributionPercentiles] = useState<number[]>([0.05, 0.1, 0.25, 0.75, 0.9, 0.95]);
  const [strategyCount, setStrategyCount] = useState(5);

  const [results, setResults] = useState<StrategyOptimiserResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const handleRunOptimisation = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await runStrategyOptimiser({
        ticker,
        years,
        num_simulations: numSimulations,
        volatility_lookback_days: volatilityLookbackDays,
        return_distribution_percentiles: returnDistributionPercentiles,
        strategy_count: strategyCount,
      });
      setResults(response);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePercentilesChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setReturnDistributionPercentiles(
      typeof value === 'string' ? value.split(',').map(Number) : value,
    );
  };

  const getStrategyLabel = (index: number) => {
    switch (index) {
      case 0:
        return 'Best Overall';
      case 1:
        return 'High Risk/High Reward';
      case 2:
        return 'Defensive Option';
      default:
        return `Strategy ${index + 1}`;
    }
  };

  const percentileOptions = [
    { value: 0.01, label: '1st Percentile (Very Strict)' },
    { value: 0.05, label: '5th Percentile (Strict)' },
    { value: 0.1, label: '10th Percentile' },
    { value: 0.25, label: '25th Percentile (Moderate)' },
    { value: 0.5, label: '50th Percentile (Median)' },
    { value: 0.75, label: '75th Percentile (Aggressive)' },
    { value: 0.9, label: '90th Percentile' },
    { value: 0.95, label: '95th Percentile (Very Aggressive)' },
    { value: 0.99, label: '99th Percentile (Extremely Aggressive)' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>Strategy Optimiser (SIPmath)</Typography>
        <Button variant="outlined" onClick={() => setTutorialOpen(true)}>How to Use</Button>
      </Box>
      <OptimiserTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)} />
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
          label="Number of Simulations"
          type="number"
          value={numSimulations}
          onChange={(e) => setNumSimulations(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Volatility Lookback Days"
          type="number"
          value={volatilityLookbackDays}
          onChange={(e) => setVolatilityLookbackDays(Number(e.target.value))}
          fullWidth
          margin="normal"
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Return Distribution Percentiles</InputLabel>
            <Select
              multiple
              value={returnDistributionPercentiles}
              onChange={handlePercentilesChange}
              renderValue={(selected) => (selected as number[]).join(', ')}
            >
              {percentileOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Tooltip title="This value means the system looked at the distribution of daily returns and picked thresholds based on where the ‘tails’ of the data are. For example, the 5th percentile is like saying ‘only the worst 5% of days were worse than this.’" placement="top">
            <IconButton>
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <TextField
          label="Number of Strategies to Generate"
          type="number"
          value={strategyCount}
          onChange={(e) => setStrategyCount(Number(e.target.value))}
          fullWidth
          margin="normal"
        />

        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleRunOptimisation} 
          disabled={loading} 
          sx={{ mt: 3 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Run Strategy Optimisation'}
        </Button>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}

      {results && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h5" gutterBottom>Ranked Strategies</Typography>
          {results.ranked_strategies.map((strategy, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, border: index === 0 ? '2px solid #4caf50' : '1px solid #eee', borderRadius: '4px' }}>
              <Typography variant="h6">{getStrategyLabel(index)}: {strategy.name}</Typography>
              <StrategyCard strategy={strategy} lastClosePrice={results.last_close_price} ticker={ticker} />
            </Box>
          ))}
          
          <Typography variant="h5" sx={{ mt: 3 }}>AI Recommendation:</Typography>
          <Typography whiteSpace="pre-wrap">{results.ai_recommendation}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default StrategyOptimiserComponent;
