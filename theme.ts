
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#BF5AF2', // Vibrant purple
    },
    secondary: {
      main: '#FF2D55', // Vibrant pink/red
    },
    background: {
      default: '#0A0A0A', // Almost black
      paper: '#1C1C1C',   // Dark grey
    },
    text: {
      primary: '#F2F2F2', // Light grey
      secondary: '#B0B0B0', // Slightly darker grey
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem', // Slightly larger
      fontWeight: 700, // Bolder
      color: '#e0e0e0',
    },
    h2: {
        fontSize: '2.2rem', // Slightly larger
        fontWeight: 600, // Bolder
        color: '#e0e0e0',
    },
    h3: { // Added h3 for consistency
        fontSize: '1.8rem',
        fontWeight: 500,
        color: '#e0e0e0',
    },
    h4: { // Added h4 for consistency
        fontSize: '1.5rem',
        fontWeight: 500,
        color: '#e0e0e0',
    },
    body1: {
        fontSize: '1.1rem', // Slightly larger for readability
        lineHeight: 1.6,
        color: '#bdbdbd',
    },
    button: {
      textTransform: 'none', // Keep button text as is
      fontWeight: 600,
    },
  },
});

export default theme;
