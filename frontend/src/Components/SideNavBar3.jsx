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
  Paper
} from '@mui/material';
import { DoneAll } from '@mui/icons-material';

import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ExpandLess,
  ExpandMore,
  Home,
  Inventory,
  Engineering,
  Person,
  Settings,
  Assignment,
  Build,
  BikeScooter,
  Factory,
  MonetizationOn,
  Shield,
  AddCircleOutlineTwoTone,
  MenuBook,
} from '@mui/icons-material';
import StoreIcon from '@mui/icons-material/Store';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';


// Import your screen components here
import HomeScreen from '../Screen/HomeScreen';
import ManageBikeManufacturers from '../Screen/ManageBikeManufacturers';
import ManageBikeModels from '../Screen/ManageBikeModels';
import AddBike from '../Screen/AddBike';
import SpareParts from '../Screen/SpareParts';
import BikeList from '../Screen/Bikes';
import AddSparePart from "../Screen/AddSparePart";
import SaleNow from "../Screen/SaleNow";
// import Profile from "../Screen/Profile";
import ManageBikeSellers from '../Screen/ManageBikeSeller';
import ManageBikeAgents from '../Screen/ManageAgents';
import ManageSparePartSellers from '../Screen/ManageSparePartSeller';
import SaleSparePart from '../Screen/SaleSparePart';
import MyLedger from '../Screen/MyLedger';
import SoldSparePartsSalesInventory from '../Screen/SoldSparePart';
import SparePartCreditBuys from '../Screen/SparePartCreditBuys';
import BikeCreditBuys from '../Screen/BikeCreditBuys';
import Expense from '../Screen/Expense';
import SoldMotorcycles from '../Screen/soldMotorcycle';
import SoldSparePart from '../Screen/soldSpare';
import ManageLocalCreditBuys from "../Screen/ManageLocalCreditBuys"
import ManageSparePartCategory from '../Screen/ManageSparePartCategory';
import ManageSparePartSubCategory from '../Screen/ManageSparePartSubCategory';
import SparePartPurchaseCredits from "../Screen/SparePartPurchaseCredits"
import BikePurchaseCredits from '../Screen/BikePurchaseCreditBuys';



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

function ModernNavigation() {
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
      path: '/admindashboard/home', // Home route
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
          path: '/admindashboard/inventory/motorcycles',
        },
       
      ],
    },
    {
      id: 'soldinventory',
      text: 'Sold Inventory',
      icon: <DoneAll />,
      children: [
        {
          id: 'soldmotorcycles',
          text: 'Sold Motorcycles',
          icon: <BikeScooter />,
          path: '/admindashboard/SoldInventory/soldMotorcycles',
        },
       
      ],
    },
    {
      id: 'catalog',
      text: 'Purchasing',
      icon: <Engineering />,
      children: [
        {
          id: 'motorcycleManagement',
          text: 'Motorcycle Purchasing',
          icon: <BikeScooter />,
          children: [
            {
              id: 'manufacturers',
              text: 'Manufacturers',
              icon: <Factory />,
              path: '/admindashboard/catalog/manufacturers',
            },
            {
              id: 'models',
              text: 'Models',
              icon: <BikeScooter />,
              path: '/admindashboard/catalog/models',
            },
            {
              id: 'addBike',
              text: 'Add Bike',
              icon: <AddCircleOutlineTwoTone />,
              path: '/admindashboard/catalog/addBike',
            },
          ],
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
          path: '/admindashboard/sales/sellMotorcycle'
        },
       
      ]
    },
    {
      id: 'creditBuys',
      text: 'Credits',
      icon: <AccountBalanceWalletIcon />,
      children: [
        {
          text: 'Purchases',
          icon: <Build />,
          children: [
        {
          id: 'bikeCreditBuys',
          text: 'Motor Bike',
          icon: <BikeScooter />,
          path: '/admindashboard/creditbuys/bikepurchase',
        },
       
        
      ],
    },


        {
          text: 'Sales',
          icon: <Build />,
          children: [
        {
          id: 'bikeCreditBuys',
          text: 'Motor Bike',
          icon: <BikeScooter />,
          path: '/admindashboard/creditbuys/bike',
        },
        
      ],
    }
      ],
    },
    {
      id: 'partners',
      text: 'Business Partners',
      icon: <Person />,
      children: [
        {
          id: 'manageBikeSellers',
          text: 'Manage Bike Sellers',
          icon: <StoreIcon />,
          path: '/admindashboard/partners/bikeSellers',
        },
        {
          id: 'manageBikeAgents',
          text: 'Manage Bike Agents',
          icon: <BikeScooter />,
          path: '/admindashboard/partners/bikeAgents',
        },
        
      ],
    },
    {
      id: 'finance',
      text: 'Finance',
      icon: <AccountBalanceIcon/>,
      children: [
        {
          id: 'expenses',
          text: 'My Expenses',
          icon: <AttachMoneyIcon />,
          path: '/admindashboard/finance/expenses',
        },
        {
          id: 'dailyBook',
          text: 'My DailyBook',
          icon: <MenuBook />,
          path: '/admindashboard/finance/dailyBook',
        },
      ],
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
              <Route path="/admindashboard/home" element={<HomeScreen />} />

              {/* Inventory */}
              <Route path="/admindashboard/inventory/motorcycles" element={<BikeList />} />
              

              {/* Sold Inventory */}
              <Route path="/admindashboard/SoldInventory/soldMotorcycles" element={<SoldMotorcycles />} />
              

              {/* Product Catalog */}
              <Route path="/admindashboard/catalog/manufacturers" element={<ManageBikeManufacturers />} />
              <Route path="/admindashboard/catalog/models" element={<ManageBikeModels />} />
              <Route path="/admindashboard/catalog/addBike" element={<AddBike  role={'used-bikes'}/>} />
              
              
              
              {/*Sales*/}
              <Route path='/admindashboard/sales/sellMotorcycle' element={<SaleNow/>}/>
              

              {/* Credit Buys */}
              <Route path="/admindashboard/creditbuys/bikepurchase" element={<BikePurchaseCredits />} />
              
             


              <Route path="/admindashboard/creditbuys/bike" element={<BikeCreditBuys />} />
              
              {/* Business Partners */}
              <Route path="/admindashboard/partners/bikeSellers" element={<ManageBikeSellers />} />
              <Route path="/admindashboard/partners/bikeAgents" element={<ManageBikeAgents />} />
              <Route path="/admindashboard/partners/sparePartSuppliers" element={<ManageSparePartSellers />} />

              {/* Finance */}
              <Route path="/admindashboard/finance/expenses" element={<Expense />} />
              <Route path="/admindashboard/finance/dailyBook" element={<MyLedger />} />
             
              {/* Default Route */}
              <Route path="*" element={<HomeScreen />} />
            </Routes>
          </Paper>
        </Main>
      </Box>
    </ThemeProvider>
  );
}

export default ModernNavigation;
