import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
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
  Snackbar,
  TablePagination,
  Stack,
} from '@mui/material';
import {
  Inventory2,
  ErrorOutline,
  Search as SearchIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import url from '../baseUrl';


const SoldSparePart = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [successMessage, setSuccessMessage] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${url}/SparePartSaleinventory/`);
      const data = await response.json();
      setInventory(data);
      setLoading(false);
      setFilteredInventory(data); 
    } catch (err) {
      setError('Failed to fetch inventory data');
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = inventory.filter((sale) => {
      const searchString = searchTerm.toLowerCase();
  
      const billCount = sale?.billCount?.toString() || '';
      const productNames = sale?.products?.map(product => product?.productName?.toLowerCase()).join(' ') || '';
      const productCategory = sale?.products?.map(product => product?.category?.toLowerCase()).join(' ') || '';
  
      return (
        billCount.includes(searchString) ||
        productNames.includes(searchString) ||
        productCategory.includes(searchString)
      );
    });
  
    setFilteredInventory(filtered);
  }, [searchTerm, inventory]);
  
  

  const handleOpen = (sale) => {
    setSaleData(sale);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSaleData(null);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sold motorcycle?')) {
      try {
        await fetch(`${url}/SparePartSaleinventory/delete/${id}`, { method: 'DELETE' });
        
        setInventory((prevbike) => prevbike.filter((bike) => bike.id !== id)); 
        setFilteredInventory((prevFiltered) => prevFiltered.filter((bike) => bike.id !== id)); 
        setSuccessMessage('Deleted Successfully!');
      } catch (error) {
        console.error('Error deleting bike:', error);
        setError(error);
      }
    }
  };
  const handleRevertSale = async (id) => {
    try {
      const confirmRevert = window.confirm(
        "Are you sure you want to revert this sale? This action cannot be undone."
      );
      if (!confirmRevert) return;
  
      const response = await fetch(
        `${url}/SparePartSaleinventory/revert/${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to revert sale.");
      }
  
      const data = await response.json();
  
      setSuccessMessage({
        open: true,
        message: data.message || "Sale reverted successfully!",
        severity: "success",
      });
  
      fetchInventory();
    } catch (error) {
      console.error("Error reverting sale:", error.message);
  
      setSuccessMessage({
        open: true,
        message: error.message || "Failed to revert sale. Please try again.",
        severity: "error",
      });
    }
  };
  
  
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && typeof error === 'string') {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Alert severity="error" icon={<ErrorOutline />}>
          {error}
        </Alert>
      </Box>
    );
  }

  // Calculate pagination indices
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageData = filteredInventory.slice(startIndex, endIndex);

  return (
    <Container elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
      <Snackbar
        open={successMessage.open}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage({ ...successMessage, open: false })}
        >
        <Alert
            onClose={() => setSuccessMessage({ ...successMessage, open: false })}
            severity={successMessage.severity}
            variant="filled"
        >
            {successMessage.message}
        </Alert>
        </Snackbar>

      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
        <Typography variant="h4" sx={{ padding: '5px', fontWeight: 'bold' }} color="primary">
          <Inventory2 />
          Sold Spare Part
        </Typography>

        <TextField
          label="Search by Bill Id, Name or Category"
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

      {inventory.length === 0 ? (
        <Typography>No Inventory details found.</Typography>
      ) : (
        <>
        <TableContainer sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
            <TableHead>
            <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                Bill No
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                Product Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                Price
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                Actions
                </TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {currentPageData.length > 0 ? (
                currentPageData.map((sale, saleIndex) => {
                // Extract arrays of each product property
                const productNames = sale.products.map(p => p.productName || 'N/A');
                const categories = sale.products.map(p => p.category || 'N/A');
                const quantities = sale.products.map(p => p.quantity || 'N/A');
                const prices = sale.products.map(p => Number(p.unitSellingPrice || 0).toLocaleString());

                return (
                    <TableRow key={sale.id || saleIndex} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>{sale.billCount || 'N/A'}</TableCell>
                    
                    {/* Display all product names in the same cell, each on a new line */}
                    <TableCell>
                        {productNames.map((name, i) => (
                        <Typography key={i} variant="body2">{name}</Typography>
                        ))}
                    </TableCell>
                    
                    {/* Display all categories */}
                    <TableCell>
                        {categories.map((cat, i) => (
                        <Typography key={i} variant="body2">{cat}</Typography>
                        ))}
                    </TableCell>
                    
                    {/* Display all quantities */}
                    <TableCell>
                        {quantities.map((qty, i) => (
                        <Typography key={i} variant="body2">{qty}</Typography>
                        ))}
                    </TableCell>
                    
                    {/* Display all prices */}
                    <TableCell>
                        {prices.map((price, i) => (
                        <Typography key={i} variant="body2">Rs. {price}</Typography>
                        ))}
                    </TableCell>
                    
                    <TableCell>
                        <Stack direction="row" spacing={2}>
                          {/* Info Icon */}
                          <IconButton
                            edge="end"
                            aria-label="info"
                            onClick={() => handleOpen(sale)}
                            color="primary"
                            sx={{
                              '&:hover': {
                                color: '#4CAF50',
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s ease-in-out',
                              },
                            }}
                          >
                            <InfoIcon />
                          </IconButton>

                          {/* Delete Icon */}
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDelete(sale.id)}
                            color="primary"
                            sx={{
                              '&:hover': {
                                color: 'red',
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s ease-in-out',
                              },
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>

                        {/* Revert Sale Icon*/}
                          <IconButton
                            onClick={() => handleRevertSale(sale.id, fetchInventory)} 
                            color="primary"
                            aria-label="revert sale"
                            sx={{
                              marginLeft: 1,
                              '&:hover': {
                                color: 'orange',
                                transform: 'scale(1.1)',
                                transition: 'transform 0.2s ease-in-out',
                              },
                            }}
                          >
                            <UndoIcon />
                          </IconButton>

                        </Stack>
                      </TableCell>
                    </TableRow>
                );
                })
            ) : (
                <TableRow>
                <TableCell colSpan={6} align="center">
                    No Inventory details found.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </TableContainer>


          <TablePagination
            component="div"
            count={filteredInventory.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </>
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
      backgroundColor: (theme) => theme.palette.grey[300],
      color: (theme) => theme.palette.primary.main,
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
        color: (theme) => theme.palette.primary.main,
        '&:hover': {
          color: 'black',
          transform: 'scale(1.1)',
          transition: 'transform 0.2s ease-in-out',
        },
      }}
    >
      <CloseIcon />
    </IconButton>
  </DialogTitle>

  <DialogContent sx={{ padding: 3 }}>
    <Grid container spacing={7} justifyContent="center" alignItems="stretch" marginTop={0.1} marginBottom={7}>

      {/* Sale Information */}
      <Grid item xs={12} md={5}>
        <Card
          sx={{
            padding: 2,
            boxShadow: 3,
            borderRadius: 2,
            background: "#f5f5f5",
            "&:hover": { boxShadow: 6 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: (theme) => theme.palette.primary.main, fontWeight: "bold", textAlign: "center" }}
          >
            Sale Information
          </Typography>
          <Divider sx={{ marginBottom: "10px" }} />

          <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>Bill No:</strong> {saleData?.billCount || 'N/A'}
          </Typography>

          <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>Status:</strong> {saleData?.status || 'N/A'}
          </Typography>

        </Card>
      </Grid>

      {/* Purchaser Details */}
      <Grid item xs={12} md={5}>
        <Card
          sx={{
            padding: 2,
            boxShadow: 3,
            borderRadius: 2,
            background: "#f5f5f5",
            "&:hover": { boxShadow: 6 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: (theme) => theme.palette.primary.main, fontWeight: "bold", textAlign: "center" }}
          >
            Purchaser Details
          </Typography>
          <Divider sx={{ marginBottom: "10px" }} />

          <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>Name:</strong> {saleData?.purchaserDetails?.name || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>CNIC:</strong> {saleData?.purchaserDetails?.cnic || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>Contact No:</strong> {saleData?.purchaserDetails?.contactNo || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
            <strong>Address:</strong> {saleData?.purchaserDetails?.address || 'N/A'}
          </Typography>
        </Card>
      </Grid>

      {/* Products */}
      <Grid item xs={12} md={10}>
        <Card
          sx={{
            padding: 2,
            boxShadow: 3,
            borderRadius: 2,
            background: "#f5f5f5",
            "&:hover": { boxShadow: 6 },
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: (theme) => theme.palette.primary.main, fontWeight: "bold", textAlign: "center" }}
          >
            Products
          </Typography>
          <Divider sx={{ marginBottom: "10px" }} />

          {saleData?.products && saleData.products.length > 0 ? (
            saleData.products.map((product, index) => (
              <Box key={index} sx={{ marginBottom: 2, backgroundColor: "#ffffff", p:1, borderRadius:1, boxShadow:1 }}>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '5px' }}>
                  <strong>Product Name:</strong> {product.productName || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '5px' }}>
                  <strong>Category:</strong> {product.category || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '5px' }}>
                  <strong>Condition:</strong> {product.condition || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '5px' }}>
                  <strong>Quantity:</strong> {product.quantity || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '5px' }}>
                  <strong>Selling Date:</strong> {product.sellingDate || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '5px' }}>
                  <strong>Unit Price:</strong> {product.unitPrice ? `Rs. ${Number(product.unitPrice).toLocaleString()}` : 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px' }}>
                  <strong>Unit Selling Price:</strong> {product.unitSellingPrice ? `Rs. ${Number(product.unitSellingPrice).toLocaleString()}` : 'N/A'}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
              No products available.
            </Typography>
          )}
        </Card>
      </Grid>

    </Grid>
  </DialogContent>
</Dialog>

    </Container>
  );
};

export default SoldSparePart;