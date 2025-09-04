
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#81c784', // A softer green for primary actions
    },
    secondary: {
      main: '#ffb74d', // A warm orange for secondary actions
    },
    background: {
      default: '#212121', // Slightly lighter dark background
      paper: '#424242',   // Lighter paper background for better contrast
    },
    text: {
      primary: '#e0e0e0', // Lighter text for better readability on dark background
      secondary: '#bdbdbd',
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
