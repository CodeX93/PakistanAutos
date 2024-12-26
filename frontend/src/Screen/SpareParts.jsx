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
  DialogActions,
  CircularProgress,
  Paper,
  Button,
  useTheme,
  Box,
  Divider,
  Modal
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import url from '../baseUrl';

const SparePartApp = (role) => {
  const theme = useTheme();
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
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
  const [open, setOpen] = useState(false);

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
      setError('Failed to fetch spare parts');
      setSpareParts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id: productId } = selectedPart;
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
          unitPrice: parseFloat(formData.unitPrice),
          quantity: parseInt(formData.quantity, 10),
          bikeType: formData.bikeType,
        },
      };

      const response = await fetch(`${url}/sparepart/updateSparePart/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update spare part: ${response.status} ${response.statusText}\n${errorText}`);
      }

      await fetchAllSpareParts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating spare part:', error);
      setError('Failed to update spare part');
    }
  };

  const handleEditClick = (part) => {
    setSelectedPart(part);
    setFormData({
      productName: part.productName || '',
      condition: part.condition || '',
      warehouseLocation: part.warehouseLocation || '',
      quantity: part.quantity || 0,
      unitPrice: part.unitPrice || 0,
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

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedPart(null);
    setFormData({
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
  };

  useEffect(() => {
    fetchAllSpareParts();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading spare parts...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
        <IconButton onClick={fetchAllSpareParts} variant="contained" color="primary">
          Retry
        </IconButton>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
        Spare Parts List
      </Typography>
      {spareParts.length === 0 ? (
        <Typography>No spare parts found</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Condition</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Warehouse Location</TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Quantity</TableCell>
                {role.role !== 'manager' && (<TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Unit Price</TableCell>)}
                {role.role !== 'manager' && (<TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Actions</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {spareParts.map((part) => (
                <TableRow key={part.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{part.productName}</TableCell>
                  <TableCell>{part.condition}</TableCell>
                  <TableCell>{part.warehouseLocation}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  {role.role !== 'manager' && (<TableCell>{part.unitPrice}</TableCell>)}
                  <TableCell>
                  {role.role !== 'manager' && (
                    <IconButton onClick={() => handleEditClick(part)} color="primary">
                      <EditIcon />
                    </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Modal open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <Box
          sx={{
            ...modalStyle,
            position: 'relative',
            padding: 3,
          }}
        >
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
              EDIT SPARE PARTS
            </Typography>
            <Divider sx={{ marginBottom: '20px' }} />

            <Box
              sx={{
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '8px',
              }}
            >
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2, marginTop: 1 }}>
                <TextField
                  label="Product Name"
                  name="productName"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <InputLabel>Condition</InputLabel>
                <Select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  label="Condition"
                  sx={{ textAlign: 'left' }}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Used">Used</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Warehouse Location"
                  name="warehouseLocation"
                  value={formData.warehouseLocation}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Unit Price"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <InputLabel>Bike Type</InputLabel>
                <Select
                  name="bikeType"
                  value={formData.bikeType}
                  onChange={handleInputChange}
                  label="Bike Type"
                  sx={{ textAlign: 'left' }}
                >
             <MenuItem value="Electric Motorbike">Electric Motorbike</MenuItem>
             <MenuItem value="Non-Electric Motorbike">Non-Electric Motorbike</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Sub Category"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                />
              </FormControl>

              <Typography variant="h6" gutterBottom sx={{ marginBottom: 1 }}>
                Supplier Information
              </Typography>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Supplier ID"
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Supplier Name"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Supplier Contact"
                  name="supplierContact"
                  value={formData.supplierContact}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Supplier Address"
                  name="supplierAddress"
                  value={formData.supplierAddress}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Supplier CNIC"
                  name="supplierCnic"
                  value={formData.supplierCnic}
                  onChange={handleInputChange}
                />
              </FormControl>
            </Box>

            <DialogActions sx={{ padding: 2 }}>
              <Button onClick={handleCloseDialog} variant="contained" color="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
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
export default SparePartApp;
