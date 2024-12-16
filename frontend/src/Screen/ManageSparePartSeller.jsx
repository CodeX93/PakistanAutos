import React, { useEffect, useState } from 'react';
import {
  Box, TableCell, TableHead, TableContainer,Table, Snackbar, Alert, 
  Divider, useTheme, InputAdornment, CircularProgress,TextField, Button,
   Typography, IconButton, TableRow, TableBody, Modal,DialogActions,Container
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import url from '../baseUrl';

const ManageSparePartSellers = () => {
  const theme=new useTheme();
  const [sparePartSellers, setSparePartSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [formData, setFormData] = useState({
    SellerName: '',
    SellerContactNo: '',
    SellerAddress: '',
    SellerCNIC: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  


  // Fetch all spare part sellers
  const fetchSparePartSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/SparePartSeller/`);
      const data = await response.json();
      setSparePartSellers(data);
      setFilteredSellers(data); // Initialize filtered sellers
    } catch (error) {
      console.error('Error fetching spare part sellers:', error);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSparePartSellers();
  }, []);

  useEffect(() => {
    // Filter sellers based on search term
    const filtered = sparePartSellers.filter((seller) =>
      seller.SellerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSellers(filtered);
  }, [searchTerm, sparePartSellers]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSeller = async (e) => {
    e.preventDefault();

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };
  
      const response=await fetch(`${url}/SparePartSeller/add`, requestOptions);
      const newSeller = await response.json();
      // Update state with the new seller
      setSparePartSellers((prevSellers) => [...prevSellers, newSeller]);
      setFilteredSellers((prevFiltered) => [...prevFiltered, newSeller]);
      setSuccessMessage('Seller Added Successfully!');
      resetForm();

    } catch (error) {
      console.error('Error adding spare part seller:', error);
      setError(error)
    }
  };

  const handleUpdateSeller = async (e) => {
    e.preventDefault();
    try {
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };
  
      const response = await fetch(`${url}/SparePartSeller/update/${editingId}`, requestOptions);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update seller');
      }
  
      const updatedSeller = await response.json();
  
      // Update seller in state
      if (updatedSeller && updatedSeller.id === editingId) {
        setSparePartSellers((prevSellers) =>
          prevSellers.map((seller) => (seller.id === editingId ? updatedSeller : seller))
        );
        setFilteredSellers((prevFiltered) =>
          prevFiltered.map((seller) => (seller.id === editingId ? updatedSeller : seller))
        );
        setSuccessMessage('Updated Successfully!');
        setError(null); // Clear error if successful
        resetEditingState();
      } else {
        console.warn("Updated Agent data missing ID or does not match editing ID:", updatedSeller);
      }
    } catch (error) {
      console.error('Error updating spare part seller:', error);
      setError('Error updating spare part seller: ' + error.message); // Store error as a string
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this seller?')) {
      try {
        const response = await fetch(`${url}/SparePartSeller/delete/${id}`, { method: 'DELETE' });
  
        // Check for errors in the response
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete seller');
        }
  
        // Update the state to remove the deleted seller
        setSparePartSellers((prevSellers) => prevSellers.filter((seller) => seller.id !== id)); 
        setFilteredSellers((prevFiltered) => prevFiltered.filter((seller) => seller.id !== id)); 
  
        // Set success message and clear any error
        setSuccessMessage('Deleted Successfully!');
        setError(null);
      } catch (error) {
        console.error('Error deleting spare part seller:', error);
        setError(error.message); // Store the error message string
      }
    }
  };
  
  
  
  

  const handleAddOrEditAgent = async (event) => {
    event.preventDefault();
    if (isEditing) {
      await handleUpdateSeller(event);
    } else {
      await handleAddSeller(event);
    }
    handleCloseDialog();
  };


  const handleCloseDialog = () => {
    setOpen(false);
    resetEditingState();
  };
  // Helper function to reset the form
  const resetForm = () => {
    setFormData({ SellerName: '', SellerContactNo: '', SellerAddress: '', SellerCNIC: '' });
  };
  
  // Helper function to reset editing state
  const resetEditingState = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };
  // Edit a bike agent

  // Edit a spare part seller
  const handleEdit = (seller) => {
    setOpen(true)
    setFormData(seller);
    setIsEditing(true);
    setEditingId(seller.id);
  };

   const handleCloseSnackbar = () => {
      setError(null);
      setSuccessMessage('');
    };  
    const handleAdd = () => {
      setIsEditing(false);
      setFormData({ SellerName: '', SellerContactNo: '', SellerAddress: '', SellerCNIC: '' });
      setOpen(true);
    };
  
    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        maxWidth: '90%',
        backgroundColor: '#f7fdf9',
        borderRadius: '15px',
        boxShadow: '0 8px 24px rgba(0, 128, 0, 0.2)',
        padding: '25px',
        textAlign: 'center',
        overflow: 'hidden',
      };
      if (loading) {
          return (
            <Container>
              <CircularProgress />
              <Typography>Loading Spare Part Seller details...</Typography>
            </Container>
          );
        }
      
        if (error) {
          return (
            <Container>
              <Typography color="error">{error}</Typography>
              <IconButton onClick={fetchSparePartSellers} variant="contained" color="primary">
                Retry
              </IconButton>
            </Container>
          );
        }
  
  


  return (
    <Container>
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{ marginBottom: '15px' }}
    >
      <Typography variant="h5" sx={{ padding: '5px', fontWeight: 'bold' }} color="Black">
        Manage Spare Part Sellers
      </Typography>
    </Box>
    <Divider sx={{ backgroundColor: 'primary.main', marginBottom: '15px' }} />
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        marginBottom: 4,
        marginTop:4,
        flexDirection: { xs: 'column', sm: 'row' }, 
        gap: 3, 
      }}
    >
      <TextField
        label="Search by Seller Name"
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
          width: { xs: '100%', sm: '300px' },
          backgroundColor: theme.palette.background.paper,
          borderRadius: '12px',
          marginTop: { xs: 2, sm: 0 },
        }}
      />
      
      <Button
        variant="contained"
        color="primary"
        onClick={handleAdd}
        sx={{
          textTransform: 'none',
          padding: '8px 16px',
          fontWeight: 'bold',
          whiteSpace: 'nowrap', 
          marginTop: { xs: 2, sm: 0 }, 
          '&:hover': {
            backgroundColor: 'green',
            transform: 'scale(1.1)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      >
        Add Spare Part Seller
      </Button>
    </Box>
    {sparePartSellers.length=== 0 ? (
        <Typography>No Spare part seller details found.</Typography>
            ) : (
              <TableContainer  sx={{ boxShadow: 3, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>

                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Serial Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Seller Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Address
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        CNIC 
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Contact Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredSellers.length>0?(
                      filteredSellers.map((Seller, index) => (
                        <TableRow key={Seller.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                          <TableCell >{index + 1}</TableCell>
                          <TableCell>{Seller.SellerName}</TableCell>
                          <TableCell>{Seller.SellerAddress}</TableCell>
                          <TableCell>{Seller.SellerCNIC}</TableCell>
                          <TableCell>{Seller.SellerContactNo}</TableCell>
                          <TableCell>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleEdit(Seller)}
                              color="primary"
                              sx={{
                                marginRight: 1,
                                '&:hover': {
                                  color: '#4CAF50',
                                  transform: 'scale(1.1)',
                                  transition: 'transform 0.2s ease-in-out',
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              color="primary"
                              sx={{
                                '&:hover': {
                                  color: 'red',
                                  transform: 'scale(1.1)',
                                  transition: 'transform 0.2s ease-in-out',
                                },
                              }}
                              onClick={() => handleDelete(Seller.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            No Spare Part Seller details found.
                          </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

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
              open={!!error}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              anchorOrigin={{ vertical: 'top', horizontal: 'Right' }}
            >
              <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            </Snackbar>

            <Modal open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
              <Box sx={{ ...modalStyle, position: 'relative', padding: 3 }}>
                <Box
                  component="form"
                  noValidate
                  onSubmit={handleAddOrEditAgent}
                  sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}
                >
                  <IconButton
                    onClick={handleCloseDialog}
                    sx={{
                      position: 'absolute',
                      right: '15px',
                      color: '#4CAF50',
                      '&:hover': {
                        color: 'red',
                        transform: 'scale(1.1)',
                        transition: 'transform 0.2s ease-in-out',
                      },
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography
                    variant="h5"
                    sx={{
                      marginBottom: '7px',
                      fontWeight: 'bold',
                      color: '#4CAF50',
                      fontSize: '1.5rem',
                    }}
                  >
                    {isEditing ? 'Update' : 'Add'} Spare Part Seller
                </Typography>

                  <Divider sx={{ marginBottom: '20px' }} />

                  <Box sx={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
                  <TextField
                    label="Seller Name"
                    name="SellerName"
                    value={formData.SellerName}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Contact Number"
                    name="SellerContactNo"
                    value={formData.SellerContactNo}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Address"
                    name="SellerAddress"
                    value={formData.SellerAddress}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="CNIC"
                    name="SellerCNIC"
                    value={formData.SellerCNIC}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  </Box>
                  <DialogActions sx={{ padding: 2 }}>
                    <Button type="submit" variant="contained" color="primary">
                      {isEditing ? 'Save' : 'Add'}
                    </Button>
                  </DialogActions>
                </Box>
              </Box>

            </Modal>
  </Container>
  );
};

export default ManageSparePartSellers;
