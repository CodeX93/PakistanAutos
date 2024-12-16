import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  TextField, 
  Button, 
  Typography, 
  useMediaQuery,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton, 
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CompanyImage from "../Asset/Images/PakistanAutoLogo.jpeg";
import { useNavigate } from 'react-router-dom';
import url from '../baseUrl';


// Updated color palette for light theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#10300c', // Blue
      dark: '#10300c', // Darker Blue
    },
    background: {
      default: '#f5f6fa', // Light Gray
      paper: '#ffffff', // White for form background
    },
    text: {
      primary: '#10300c', // Dark Blue-Gray
      secondary: '#10300c', // Blue
    },
  },
});

const LoginContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
}));

const LoginForm = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  borderRadius: '16px',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)', // Lighter shadow for light theme
  width: '100%',
  maxWidth: '400px',
}));

const LoginField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: '100%',
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.dark,
    },
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  backgroundColor: theme.palette.primary.main,
  color: '#ffffff',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Logo = styled('img')({
  width: '100%',
  maxWidth: '200px',
});

const RoleToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiToggleButton-root': {
    color: theme.palette.text.primary,
    borderColor: theme.palette.primary.main,
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.main,
      color: '#ffffff',
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
}));

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [role, setRole] = useState('manager');
  const [error, setError] = useState(null); 
  const [successMessage, setSuccessMessage] = useState('');
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const endpoint = role === 'admin' ? `${url}/user/login` : `${url}/user/login2`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const tokenId = response.headers.get('Authorization');
      const userRole = role; // Use the selected role directly
  
      // Store the token and role in localStorage
      localStorage.setItem('token', tokenId);
      localStorage.setItem('userRole', userRole);
  
      // Success message
      setSuccessMessage('Login Successfully!');
      setTimeout(() => {
        setLoading(false);
  
        // Navigate based on role
        if (userRole === 'admin') {
          navigate('/admindashboard/home');
        } else if (userRole === 'manager') {
          navigate('/managerdashboard/home');
        }
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error.message);
      setError('Login failed. Please check your credentials.');
      setLoading(false);
    }
  };
  
  const handleRoleChange = (event, newRole) => {
    if (newRole !== null) {
      setRole(newRole);
    }
  };
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);  
  };
  return (
    <ThemeProvider theme={theme}>
      <LoginContainer maxWidth={false}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LoginForm component="form" onSubmit={handleSubmit}>
            <Logo src={CompanyImage} alt="Pakistan Auto Logo" />
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              gutterBottom 
              color="text.secondary" 
              align="center"
            >
              Welcome Back
            </Typography>
            <LoginField
              label="Email"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <LoginField
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                {showPassword ? <Visibility /> : <VisibilityOff />} 
                </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <RoleToggle
              value={role}
              exclusive
              onChange={handleRoleChange}
              aria-label="user role"
            >
              <ToggleButton value="admin" aria-label="admin">
                Admin
              </ToggleButton>
              <ToggleButton value="manager" aria-label="manager">
                Manager
              </ToggleButton>
            </RoleToggle>
            <LoginButton 
              type="submit" 
              variant="contained" 
              size="large" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </LoginButton>
          </LoginForm>
        </motion.div>
      </LoginContainer>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
    
  );
};

export default LoginScreen;