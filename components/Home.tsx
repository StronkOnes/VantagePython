import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 2 }}>
          <img src="/logo.svg" alt="Vantage Financial Modeler Logo" style={{ width: '100px', height: '100px' }} />
        </Box>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Vantage Financial Modeler
        </Typography>
        <Typography variant="h6" component="p" paragraph>
          Your advanced tool for financial simulations and insights.
        </Typography>
        <Typography variant="body1" paragraph>
          This application allows you to perform Monte Carlo simulations on financial data using various statistical distributions. Understand potential price movements, assess risk, and inform your trading decisions.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" component={Link} to="/simulation" sx={{ mr: 2 }}>
            Go to Simulation
          </Button>
          <Button variant="outlined" color="secondary" component={Link} to="/contact">
            Contact Us
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;
