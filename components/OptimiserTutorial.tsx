import React from 'react';
import { Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';

interface OptimiserTutorialProps {
    open: boolean;
    onClose: () => void;
}

const OptimiserTutorial: React.FC<OptimiserTutorialProps> = ({ open, onClose }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>How to Get Good Results from the Strategy Optimiser</DialogTitle>
            <DialogContent>
                <Typography variant="h6" gutterBottom>1. Choose the Right Ticker</Typography>
                <Typography paragraph>
                    The quality of the results depends heavily on the historical data. Choose a ticker with a long history and sufficient volatility. For example, major currency pairs like EUR/USD or volatile stocks can be good candidates.
                </Typography>

                <Typography variant="h6" gutterBottom>2. Set a Sufficient Historical Period</Typography>
                <Typography paragraph>
                    A longer historical period (e.g., 5-10 years) provides more data for the optimiser to learn from. This helps in identifying more robust patterns.
                </Typography>

                <Typography variant="h6" gutterBottom>3. Adjust the Number of Simulations</Typography>
                <Typography paragraph>
                    A higher number of simulations (e.g., 5000-10000) will produce more reliable results, but it will take longer to run. Start with a lower number to get a feel for the strategies, and then increase it for more confidence.
                </Typography>

                <Typography variant="h6" gutterBottom>4. Understand Return Distribution Percentiles</Typography>
                <Typography paragraph>
                    The percentiles determine the entry and exit points of the strategies. Lower percentiles for entry create more conservative strategies, while higher percentiles create more aggressive ones. Experiment with different combinations to find a risk level you are comfortable with.
                </Typography>

                <Typography variant="h6" gutterBottom>5. Review the AI Recommendation</Typography>
                <Typography paragraph>
                    The AI recommendation provides a good starting point for choosing a strategy. It considers various factors and provides a plain-English summary of the best options.
                </Typography>

                <Button onClick={onClose} variant="contained" sx={{ mt: 2 }}>
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    );
};

export default OptimiserTutorial;
