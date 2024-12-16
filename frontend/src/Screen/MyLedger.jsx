import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import url from '../baseUrl';

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#388e3c',
      light: '#4caf50',
      dark: '#2e7d32',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Row component for bike transactions
const BikeRow = ({ row, formatCurrency, formatDateTime }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(row.createdAt)}</TableCell>
        <TableCell>
          <Chip
            label={row.type === 'sale' ? 'Sale' : 'Purchase'}
            color={row.type === 'sale' ? 'success' : 'primary'}
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          {(row.bikeDetails?.manufacturer || row.manufacturer)} {(row.bikeDetails?.model || row.model)}
        </TableCell>
        <TableCell align="right">
          {row.type === 'sale' 
            ? formatCurrency(row.priceDetails?.sellingPrice)
            : formatCurrency(row.purchasePrice)}
        </TableCell>
        {!isMobile && (
          <TableCell>
            {row.type === 'sale'
              ? row.registrationDetails?.client?.fullName
              : row.sellerInfo?.name}
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Vehicle Information
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography>
                      Chassis: {row.bikeDetails?.chassisNumber || row.chassisNumber}
                    </Typography>
                    <Typography>
                      Condition: {row.bikeDetails?.condition || row.condition}
                    </Typography>
                    <Typography>
                      Mileage: {row.bikeDetails?.mileage || row.mileage}
                    </Typography>
                    {row.type === 'sale' && row.registrationDetails?.registrationNo && (
                      <Typography>
                        Registration: {row.registrationDetails.registrationNo}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {row.type === 'sale' ? 'Price Details' : 'Purchase Details'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {row.type === 'sale' ? (
                      <>
                        <Typography>
                          Selling Price: {formatCurrency(row.priceDetails?.sellingPrice)}
                        </Typography>
                        <Typography color="success.main">
                          Profit: {formatCurrency(row.priceDetails?.profit)}
                        </Typography>
                        <Typography>
                          Cash Paid: {formatCurrency(row.priceDetails?.cashPaid)}
                        </Typography>
                        <Typography>
                          Online Paid: {formatCurrency(row.priceDetails?.onlinePaid)}
                        </Typography>
                      </>
                    ) : (
                      <Typography>
                        Purchase Price: {formatCurrency(row.purchasePrice)}
                      </Typography>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {row.type === 'sale' ? 'Client Information' : 'Seller Information'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {row.type === 'sale' ? (
                      <>
                        <Typography>
                          Name: {row.registrationDetails?.client?.fullName}
                        </Typography>
                        <Typography>
                          Phone: {row.registrationDetails?.client?.phoneNumber}
                        </Typography>
                        <Typography>
                          Address: {row.registrationDetails?.client?.address}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography>
                          Name: {row.sellerInfo?.name}
                        </Typography>
                        <Typography>
                          Phone: {row.sellerInfo?.contactNo}
                        </Typography>
                        <Typography>
                          Address: {row.sellerInfo?.address}
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Row component for spare part transactions
const SparePartRow = ({ row, formatCurrency, formatDateTime }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(row.createdAt || row.purchasedAt)}</TableCell>
        <TableCell>
          <Chip
            label={row.type === 'sale' ? 'Sale' : 'Purchase'}
            color={row.type === 'sale' ? 'success' : 'primary'}
            variant="outlined"
          />
        </TableCell>
        <TableCell>{row.productName || row.products?.[0]?.productName}</TableCell>
        <TableCell align="right">
          {row.type === 'sale' 
            ? formatCurrency(row.products?.reduce((sum, p) => sum + (p.unitSellingPrice * p.quantity), 0))
            : formatCurrency(row.totalPrice)}
        </TableCell>
        {!isMobile && (
          <TableCell>
            {row.type === 'sale'
              ? row.purchaserDetails?.name
              : row.supplier?.name}
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Product Information
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {row.type === 'sale' ? (
                      row.products?.map((product, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography>Product: {product.productName}</Typography>
                          <Typography>Category: {product.category}</Typography>
                          <Typography>Quantity: {product.quantity}</Typography>
                          <Typography>Unit Price: {formatCurrency(product.unitSellingPrice)}</Typography>
                          <Typography>Total: {formatCurrency(product.unitSellingPrice * product.quantity)}</Typography>
                          <Typography color="success.main">
                            Profit: {formatCurrency((product.unitSellingPrice - product.unitPrice) * product.quantity)}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <>
                        <Typography>Category: {row.category}</Typography>
                        <Typography>Sub-Category: {row.subCategory}</Typography>
                        <Typography>Condition: {row.condition}</Typography>
                        <Typography>Quantity: {row.quantity}</Typography>
                        <Typography>Unit Price: {formatCurrency(row.unitPrice)}</Typography>
                        <Typography>Total: {formatCurrency(row.totalPrice)}</Typography>
                        <Typography>Location: {row.warehouseLocation}</Typography>
                      </>
                    )}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {row.type === 'sale' ? 'Purchaser Information' : 'Supplier Information'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {row.type === 'sale' ? (
                      <>
                        <Typography>Name: {row.purchaserDetails?.name}</Typography>
                        <Typography>Contact: {row.purchaserDetails?.contactNo}</Typography>
                        <Typography>Address: {row.purchaserDetails?.address}</Typography>
                        <Typography>CNIC: {row.purchaserDetails?.cnic}</Typography>
                      </>
                    ) : (
                      <>
                        <Typography>Name: {row.supplier?.name}</Typography>
                        <Typography>Contact: {row.supplier?.contact}</Typography>
                        <Typography>Address: {row.supplier?.address}</Typography>
                        <Typography>CNIC: {row.supplier?.cnic}</Typography>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const Ledger = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  const [ledgerData, setLedgerData] = useState({
    bikes: { purchases: [], sales: [] },
    spareParts: { purchases: [], sales: [] }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(today));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [category, setCategory] = useState('bikes'); // 'bikes' or 'spareParts'

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const [bikeResponse, sparePartResponse] = await Promise.all([
        fetch(`${url}/ledger/bike?startDate=${startDate}&endDate=${endDate}`),
        fetch(`${url}/ledger/sparepart?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      const [bikeData, sparePartData] = await Promise.all([
        bikeResponse.json(),
        sparePartResponse.json()
      ]);

      setLedgerData({
        bikes: bikeData,
        spareParts: sparePartData
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [startDate, endDate]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrency = (amount) => {
    return `PKR ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getFilteredData = () => {
    let combined = [];
    const currentData = ledgerData[category];
    
    if (activeTab === 0 || activeTab === 1) {
      const purchases = currentData.purchases?.map(p => ({...p, type: 'purchase'})) || [];
      combined = [...combined, ...purchases];
    }
    
    if (activeTab === 0 || activeTab === 2) {
      const sales = currentData.sales?.map(s => ({...s, type: 'sale'})) || [];
      combined = [...combined, ...sales];
    }
    
    return combined.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      if (category === 'bikes') {
        const modelMatch = (item.model || item.bikeDetails?.model || '').toLowerCase().includes(searchLower);
        const manufacturerMatch = (item.manufacturer || item.bikeDetails?.manufacturer || '').toLowerCase().includes(searchLower);
        const clientMatch = item.registrationDetails?.client?.fullName?.toLowerCase().includes(searchLower);
        return modelMatch || manufacturerMatch || clientMatch;
      } else {
        const nameMatch = (item.productName || '').toLowerCase().includes(searchLower);
        const categoryMatch = (item.category || '').toLowerCase().includes(searchLower);
        const supplierMatch = (item.supplier?.name || '').toLowerCase().includes(searchLower);
        return nameMatch || categoryMatch || supplierMatch;
      }
    });
  };

  const calculateTotals = () => {
    const filteredData = getFilteredData();
    if (category === 'bikes') {
      return {
        totalPurchases: filteredData.filter(item => item.type === 'purchase').length,
        totalSales: filteredData.filter(item => item.type === 'sale').length,
        totalProfit: filteredData
          .filter(item => item.type === 'sale')
          .reduce((sum, item) => sum + parseFloat(item.priceDetails?.profit || 0), 0),
      };
    } else {
      return {
        totalPurchases: filteredData.filter(item => item.type === 'purchase').length,
        totalSales: filteredData.filter(item => item.type === 'sale').length,
        totalProfit: filteredData
          .filter(item => item.type === 'sale')
          .reduce((sum, sale) => {
            return sum + sale.products.reduce((prodSum, prod) => 
              prodSum + ((prod.unitSellingPrice - prod.unitPrice) * prod.quantity), 0);
          }, 0),
      };
    }
  };

  const { totalPurchases, totalSales, totalProfit } = calculateTotals();

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Ledger
          </Typography>

          {/* Category Switch */}
          <Tabs
            value={category === 'bikes' ? 0 : 1}
            onChange={(_, newValue) => setCategory(newValue === 0 ? 'bikes' : 'spareParts')}
            sx={{ mb: 3 }}
          >
            <Tab label="Bikes" />
            <Tab label="Spare Parts" />
          </Tabs>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder={category === 'bikes' 
                  ? "Search by model, manufacturer or client name..."
                  : "Search by product name, category or supplier..."}
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Purchases
                  </Typography>
                  <Typography variant="h4">
                    {totalPurchases}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Sales
                  </Typography>
                  <Typography variant="h4">
                    {totalSales}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Profit
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(totalProfit)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Transaction Type Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="All" />
            <Tab label="Purchases" />
            <Tab label="Sales" />
          </Tabs>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Date/Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>{category === 'bikes' ? 'Vehicle' : 'Product'}</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    {!isMobile && <TableCell>{category === 'bikes' ? 'Client/Seller' : 'Purchaser/Supplier'}</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredData().map((row) => (
                    category === 'bikes' ? (
                      <BikeRow
                        key={row.id}
                        row={row}
                        formatCurrency={formatCurrency}
                        formatDateTime={formatDateTime}
                      />
                    ) : (
                      <SparePartRow
                        key={row.id}
                        row={row}
                        formatCurrency={formatCurrency}
                        formatDateTime={formatDateTime}
                      />
                    )
                  ))}
                  {getFilteredData().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="textSecondary">
                          No records found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default Ledger;
          