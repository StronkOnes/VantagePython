
import React from 'react';
import { Paper, Typography, Grid, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SimulationResultsProps {
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

// Utility function to create histogram data
const createHistogramData = (data: number[], numBins: number = 20) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;
    const bins = Array(numBins).fill(0).map((_, i) => ({
        name: `${(min + i * binWidth).toFixed(2)} - ${(min + (i + 1) * binWidth).toFixed(2)}`,
        count: 0,
    }));

    data.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
        if(bins[binIndex]) {
            bins[binIndex].count++;
        }
    });

    return bins;
};

const SimulationResults: React.FC<SimulationResultsProps> = ({ result }) => {
    const { summary_stats, simulation_data } = result;
    const histogramData = createHistogramData(simulation_data);

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h2" component="h2" gutterBottom>
                Simulation Results
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {Object.entries(summary_stats).map(([key, value]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase' }}>{key.replace(/_/g, ' ')}</Typography>
                            <Typography variant="h6">{typeof value === 'number' ? value.toFixed(4) : value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#90caf9" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default SimulationResults;
