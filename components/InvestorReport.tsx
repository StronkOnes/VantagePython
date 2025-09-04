import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface InvestorReportProps {
  result: {
    summary_stats: {
      mean: number;
      std_dev: number;
      min: number;
      max: number;
      percentile_5th: number;
      percentile_50th: number;
      percentile_95th: number;
    };
    simulation_data: number[];
  };
}

const InvestorReport: React.FC<InvestorReportProps> = ({ result }) => {
  const { summary_stats, simulation_data } = result;

  // Function to create histogram data for Chart.js
  const createHistogramData = (data: number[], bins: number = 20) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    const binWidth = range / bins;

    const counts = new Array(bins).fill(0);
    const labels = [];

    for (let i = 0; i < bins; i++) {
      const lowerBound = min + i * binWidth;
      const upperBound = lowerBound + binWidth;
      labels.push(`${lowerBound.toFixed(2)}-${upperBound.toFixed(2)}`);
      
      for (const value of data) {
        if (value >= lowerBound && (i === bins - 1 ? value <= upperBound : value < upperBound)) {
          counts[i]++;
        }
      }
    }
    return { labels, counts };
  };

  const { labels, counts } = createHistogramData(simulation_data);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Simulated Price Frequency',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Distribution of Simulated Prices',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Price Bins',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom>
        Investor Simulation Report
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Summary Statistics
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell align="right">Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Mean</TableCell>
                <TableCell align="right">{summary_stats.mean.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Standard Deviation</TableCell>
                <TableCell align="right">{summary_stats.std_dev.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Minimum</TableCell>
                <TableCell align="right">{summary_stats.min.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Maximum</TableCell>
                <TableCell align="right">{summary_stats.max.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5th Percentile</TableCell>
                <TableCell align="right">{summary_stats.percentile_5th.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>50th Percentile (Median)</TableCell>
                <TableCell align="right">{summary_stats.percentile_50th.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>95th Percentile</TableCell>
                <TableCell align="right">{summary_stats.percentile_95th.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h3" gutterBottom>
          Simulated Price Distribution
        </Typography>
        <Box sx={{ height: 300 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Paper>

      {summary_stats && ( // Conditional rendering
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" component="h3" gutterBottom>
            Example Trading Scenarios (Based on Price Distribution)
          </Typography>
          <Typography variant="body1" paragraph>
            The following scenarios are derived from the statistical distribution of the simulation data. They provide potential strategies for both long and short positions based on conservative and aggressive approaches. These are not financial advice but illustrative examples based on the simulation.
          </Typography>

          {/* Long Position Scenarios */}
          <Typography variant="h6" component="h4" gutterBottom sx={{ mt: 3, color: 'primary.main' }}>
            Long Position Scenarios
          </Typography>

          <Typography variant="subtitle1" gutterBottom><b>Conservative Long Strategy</b></Typography>
          <Typography variant="body2" paragraph>
            This strategy aims to enter a long position at a level of strong statistical support, targeting a reversion to the upper end of the distribution.
            <ul>
              <li><b>Entry Point:</b> Consider entering near the <b>{summary_stats.percentile_5th.toFixed(2)}</b> (5th Percentile). This is a level where only 5% of simulated outcomes were lower, suggesting a potential price floor.</li>
              <li><b>Take-Profit Target:</b> A potential exit to lock in gains could be the <b>{summary_stats.percentile_95th.toFixed(2)}</b> (95th Percentile), representing a statistically optimistic outcome.</li>
              <li><b>Stop-Loss:</b> A stop-loss could be placed just below the entry point, for instance, below the <b>{summary_stats.min.toFixed(2)}</b> (Simulated Minimum), to exit if the price breaks this strong support.</li>
            </ul>
          </Typography>

          <Typography variant="subtitle1" gutterBottom><b>Aggressive Long Strategy</b></Typography>
          <Typography variant="body2" paragraph>
            This strategy involves entering closer to the center of the distribution, anticipating a continued upward movement.
            <ul>
              <li><b>Entry Point:</b> Consider entering near the <b>{summary_stats.percentile_50th.toFixed(2)}</b> (Median). This represents the central tendency of the simulation. This is more aggressive as the price has already moved up from the lows.</li>
              <li><b>Take-Profit Target:</b> The take-profit target remains at the <b>{summary_stats.percentile_95th.toFixed(2)}</b> (95th Percentile) or even higher, near the <b>{summary_stats.max.toFixed(2)}</b> (Simulated Maximum) for a more optimistic target.</li>
              <li><b>Stop-Loss:</b> A stop-loss could be placed below the <b>{summary_stats.percentile_5th.toFixed(2)}</b> (5th Percentile), providing a wider risk margin compared to the conservative strategy.</li>
            </ul>
          </Typography>

          {/* Short Position Scenarios */}
          <Typography variant="h6" component="h4" gutterBottom sx={{ mt: 3, color: 'secondary.main' }}>
            Short Position Scenarios
          </Typography>

          <Typography variant="subtitle1" gutterBottom><b>Conservative Short Strategy</b></Typography>
          <Typography variant="body2" paragraph>
            This strategy aims to enter a short position at a level of strong statistical resistance, targeting a reversion to the lower end of the distribution.
            <ul>
              <li><b>Entry Point:</b> Consider entering near the <b>{summary_stats.percentile_95th.toFixed(2)}</b> (95th Percentile). This is a level where only 5% of simulated outcomes were higher, suggesting a potential price ceiling.</li>
              <li><b>Take-Profit Target:</b> A potential exit to lock in gains could be the <b>{summary_stats.percentile_5th.toFixed(2)}</b> (5th Percentile), representing a statistically pessimistic outcome.</li>
              <li><b>Stop-Loss:</b> A stop-loss could be placed just above the entry point, for instance, above the <b>{summary_stats.max.toFixed(2)}</b> (Simulated Maximum), to exit if the price breaks this strong resistance.</li>
            </ul>
          </Typography>

          <Typography variant="subtitle1" gutterBottom><b>Aggressive Short Strategy</b></Typography>
          <Typography variant="body2" paragraph>
            This strategy involves entering closer to the center of the distribution, anticipating a continued downward movement.
            <ul>
              <li><b>Entry Point:</b> Consider entering near the <b>{summary_stats.percentile_50th.toFixed(2)}</b> (Median). This is more aggressive as the price has not yet reached the peak of the distribution.</li>
              <li><b>Take-Profit Target:</b> The take-profit target remains at the <b>{summary_stats.percentile_5th.toFixed(2)}</b> (5th Percentile) or even lower, near the <b>{summary_stats.min.toFixed(2)}</b> (Simulated Minimum) for a more optimistic target.</li>
              <li><b>Stop-Loss:</b> A stop-loss could be placed above the <b>{summary_stats.percentile_95th.toFixed(2)}</b> (95th Percentile), providing a wider risk margin.</li>
            </ul>
          </Typography>

          <Typography variant="h6" component="h4" gutterBottom sx={{ mt: 3 }}>
            Risk Assessment based on Volatility
          </Typography>
          <Typography variant="body2" paragraph>
            Volatility, represented by the <b>Standard Deviation of {summary_stats.std_dev.toFixed(2)}</b>, is a critical factor in risk management. It measures how spread out the simulated price outcomes are from the average (mean) price.
          </Typography>
          
          {(summary_stats.std_dev / summary_stats.mean > 0.15) ? (
            <Typography variant="body2" paragraph>
              <b>Analysis:</b> The current volatility is relatively <b>high</b> (Standard Deviation is more than 15% of the Mean). This implies a wide range of possible outcomes and significant price swings.
              <br/><b>Strategic Recommendation:</b>
              <ul>
                <li><b>Use Wider Stops:</b> To avoid being stopped out by normal market noise, your stop-loss orders may need to be placed further from your entry point.</li>
                <li><b>Reduce Position Size:</b> To manage the increased risk, consider reducing your position size. The Turtle Calculator can help you adjust this based on your risk tolerance.</li>
                <li><b>Favor Conservative Entries:</b> In a high-volatility environment, waiting for clearer, more conservative entry signals (e.g., at the 5th or 95th percentiles) can be a prudent approach.</li>
              </ul>
            </Typography>
          ) : (
            <Typography variant="body2" paragraph>
              <b>Analysis:</b> The current volatility is relatively <b>low</b> (Standard Deviation is less than 15% of the Mean). This suggests that price movements are expected to be more contained and less erratic.
              <br/><b>Strategic Recommendation:</b>
              <ul>
                <li><b>Tighter Stops:</b> You may be able to use tighter stop-loss orders as the risk of large, unexpected swings is lower.</li>
                <li><b>Range-Bound Strategies:</b> Low volatility can sometimes indicate a lack of a strong trend. In such cases, strategies that profit from price moving within a range (e.g., buying at support and selling at resistance) might be more effective.</li>
                <li><b>Monitor for Breakouts:</b> A period of low volatility can often be followed by a significant price breakout. Be alert for signs that the price is starting to move out of its current range with increasing momentum.</li>
              </ul>
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default InvestorReport;