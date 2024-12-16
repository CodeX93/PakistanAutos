import * as React  from 'react';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0d4d21',
      light: '#2e7d41',
      dark: '#093618',
    },
    secondary: {
      main: '#c5dbcc',
      light: '#e6f0e9',
      dark: '#a4c2ad',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#0d4d21',
      secondary: '#2e7d41',
    },
  },
});

const HomeContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(8),
  textAlign: 'center',
  background: theme.palette.background.default,
  borderRadius: '15px',
  padding: theme.spacing(6),
  boxShadow: '0 8px 32px rgba(13, 77, 33, 0.1)',
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '3rem',
  fontWeight: 'bold',
  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(2),
  '& span': {
    color: theme.palette.primary.main,
    WebkitTextFillColor: theme.palette.primary.main,
  },
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.25rem',
  fontWeight: 500,
  marginBottom: theme.spacing(4),
}));

const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  flexWrap: 'wrap',
  margin: theme.spacing(6, 0),
  gap: theme.spacing(3),
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: '12px',
  padding: theme.spacing(4),
  flex: '1 1 250px',
  textAlign: 'left',
  boxShadow: '0 3px 15px rgba(13, 77, 33, 0.08)',
  border: `1px solid ${theme.palette.primary.light}15`,
  transition: 'transform 0.4s, box-shadow 0.4s',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 6px 30px rgba(13, 77, 33, 0.15)',
  },
  '& .MuiTypography-h6': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    marginBottom: theme.spacing(2),
  },
  '& .MuiTypography-body2': {
    color: theme.palette.text.secondary,
    lineHeight: 1.6,
  },
}));

const StartButton = styled(Button)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: '#fff',
  marginTop: theme.spacing(4),
  fontSize: '1.1rem',
  fontWeight: 600,
  padding: theme.spacing(1.5, 4),
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(13, 77, 33, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: theme.palette.primary.dark,
    boxShadow: '0 6px 20px rgba(13, 77, 33, 0.3)',
    transform: 'translateY(-2px)',
  },
}));

export default function HomePage() {
  return (
    <ThemeProvider theme={theme}>
      <HomeContainer maxWidth="lg">
        <Title variant="h2">
          Welcome to <span>Pakistan Autos</span>
        </Title>
        <Subtitle variant="h6">
          Your one-stop solution for managing bikes and spare parts efficiently.
        </Subtitle>
        <StartButton variant="contained">
          Get Started
        </StartButton>
        <FeatureBox>
          <FeatureCard>
            <Typography variant="h6">
              Manage Bikes
            </Typography>
            <Typography variant="body2">
              Easily manage bike manufacturers and models. Add new bikes seamlessly.
            </Typography>
          </FeatureCard>
          <FeatureCard>
            <Typography variant="h6">
              Manage Spare Parts
            </Typography>
            <Typography variant="body2">
              Keep track of spare parts, manufacturers, and models efficiently.
            </Typography>
          </FeatureCard>
          <FeatureCard>
            <Typography variant="h6">
              Sales & Inventory
            </Typography>
            <Typography variant="body2">
              Manage sales, track inventory, and generate financial reports with ease.
            </Typography>
          </FeatureCard>
        </FeatureBox>
      </HomeContainer>
    </ThemeProvider>
  );
}