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
import RestoreIcon from '@mui/icons-material/Restore';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import url from '../baseUrl';

const SoldMotorcycles = () => {
  const theme = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [saleData, setSaleData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch(`${url}/bikeSaleinventory/getAllBikes`);
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
      
      const chassisNumber = sale?.bikeDetails?.chassisNumber?.toLowerCase() || '';
      const manufacturer = sale?.bikeDetails?.manufacturer?.toLowerCase() || '';
      const model = sale?.bikeDetails?.model?.toLowerCase() || '';
  
      return (
        chassisNumber.includes(searchString) ||
        manufacturer.includes(searchString) ||
        model.includes(searchString)
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

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
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
        await fetch(`${url}/bikeSaleinventory/deleteBike/${id}`, { method: 'DELETE' });
        
        setInventory((prevbike) => prevbike.filter((bike) => bike.id !== id)); 
        setFilteredInventory((prevFiltered) => prevFiltered.filter((bike) => bike.id !== id)); 
        setSuccessMessage('Deleted Successfully!');
      } catch (error) {
        console.error('Error deleting bike:', error);
        setError(error);
      }
    }
  };
// Handle Revert Sale
const handleRevertSale = async (id) => {
  try {
    const confirmRevert = window.confirm("Are you sure you want to revert this sale? This action cannot be undone.");
    if (!confirmRevert) return;

    const response = await fetch(`${url}/bikeSaleInventory/revertSale/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to revert sale.");
    }

    const data = await response.json();
    setSuccessMessage(data.message);
    fetchInventory(); // Refresh the list
  } catch (error) {
    console.error("Error reverting sale:", error);
    setError("Failed to revert sale. Please try again.");
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
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!error && typeof error !== 'string'}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'Right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error && error.toString()}
        </Alert>
      </Snackbar>

      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
        <Typography variant="h4" sx={{ padding: '5px', fontWeight: 'bold' }} color="primary">
          <Inventory2 />
          Sold Motorcycles Inventory
        </Typography>

        <TextField
          label="Search by Model, Chasis or Manufacturer"
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
          <TableContainer  sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Serial No
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Chassis No
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Manufacturer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Model
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
                  currentPageData.map((sale, index) => (
                    <TableRow key={sale.id || index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell>{sale?.bikeDetails?.chassisNumber || 'N/A'}</TableCell>
                      <TableCell>{sale?.bikeDetails?.manufacturer || 'N/A'}</TableCell>
                      <TableCell>{sale?.bikeDetails?.model || 'N/A'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" mb={2}>
                          Rs. {Number(sale?.priceDetails?.sellingPrice || 0).toLocaleString()}
                        </Typography>
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
                            <RestoreIcon />
                          </IconButton>

                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
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
            {/* Agent Details */}
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
                  Agent Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />

                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Name:</strong> {saleData?.agent?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>CNIC:</strong> {saleData?.agent?.cnic || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Contact:</strong> {saleData?.agent?.contact || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Address:</strong> {saleData?.agent?.address || 'N/A'}
                </Typography>
              </Card>
            </Grid>

            {/* Bike Details */}
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
                  Bike Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />

                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Chassis Number:</strong> {saleData?.bikeDetails?.chassisNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Condition:</strong> {saleData?.bikeDetails?.condition || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Manufacturer:</strong> {saleData?.bikeDetails?.manufacturer || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Mileage:</strong> {saleData?.bikeDetails?.mileage || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Model:</strong> {saleData?.bikeDetails?.model || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Purchase Price:</strong> {saleData?.bikeDetails?.purchasePrice || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Type:</strong> {saleData?.bikeDetails?.type || 'N/A'}
                </Typography>
              </Card>
            </Grid>

            {/* Price Details */}
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
                  Price Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />

                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Selling Price:</strong> {saleData?.priceDetails?.sellingPrice || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Cash Paid:</strong> {saleData?.priceDetails?.cashPaid || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Online Paid:</strong> {saleData?.priceDetails?.onlinePaid || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Discount Offered:</strong> {saleData?.priceDetails?.discountOffered || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Balance:</strong> {saleData?.priceDetails?.balance || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Profit:</strong> {saleData?.priceDetails?.profit || 'N/A'}
                </Typography>
              </Card>
            </Grid>

            {/* Registration Details */}
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
                  Client Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />

                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Full Name:</strong> {saleData?.registrationDetails?.client?.fullName || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>ID Card No:</strong> {saleData?.registrationDetails?.client?.idCardNo || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Phone Number:</strong> {saleData?.registrationDetails?.client?.phoneNumber || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Address:</strong> {saleData?.registrationDetails?.client?.address || 'N/A'}
                </Typography>
              </Card>
            </Grid>

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
                  Registration Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />

                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Registration City:</strong> {saleData?.registrationDetails?.registrationCity || 'N/A'}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '13px', marginBottom: '8px' }}>
                  <strong>Registration No:</strong> {saleData?.registrationDetails?.registrationNo || 'N/A'}
                </Typography>
              </Card>
            </Grid>

          </Grid>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SoldMotorcycles;
