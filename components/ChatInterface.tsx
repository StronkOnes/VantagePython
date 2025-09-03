import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: { sender: string; text: string }[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onSendMessage, messages }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      <Typography variant="h6" gutterBottom>Chat with AI</Typography>
      <Paper sx={{ flexGrow: 1, overflowY: 'auto', p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 1, textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <Typography
              variant="body2"
              sx={{
                display: 'inline-block',
                p: 1,
                borderRadius: '8px',
                backgroundColor: msg.sender === 'user' ? '#e0f7fa' : '#fff3e0',
                color: 'black', // Added this line
              }}
            >
              <strong>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
            </Typography>
          </Box>
        ))}
      </Paper>
      <Box sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          sx={{ mr: 1 }}
        />
        <Button variant="contained" onClick={handleSend}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatInterface;
