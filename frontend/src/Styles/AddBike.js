// StyledComponents.js
import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

const ScrollableContainer = styled(Box)(({ theme }) => ({
  maxHeight: '80vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: '8px',
}));

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(4),
  borderRadius: '15px',
  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  width: '100%',
  maxWidth: '700px',
  margin: 'auto',
  marginTop: '40px',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FormSection = styled(Box)(({ theme }) => ({
  backgroundColor: '#f6f8fa',
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  marginBottom: theme.spacing(3),
  '&:hover': {
    backgroundColor: '#f0f4f8',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: '10px',
  backgroundColor: theme.palette.primary.main,
  fontWeight: 'bold',
  color: '#fff',
  textTransform: 'none',
  transition: 'background-color 0.3s, transform 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
  },
}));

export { ScrollableContainer, Container, StyledButton, FormSection }; // Named exports
