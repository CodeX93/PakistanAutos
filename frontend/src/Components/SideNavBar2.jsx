import React, { useState, useEffect } from 'react';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';

import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  useMediaQuery,
  Button,
  Paper,
} from '@mui/material';

// MUI Icons
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  Home,
  Inventory,
  Build,
  BikeScooter,
  MonetizationOn,
  Factory,
} from '@mui/icons-material';

// Import your screen components here
import HomeScreen from '../Screen/HomeScreen';
import SaleNow from "../Screen/SaleNow";
import BikeList from "../Screen/Bikes";
import SpareParts from "../Screen/SpareParts";
import SaleSparePart from '../Screen/SaleSparePart';


// Create theme with your custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#00401A',
    },
    secondary: {
      main: '#c5dbcc',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
      fillColor:'#00401A'
    },
  },
});

const DRAWER_WIDTH = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${DRAWER_WIDTH}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: theme.palette.background.paper,
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiToolbar-root': {
    minHeight: 64,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  minHeight: 64,
  justifyContent: 'space-between',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, depth = 0 }) => ({
  paddingLeft: theme.spacing(2 + 2 * depth),
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.5, 1),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '14',
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '20',
    },
  },
  '& .MuiListItemIcon-root': {
    color: theme.palette.primary.main,
  },
}));

function ModernNavigation2() {
  const [open, setOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({});
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
  
  
    const handleLogout = () => {
      // Clear any authentication tokens or user data
      localStorage.clear(); // Clear user session
      navigate('/login', { replace: true }); // Redirect to login page
    };
    useEffect(() => {
      setOpen(!isSmallScreen);
    }, [isSmallScreen]);
  
    useEffect(() => {
      const activePath = location.pathname;
      const expandedState = {};
      const findActiveSection = (items, depth = 0) => {
        for (const item of items) {
          if (item.children) {
            if (findActiveSection(item.children, depth + 1)) {
              expandedState[item.id] = true;
            }
          }
          if (item.path === activePath) {
            return true;
          }
        }
        return false;
      };
      findActiveSection(navigationItems);
      setExpandedSections(expandedState);
    }, [location.pathname]);

  const navigationItems = [
    {
      id: 'dashboard',
      text: 'Dashboard',
      icon: <Home />,
      path: '/managerdashboard/home', // Home route
    },
    {
      id: 'inventory',
      text: 'Stock',
      icon: <Inventory />,
      children: [
        {
          id: 'motorcycles',
          text: 'Motorcycles',
          icon: <BikeScooter />,
          path: '/managerdashboard/inventory/motorcycles',
        },
        {
          id: 'spareParts',
          text: 'Spare Parts',
          icon: <Factory />,
          path: '/managerdashboard/inventory/spareparts',
        },
      ],
    },
    {
      id: 'sales',
      text: 'Sales',
      icon: <MonetizationOn />,
      children: [
        {
          text: 'Sell Motorcycle ',
          icon: <BikeScooter />,
          path: '/managerdashboard/sales/sellMotorcycle'
        },
        {
          text: 'Sell Parts',
          icon: <Build />,
          path: '/managerdashboard/sales/sellParts'
        }
      ]
    }, 
 
  ];

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const NavItem = ({ item, depth = 0 }) => {
      const hasChildren = item.children && item.children.length > 0;
      const isSelected = location.pathname === item.path;
  
      const handleClick = () => {
        if (hasChildren) {
          setExpandedSections((prev) => ({
            ...prev,
            [item.id]: !prev[item.id],
          }));
        } else {
          navigate(item.path);
        }
      };
  
      return (
        <>
          <StyledListItemButton
            onClick={handleClick}
            selected={isSelected}
            depth={depth}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
            {hasChildren && (expandedSections[item.id] ? <ExpandLess /> : <ExpandMore />)}
          </StyledListItemButton>
          {hasChildren && (
            <Collapse in={expandedSections[item.id]} timeout="auto" unmountOnExit>
              <List disablePadding>
                {item.children.map((child) => (
                  <NavItem key={child.id} item={child} depth={depth + 1} />
                ))}
              </List>
            </Collapse>
          )}
        </>
      );
    };

  return (
    <ThemeProvider theme={theme}>
          <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* AppBar */}
            <StyledAppBar position="fixed" open={open} >
              <Toolbar>
                {!open && (
                  <IconButton
                    color="inherit"
                    aria-label="toggle drawer"
                    onClick={handleDrawerToggle}
                    edge="start"
                    sx={{ mr: 2 }}
                  >
                    <MenuIcon sx={ {color:'primary.main'}}/>
                  </IconButton>
                )}
                <Typography
                  variant="h4"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600,
                    flexGrow: 1,
                    textAlign: 'center',
                  }}
                >
                  PAKISTAN AUTOS
                </Typography>
              </Toolbar>
            </StyledAppBar>
    
            {/* Drawer */}
            <Drawer
              variant={isSmallScreen ? 'temporary' : 'persistent'}
              anchor="left"
              open={open}
              onClose={handleDrawerToggle}
              sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                  width: DRAWER_WIDTH,
                  boxSizing: 'border-box',
                  border: 'none',
                  boxShadow: 1,
                  bgcolor: 'background.paper',
                },
              }}
            >
              <DrawerHeader>
                <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
                  Pakistan Autos
                </Typography>
                <IconButton onClick={handleDrawerToggle}>
                  <ChevronLeftIcon sx={{ color: 'primary.main' }} />
                </IconButton>
              </DrawerHeader>
    
              {/* Navigation Items */}
              <List sx={{ px: 1, pt: 2 }}>
                {navigationItems.map((item, index) => (
                  <NavItem key={index} item={item} />
                ))}
              </List>
    
              {/* Logout Button */}
              <Box sx={{ padding: '16px' }}>
                <Button variant="contained" color="primary" onClick={handleLogout} fullWidth>
                  Logout
                </Button>
              </Box>
            </Drawer>

        <Main open={open}>
          <DrawerHeader />
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              minHeight: 'calc(100vh - 80px)',
              bgcolor: 'background.default',
            }}
          >
          <Routes>
              {/* Dashboard */}
              <Route path="/managerdashboard/home" element={<HomeScreen />} />

              {/* Inventory */}
              <Route path="/managerdashboard/inventory/motorcycles" element={<BikeList role={'manager'} />} />
              <Route path="/managerdashboard/inventory/spareparts" element={<SpareParts role={'manager'} />} />
              
              {/*Sales*/}
              <Route path='/managerdashboard/sales/sellMotorcycle' element={<SaleNow role={'manager'}/>}/>
              <Route path='/managerdashboard/sales/sellParts' element={<SaleSparePart role={'manager'}/>}/>


              {/* Default Route */}
              <Route path="*" element={<HomeScreen />} />
            </Routes>          
            </Paper>
        </Main>
      </Box>
    </ThemeProvider>
  );
}

export default ModernNavigation2;