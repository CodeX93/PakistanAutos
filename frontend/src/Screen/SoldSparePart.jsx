import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Chip,
  CircularProgress,
  Box,
  Alert,
  TextField,
  Grid,
  Divider,
  Container,
  useTheme,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  IconButton,
} from '@mui/material';
import {
  Inventory2,
  ErrorOutline,
  Search as SearchIcon
} from '@mui/icons-material';

import CloseIcon from '@mui/icons-material/Close';
import url from '../baseUrl';

const SoldSparePartsSalesInventory = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [claims, setClaims] = useState([]); // Ensure it starts as an array

  useEffect(() => {
    fetchInventory();
  }, []);
  const handleWarrantyClaim = async (product, sale) => {
  if (!sale) {
    console.error('Sale data is not provided. Cannot process warranty claim.');
    return;
  }

  const warrantyClaimData = {
    saleId: sale.id,
    billCount: sale.billCount,
    customerDetails: sale.purchaserDetails,
    productDetails: product,
    saleStatus: 'active', // Set as active on creation
    saleTimestamp: {
      created: new Date(sale.createdAt.seconds * 1000).toLocaleString(),
      updated: new Date(sale.updatedAt.seconds * 1000).toLocaleString(),
    },
  };

  console.log('Warranty Claim Details:', warrantyClaimData);

  try {
    const response = await fetch(`${url}/warranty/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(warrantyClaimData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
    }

    const responseData = await response.json();
    console.log('Warranty claim added successfully:', responseData);

    // Add the new claim to the active claims
    setClaims((prevClaims) =>
      Array.isArray(prevClaims) ? [...prevClaims, warrantyClaimData] : [warrantyClaimData]
    );

    alert('Warranty claim processed successfully!');
  } catch (error) {
    console.error('Error posting warranty claim:', error);
    alert(`Failed to process warranty claim: ${error.message}`);
  }
};

  

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${url}/SparePartSaleinventory/`);
      const data = await response.json();
      setInventory(data);
      setLoading(false);
      setFilteredInventory(data); // Initialize filtered inventory
    } catch (err) {
      setError('Failed to fetch inventory data');
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = inventory.filter((sale) => {
      const searchString = searchTerm.toLowerCase();
      return (
        sale?.purchaserDetails?.name?.toLowerCase().includes(searchString) ||
        sale?.purchaserDetails?.contactNo?.includes(searchString) ||
        sale?.purchaserDetails?.address?.toLowerCase().includes(searchString) ||
        sale?.products?.some(product =>
          product?.productName?.toLowerCase().includes(searchString) ||
          product?.category?.toLowerCase().includes(searchString) ||
          product?.condition?.toLowerCase().includes(searchString)
        )
      );
    });
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);

  const handleOpen = (sale) => {
    setSaleData(sale); // Set the complete sale object
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSaleData(null); // Clear saleData when dialog closes
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error" icon={<ErrorOutline />}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>

<Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
    <Typography variant="h4" sx={{ padding: '5px', fontWeight: 'bold' }} color="primary">
      <Inventory2 />
      Spare Parts Sales Inventory
    </Typography>

    <TextField
      label="Search by Name, Product or Category"
      variant="outlined"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{
        width: '300px', 
        backgroundColor: theme.palette.background.paper,
        borderRadius: '12px',
        marginTop:'5px  '
      }}
    />
  </Box>

  {inventory.length=== 0 ? (
            <Typography>No Iventory details found.</Typography>
                ) : (
                  <TableContainer  sx={{ boxShadow: 3, borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                            Bill No
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                            Customer
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                            Product Details
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                            Price
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                            Status
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredInventory.length>0?(
                        filteredInventory.map((sale, index) => (
                          <TableRow key={sale.id || index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                            <TableCell>{sale.billCount || 'N/A'}</TableCell>
                            <TableCell>{sale.purchaserDetails.name}</TableCell>
                            <TableCell>
                              {sale.products.map((product, index) => (
                                <Box key={index} mb={index !== sale.products.length - 1 ? 2 : 0}>
                                  <Typography variant="subtitle2">
                                    {product.productName}
                                  </Typography>
                                </Box>
                              ))}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" mb={2}>
                                Rs.{" "}
                                {sale.products
                                  .reduce((total, product) => total + product.unitSellingPrice, 0)
                                  .toLocaleString()}
                              </Typography>
                            </TableCell>

                            <TableCell>
                                <Chip
                                  label={sale.status}
                                  color={sale.status === 'active' ? 'success' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {sale.products.map((product, index) => (
                                <Box key={index} mb={index !== sale.products.length - 1 ? 2 : 0}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleWarrantyClaim(product, sale)}
                                    sx={{
                                      '&:hover': {
                                        backgroundColor: '#044e06', 
                                        color: '#fff', // White text on hover
                                        transform: 'scale(1.05)', // Slight zoom effect
                                        transition: 'transform 0.2s ease-in-out',
                                      },
                                    }}
                                  >
                                    Claim Warranty
                                  </Button>
                                </Box>
                              ))}

                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => handleOpen(sale)}
                                    >
                                      View Details
                                    </Button>
                              </TableCell>

                            
                            </TableRow>
                          ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={2} align="center">
                                No Inventory details found.
                              </TableCell>
                            </TableRow>
                          )}

                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <Dialog
                  open={open}
                  onClose={handleClose}
                  fullWidth
                  maxWidth="md"
                >
                <DialogTitle
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "linear-gradient(45deg, #43a047, #66bb6a)",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1.5rem",
                    position: "relative",
                  }}
                >
                  <Box sx={{ flexGrow: 1, textAlign: "center", marginRight: "24px" }}>
                    Sale Details
                  </Box>
                  <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                      position: "absolute",
                      right: 8,
                      color: "white",
                      '&:hover': {
                        color: 'red',
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>


                  <DialogContent sx={{ padding: 3}}>
                    <Grid container spacing={3} justifyContent="center">
                      {/* Customer and Sale Information - Symmetrical Layout */}
                      <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      marginTop: 5,
                      padding: 2,
                      boxShadow: 3,
                      borderRadius: 2,
                      background: "#f5f5f5",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                    >
                      Customer Details
                    </Typography>
                    <Divider sx={{ marginBottom: "10px" }} />
                    
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Name:</span> {saleData?.purchaserDetails?.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Contact:</span> {saleData?.purchaserDetails?.contactNo || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Address:</span> {saleData?.purchaserDetails?.address || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>CNIC:</span> {saleData?.purchaserDetails?.cnic || 'N/A'}
                    </Typography>
                  </Card>
                </Grid>


                <Grid item xs={12} md={5}>
                  <Card
                    sx={{
                      marginTop: 5,
                      padding: 2,
                      boxShadow: 3,
                      borderRadius: 2,
                      background: "#f5f5f5",
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                    >
                      Sale Information
                    </Typography>
                    <Divider sx={{ marginBottom: "10px" }} />

                    {/* Sale Information Fields with Consistent Styling */}
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Sale ID:</span> {saleData?.id || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Status:</span> {saleData?.status || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Created:</span> {saleData?.createdAt
                        ? new Date(saleData.createdAt.seconds * 1000).toLocaleString()
                        : 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: "bold" }}>Updated:</span> {saleData?.updatedAt
                        ? new Date(saleData.updatedAt.seconds * 1000).toLocaleString()
                        : 'N/A'}
                    </Typography>
                  </Card>
                </Grid>


      {/* Product Details - Single Container with Inner Divisions */}
      <Grid item xs={12} md={10}>
  <Card
    sx={{
      padding: 2,
      boxShadow: 3,
      borderRadius: 2,
      background: "#f5f5f5",
      "&:hover": { boxShadow: 6 },
    }}
  >
    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", color: "#388e3c", textAlign: "center" }}>
      Product Details
    </Typography>
    <Divider sx={{ marginBottom: 2 }} />

    {/* Product Details Fields with Consistent Styling */}
    {saleData?.products?.length > 0 ? (
      saleData.products.map((product, index) => (
        <Card
          key={index}
          sx={{
            marginBottom: 2,
            padding: 2,
            boxShadow: 2,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
            "&:hover": { boxShadow: 4, backgroundColor: "#e0f2f1" },
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "#2e7d32", fontWeight: "bold" }}>
            {product.productName || 'N/A'}
          </Typography>
          <Divider sx={{ marginY: 1 }} />
          <Grid container spacing={2}>
            {/* Left Column */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <span style={{ fontWeight: "bold" }}>Category:</span> {product.category || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <span style={{ fontWeight: "bold" }}>Condition:</span> {product.condition || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <span style={{ fontWeight: "bold" }}>Quantity:</span> {product.quantity || 'N/A'}
              </Typography>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <span style={{ fontWeight: "bold" }}>Unit Price:</span> Rs. {product.unitPrice?.toLocaleString() || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <span style={{ fontWeight: "bold" }}>Selling Price:</span> Rs. {product.unitSellingPrice?.toLocaleString() || 'N/A'}
              </Typography>
              <Typography variant="body2">
                <span style={{ fontWeight: "bold" }}>Selling Date:</span> {product.sellingDate || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </Card>
      ))
    ) : (
      <Typography>No products available.</Typography>
    )}
  </Card>
</Grid>
</Grid>
  </DialogContent>
</Dialog>


    </Container>
  );
};

export default SoldSparePartsSalesInventory;