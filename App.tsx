
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Button, Link as MuiLink, CircularProgress, Box } from '@mui/material'; // Added CircularProgress, Box
import theme from './theme';
import { BrowserRouter, Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom'; // Added useNavigate
import LandingPage from './components/LandingPage';
import Home from './components/Home'; // New import
import Contact from './components/Contact'; // New import
import { AuthProvider, useAuth } from './components/AuthContext'; // New import
import AuthForms from './components/AuthForms'; // New import
import TurtleCalculator from './components/TurtleCalculator'; // New import

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter> {/* Moved BrowserRouter here */}
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to home or login page after logout
  };

  return (
    <> {/* Replaced BrowserRouter with a Fragment */}
      <AppBar position="static">
        <Toolbar>
          <MuiLink component={RouterLink} to="/" color="inherit" sx={{ flexGrow: 1, textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Vantage Financial Modeler Logo" style={{ height: '40px', marginRight: '10px' }} />
          </MuiLink>
          {user && ( // Show navigation buttons only if logged in
            <>
              <Button color="inherit" component={RouterLink} to="/simulation">Simulation</Button>
              <Button color="inherit" component={RouterLink} to="/calculator">Calculator</Button>
              <Button color="inherit" component={RouterLink} to="/contact">Contact</Button>
              <Button color="inherit" onClick={handleLogout}>Logout ({user.email})</Button>
            </>
          )}
          {!user && ( // Show login/register button if not logged in
            <Button color="inherit" component={RouterLink} to="/">Login/Register</Button>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        {user ? ( // Authenticated routes
          <>
            <Route path="/" element={<Home />} /> {/* Home can be accessed by authenticated users */}
            <Route path="/simulation" element={<LandingPage />} />
            <Route path="/calculator" element={<TurtleCalculator />} />
            <Route path="/contact" element={<Contact />} />
            {/* Redirect any other path to home if authenticated */}
            <Route path="*" element={<Home />} /> 
          </>
        ) : ( // Unauthenticated routes
          <>
            <Route path="/" element={<AuthForms onAuthSuccess={() => navigate('/simulation')} />} />
            {/* Redirect any other path to login if unauthenticated */}
            <Route path="*" element={<AuthForms onAuthSuccess={() => navigate('/simulation')} />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;
