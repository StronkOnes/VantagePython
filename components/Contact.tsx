import React from 'react';
import { Box, Typography, Container, Paper, Link as MuiLink } from '@mui/material';

const Contact: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Us
        </Typography>
        <Typography variant="body1" paragraph>
          We'd love to hear from you! Feel free to reach out with any questions or feedback.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="p">
            Phone: <MuiLink href="tel:+27729539397">+27 72 953 9397</MuiLink>
          </Typography>
          <Typography variant="h6" component="p" sx={{ mt: 2 }}>
            Email: <MuiLink href="mailto:s.kobese@gmail.com">s.kobese@gmail.com</MuiLink>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Contact;
