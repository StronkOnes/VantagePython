
import React from 'react';
import { Paper, Typography, Box, Grid, Rating } from '@mui/material';

interface StrategyCardProps {
    strategy: any;
    lastClosePrice: number;
    ticker: string;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, lastClosePrice, ticker }) => {

    const getRiskAdjustedScore = (sharpeRatio: number) => {
        if (sharpeRatio > 2.0) return { score: 'Good', colour: 'success.main' };
        if (sharpeRatio > 1.0) return { score: 'Fair', colour: 'warning.main' };
        return { score: 'Poor', colour: 'error.main' };
    };

    const getCompositeScoreRating = (compositeScore: number) => {
        const rating = Math.max(1, Math.min(5, Math.round(compositeScore / 20)));
        return rating;
    };

    const entryPrice = lastClosePrice * (1 + strategy.entry_threshold_return);
    const exitPrice = lastClosePrice * (1 + strategy.exit_threshold_return);
    const stopPrice = lastClosePrice * (1 + strategy.stop_threshold_return);
    const takeProfitPrice = entryPrice * (1 + (strategy.entry_threshold_return - strategy.exit_threshold_return)); // Simplified take profit

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Typography><strong>Enter at:</strong> {entryPrice.toFixed(4)}</Typography>
                    <Typography><strong>Exit at:</strong> {exitPrice.toFixed(4)}</Typography>
                    <Typography><strong>Stop Loss at:</strong> {stopPrice.toFixed(4)}</Typography>
                    <Typography><strong>Take Profit at:</strong> {takeProfitPrice.toFixed(4)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography><strong>Total PnL:</strong> {strategy.total_pnl.toFixed(2)}%</Typography>
                    <Typography><strong>Max Drawdown:</strong> {(strategy.max_drawdown * 100).toFixed(2)}%</Typography>
                    <Typography><strong>Win Rate:</strong> {strategy.win_rate.toFixed(2)}%</Typography>
                    <Typography>
                        <strong>Risk Score:</strong>
                        <Box component="span" sx={{ color: getRiskAdjustedScore(strategy.sharpe_ratio).colour, ml: 1 }}>
                            {getRiskAdjustedScore(strategy.sharpe_ratio).score}
                        </Box>
                    </Typography>
                    <Rating value={getCompositeScoreRating(strategy.composite_score)} readOnly />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default StrategyCard;
