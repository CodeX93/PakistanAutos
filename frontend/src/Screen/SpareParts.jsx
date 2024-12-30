// Part 1: Imports and Initial Setup
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Paper,
  Button,
  useTheme,
  Box,
  Divider,
  Modal,
  Alert,
  AlertTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import url from '../baseUrl';

// Part 2: Modal Style Configuration
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

// Part 3: Main Component
const SparePartApp = ({ role }) => {
  const theme = useTheme();
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    condition: '',
    warehouseLocation: '',
    quantity: '',
    unitPrice: '',
    bikeType: 'Electric Motorbike',
    category: '',
    subCategory: '',
    supplierId: '',
    supplierName: '',
    supplierContact: '',
    supplierAddress: '',
    supplierCnic: '',
  });

  // Part 4: API Functions
  const fetchAllSpareParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/sparepart/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSpareParts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      setError('No Spare Parts in the System');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedPart?.id) {
      setError('No part selected for update');
      return;
    }

    try {
      const requestBody = {
        formData: {
          category: formData.category,
          subCategory: formData.subCategory,
          supplier: {
            id: formData.supplierId,
            SellerName: formData.supplierName,
            SellerContactNo: formData.supplierContact,
            SellerAddress: formData.supplierAddress,
            SellerCNIC: formData.supplierCnic,
          },
        },
        product: {
          productName: formData.productName,
          condition: formData.condition,
          warehouseLocation: formData.warehouseLocation,
          unitPrice: parseFloat(formData.unitPrice) || 0,
          quantity: parseInt(formData.quantity, 10) || 0,
          bikeType: formData.bikeType,
        },
      };

      const response = await fetch(
        `${url}/sparepart/updateSparePart/${selectedPart.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update spare part: ${errorText}`);
      }

      await fetchAllSpareParts();
      setOpen(false);
    } catch (error) {
      console.error('Error updating spare part:', error);
      setError('Failed to update spare part. Please try again.');
    }
  };

  // Part 5: Event Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (part) => {
    setSelectedPart(part);
    setFormData({
      productName: part.productName || '',
      condition: part.condition || '',
      warehouseLocation: part.warehouseLocation || '',
      quantity: part.quantity?.toString() || '0',
      unitPrice: part.unitPrice?.toString() || '0',
      bikeType: part.bikeType || 'Electric Motorbike',
      category: part.category || '',
      subCategory: part.subCategory || '',
      supplierId: part.supplier?.id || '',
      supplierName: part.supplier?.name || '',
      supplierContact: part.supplier?.contact || '',
      supplierAddress: part.supplier?.address || '',
      supplierCnic: part.supplier?.cnic || '',
    });
    setOpen(true);
  };

  // Part 6: Effects
  useEffect(() => {
    fetchAllSpareParts();
  }, []);

  // Part 7: Loading State
  if (loading) {
    return (
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="400px">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading spare parts...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Part 8: Main Render
  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          Spare Parts List
        </Typography>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={fetchAllSpareParts}
                startIcon={<RefreshIcon />}
              >
                Retry
              </Button>
            }
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Box>

      {/* Part 9: Empty State */}
      {spareParts.length === 0 ? (
        <Paper 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: theme.palette.grey[50]
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No spare parts found
          </Typography>
          <Typography color="textSecondary" paragraph>
            There are currently no spare parts in the database.
          </Typography>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={fetchAllSpareParts}
          >
            Refresh Data
          </Button>
        </Paper>
      ) : (
        // Part 10: Data Table
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Product Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Condition
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Warehouse Location
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                  Quantity
                </TableCell>
                {role !== 'manager' && (
                  <>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                      Unit Price
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>
                      Actions
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {spareParts.map((part) => (
                <TableRow 
                  key={part.id}
                  sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
                >
                  <TableCell>{part.productName}</TableCell>
                  <TableCell>{part.condition}</TableCell>
                  <TableCell>{part.warehouseLocation}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  {role !== 'manager' && (
                    <>
                      <TableCell>{part.unitPrice}</TableCell>
                      <TableCell>
                        <IconButton 
                          onClick={() => handleEditClick(part)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Part 11: Edit Modal */}
      <Modal 
        open={open} 
        onClose={() => setOpen(false)}
        aria-labelledby="edit-spare-part-modal"
      >
        <Box sx={modalStyle}>
          <Box
            component="form"
            noValidate
            onSubmit={handleUpdateSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              position: 'relative',
            }}
          >
            <IconButton
              onClick={() => setOpen(false)}
              sx={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: theme.palette.primary.main }}>
              Edit Spare Part
            </Typography>

            <Divider />

            <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
              {/* Part 12: Basic Information Section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Product Name"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    label="Condition"
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Used">Used</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Warehouse Location"
                    name="warehouseLocation"
                    value={formData.warehouseLocation}
                    onChange={handleInputChange}
                    required
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Unit Price"
                    name="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    required
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Bike Type</InputLabel>
                  <Select
                    name="bikeType"
                    value={formData.bikeType}
                    onChange={handleInputChange}
                    label="Bike Type"
                  >
                    <MenuItem value="Electric Motorbike">Electric Motorbike</MenuItem>
                    <MenuItem value="Non-Electric Motorbike">Non-Electric Motorbike</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Part 13: Category Information Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Category Information
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Sub Category"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Part 14: Supplier Information Section */}
              <Box>
                <Typography variant="h6" gutterBottom>
                  Supplier Information
                </Typography>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Supplier ID"
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Supplier Name"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Supplier Contact"
                    name="supplierContact"
                    value={formData.supplierContact}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Supplier Address"
                    name="supplierAddress"
                    value={formData.supplierAddress}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <TextField
                    label="Supplier CNIC"
                    name="supplierCnic"
                    value={formData.supplierCnic}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Box>
            </Box>

            {/* Part 15: Form Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Update Spare Part
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default SparePartApp;