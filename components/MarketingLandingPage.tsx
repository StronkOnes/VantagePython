import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface MarketingLandingPageProps {
  onNavigateToAuth: () => void;
}

const MarketingLandingPage: React.FC<MarketingLandingPageProps> = ({ onNavigateToAuth }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh', // Use minHeight to allow content to push it
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        pt: 8, // Padding top for AppBar
        pb: 4, // Padding bottom
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed', // Use fixed to keep it in background
          right: 0,
          bottom: 0,
          minWidth: '100%',
          minHeight: '100%',
          width: 'auto',
          height: 'auto',
          zIndex: -2, // Below the overlay
          objectFit: 'cover',
        }}
      >
        <source src="/Create_a_sleek_202509130043.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay for text readability
          zIndex: -1, // Above video, below content
        }}
      />

      {/* Main Content */}
      <Box sx={{ zIndex: 1, p: 3, maxWidth: 'lg', width: '100%', mt: 8 }}>
        <Typography variant="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
          Vantage for Financial Analysis
        </Typography>
        <Typography variant="h4" paragraph sx={{ mb: 4, color: 'text.secondary' }}>
          Unlock powerful insights with our AI-driven financial modeling.
        </Typography>

        <Box sx={{ my: 6 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 'md', mx: 'auto', color: 'text.secondary' }}>
            To empower investors of all levels with institutional-grade financial modeling tools, making sophisticated quantitative analysis accessible, intuitive, and actionable. We believe that better tools lead to better decisions.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={onNavigateToAuth}
          sx={{
            mt: 2,
            px: 5,
            py: 1.5,
            fontSize: '1.2rem',
            borderRadius: '25px',
            background: 'linear-gradient(45deg, #BF5AF2 30%, #FF2D55 90%)', // Gradient from theme colors
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
        >
          Get Started
        </Button>

        {/* Distribution Analysis Section */}
        <Box sx={{ mt: 10, mb: 5 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 600, mb: 5 }}>
            Our Features
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 4,
              justifyContent: 'center',
              alignItems: 'stretch',
              maxWidth: '1200px',
              mx: 'auto',
            }}
          >
            {/* Glass Card 1: Monte Carlo Simulation */}
            <Box sx={{
              p: 3,
              borderRadius: '15px',
              backgroundColor: 'rgba(28, 28, 28, 0.7)',
              border: '1px solid rgba(191, 90, 242, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Monte Carlo Simulation
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Leverage the power of SIPmath (Stochastic Information Packets) to run thousands of simulations, providing a clear view of potential outcomes. Understand the probability of different scenarios and make decisions with confidence.
              </Typography>
            </Box>

            {/* Glass Card 2: Backtester */}
            <Box sx={{
              p: 3,
              borderRadius: '15px',
              backgroundColor: 'rgba(28, 28, 28, 0.7)',
              border: '1px solid rgba(255, 45, 85, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'secondary.main' }}>
                Backtester
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Test your trading strategies against historical data. Our backtester uses SIPmath to provide a realistic simulation of how your strategy would have performed, allowing you to refine your approach before risking capital.
              </Typography>
            </Box>

            {/* Glass Card 3: Strategy Optimiser */}
            <Box sx={{
              p: 3,
              borderRadius: '15px',
              backgroundColor: 'rgba(28, 28, 28, 0.7)',
              border: '1px solid rgba(191, 90, 242, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Strategy Optimiser
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Let our AI-powered optimiser discover the best trading strategies for you. Using a combination of historical data and SIPmath, it identifies strategies that match your risk tolerance and market outlook, presenting them in a clear, actionable format.
              </Typography>
            </Box>
          </Box>

          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mt: 8, mb: 4 }}>
            Powered by Advanced Statistical Models
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 4,
              justifyContent: 'center',
              alignItems: 'stretch',
              maxWidth: '900px',
              mx: 'auto',
            }}
          >
            {/* Glass Card 4: Normal Distribution */}
            <Box sx={{
              p: 3,
              borderRadius: '15px',
              backgroundColor: 'rgba(28, 28, 28, 0.7)',
              border: '1px solid rgba(191, 90, 242, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Normal Distribution
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                The classic bell curve, ideal for modeling phenomena where data points cluster around a central mean with symmetrical deviations.
              </Typography>
            </Box>

            {/* Glass Card 5: Log-Normal Distribution */}
            <Box sx={{
              p: 3,
              borderRadius: '15px',
              backgroundColor: 'rgba(28, 28, 28, 0.7)',
              border: '1px solid rgba(255, 45, 85, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'secondary.main' }}>
                Log-Normal Distribution
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Perfect for financial assets, where returns are multiplicative and values cannot fall below zero, leading to a right-skewed distribution.
              </Typography>
            </Box>

            {/* Glass Card 6: Uniform Distribution */}
            <Box sx={{
              p: 3,
              borderRadius: '15px',
              backgroundColor: 'rgba(28, 28, 28, 0.7)',
              border: '1px solid rgba(191, 90, 242, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.2)',
              },
            }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                Uniform Distribution
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Models scenarios where all outcomes within a given range are equally likely, useful for worst-case/best-case scenario planning.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MarketingLandingPage;
