import React from 'react';
import { Modal, Box, Typography, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface HowToUseDataModalProps {
  open: boolean;
  onClose: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxHeight: '90%',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'auto',
};

const HowToUseDataModal: React.FC<HowToUseDataModalProps> = ({ open, onClose }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="how-to-use-data-modal-title"
      aria-describedby="how-to-use-data-modal-description"
    >
      <Box sx={style}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography id="how-to-use-data-modal-title" variant="h4" component="h2" gutterBottom>
          How to Use This Site
        </Typography>
        <Typography variant="body1" paragraph>
          This site is designed to help you make more informed trading decisions by providing powerful simulation tools and calculators. Here's a breakdown of the key features and how to use them.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" component="h3" gutterBottom>
          1. The Simulation Page
        </Typography>
        <Typography variant="body1" paragraph>
          The simulation page is the core of the application. It allows you to run a Monte Carlo simulation on your own financial data (from a CSV or Excel file). The simulation generates thousands of potential future price outcomes, giving you a statistical edge.
        </Typography>
        <ul>
          <li><b>File Upload:</b> Upload a file containing historical price data.</li>
          <li><b>Column Selection:</b> Choose the specific column from your file that you want to analyze.</li>
          <li><b>Distribution Selection:</b> Select a statistical distribution to model your data. For asset prices, <b>Log-Normal</b> is often a good choice. <b>Empirical</b> is great for a data-driven approach without theoretical assumptions.</li>
        </ul>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" component="h3" gutterBottom>
          2. The Investor Report
        </Typography>
        <Typography variant="body1" paragraph>
          After running a simulation, you'll receive a detailed Investor Report. This report is broken down into several key sections:
        </Typography>
        <ul>
            <li><b>Summary Statistics:</b> This table gives you a quick overview of the simulation results, including the mean, standard deviation, and key percentiles.</li>
            <li><b>Trading Scenarios:</b> This is where the simulation data is translated into actionable trading ideas. It provides both <b>Long</b> and <b>Short</b> position scenarios, with both <b>Conservative</b> and <b>Aggressive</b> strategies. Each strategy includes explicit entry, stop-loss, and take-profit levels based on the simulation's statistics.</li>
            <li><b>Risk Assessment based on Volatility:</b> This section analyzes the volatility of the simulated data and provides strategic recommendations. It will tell you if volatility is high or low and suggest how to adjust your trading strategy accordingly (e.g., using wider stops in high volatility).</li>
        </ul>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" component="h3" gutterBottom>
          3. The Turtle Calculator
        </Typography>
        <Typography variant="body1" paragraph>
          The Turtle Calculator is a tool for position sizing and risk management based on the famous Turtle Trading system. It helps you determine how many units of an asset to trade based on your account size, risk tolerance, and the asset's volatility (ATR).
        </Typography>
        <ul>
            <li><b>Account Size:</b> Your total trading capital.</li>
            <li><b>Risk Percentage:</b> The percentage of your account you are willing to risk on a single trade (e.g., 1% or 2%).</li>
            <li><b>ATR (Average True Range):</b> A measure of the asset's volatility. You can get this from your trading platform.</li>
            <li><b>Entry Price:</b> The price at which you intend to enter the trade.</li>
        </ul>
        <Typography variant="body1" paragraph>
          Based on these inputs, the calculator will provide you with:
        </Typography>
        <ul>
            <li><b>Position Size:</b> The number of units to trade.</li>
            <li><b>Stop-Loss:</b> The price at which you should exit the trade to cut your losses.</li>
            <li><b>Take-Profit:</b> A potential price target to exit the trade with a profit.</li>
            <li><b>Pyramid/Scale-in Prices:</b> Prices at which you can add to your position if the trade moves in your favor.</li>
        </ul>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" component="h3" gutterBottom>
          4. Understanding the Distributions
        </Typography>
        <Typography variant="body1" paragraph>
          The simulation tool allows you to model your data using several different statistical distributions. Choosing the right one depends on the nature of your data. Here are some simple explanations:
        </Typography>
        <ul>
          <li>
            <Typography variant="subtitle1"><b>Normal Distribution (The "Bell Curve")</b></Typography>
            <Typography variant="body2" paragraph>
              Imagine measuring the height of everyone in a large city. Most people would be around the average height, with fewer people being very tall or very short. This is a Normal distribution. It's symmetrical and useful for things that cluster around an average. In finance, it's a good starting point but can be unrealistic as it assumes extreme events are very rare.
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle1"><b>Log-Normal Distribution (For Prices)</b></Typography>
            <Typography variant="body2" paragraph>
              Stock prices can't go below zero, and they have the potential for unlimited upside. A Log-Normal distribution is like a Normal distribution but for things that grow exponentially. It's skewed to the right, meaning it accounts for the possibility of large upward price movements. This is often the most realistic choice for modeling asset prices.
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle1"><b>Uniform Distribution (Equal Probability)</b></Typography>
            <Typography variant="body2" paragraph>
              Imagine rolling a fair die. Every number from 1 to 6 has an equal chance of coming up. A Uniform distribution is used when you believe all outcomes within a certain range are equally likely. In finance, you might use this if you have a price target range but no idea where the price is most likely to land within that range.
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle1"><b>Beta Distribution (For Probabilities)</b></Typography>
            <Typography variant="body2" paragraph>
              Imagine you are a baseball player, and you want to model your batting average. Your average will always be between 0 and 1. The Beta distribution is perfect for modeling things that are constrained to a range (like probabilities or percentages). It's very flexible and can take on many different shapes.
            </Typography>
          </li>
          <li>
            <Typography variant="subtitle1"><b>Empirical Distribution (Just the Facts)</b></Typography>
            <Typography variant="body2" paragraph>
              Instead of trying to fit your data to a theoretical shape, the Empirical distribution just uses your actual historical data. It's like putting all your historical price changes into a hat and drawing them out at random to build future scenarios. This is a very data-driven approach that makes no assumptions about the underlying process.
            </Typography>
          </li>
        </ul>

      </Box>
    </Modal>
  );
};

export default HowToUseDataModal;
