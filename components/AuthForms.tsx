import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert, Container } from '@mui/material';
import { useAuth } from './AuthContext';

interface AuthFormsProps {
  onAuthSuccess: () => void;
}

const AuthForms: React.FC<AuthFormsProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { login, register, error, isLoading } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      onAuthSuccess(); // Call callback on successful authentication
    } catch (err) {
      // Error is already handled by AuthContext and displayed via `error` state
      console.error("Authentication failed:", err);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {isRegister ? 'Register' : 'Login'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (isRegister ? 'Register' : 'Login')}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setIsRegister(!isRegister)}
            disabled={isLoading}
          >
            {isRegister ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AuthForms;