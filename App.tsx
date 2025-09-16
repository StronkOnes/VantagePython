
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Button, Link as MuiLink, CircularProgress, Box } from '@mui/material';
import theme from './theme';
import { BrowserRouter, Routes, Route, Link as RouterLink, useNavigate } from 'react-router-dom';
import MarketingLandingPage from './components/MarketingLandingPage';
import Dashboard from './components/Dashboard';
import { AuthProvider, useAuth } from './components/AuthContext';
import AuthForms from './components/AuthForms';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
    navigate('/');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <MuiLink component={RouterLink} to="/" color="inherit" sx={{ flexGrow: 1, textDecoration: 'none' }}>
            <img src="/logo.svg" alt="Vantage Financial Modeller Logo" style={{ height: '40px', marginRight: '10px' }} />
          </MuiLink>
          {user && (
            <>
              <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
              <Button color="inherit" onClick={handleLogout}>Logout ({user.email})</Button>
            </>
          )}
          {!user && (
            <Button color="inherit" component={RouterLink} to="/auth">Login/Register</Button>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<MarketingLandingPage onNavigateToAuth={() => navigate('/auth')} />} />
        <Route path="/auth" element={<AuthForms onAuthSuccess={() => navigate('/dashboard')} />} />

        {user && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Dashboard />} />
          </>
        )}
        {!user && <Route path="*" element={<MarketingLandingPage onNavigateToAuth={() => navigate('/auth')} />} />}
      </Routes>
    </>
  );
};

export default App;
