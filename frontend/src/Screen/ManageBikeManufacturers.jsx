import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { 
  Box, 
  TableCell, 
  TableHead, 
  TableContainer,
  Table, 
  Snackbar, 
  Alert, 
  Divider, 
  useTheme, 
  InputAdornment, 
  CircularProgress,
  TextField, 
  Button,
  Typography, 
  IconButton, 
  TableRow, 
  TableBody, 
  Modal, 
  FormControl,
  DialogActions 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import url from '../baseUrl';

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(4),
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: '90%',
  maxWidth: '800px',
  margin: 'auto',
  marginTop: theme.spacing(2),
}));

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

const ManageBikeManufacturers = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manufacturerName, setManufacturerName] = useState('');
  const [manufacturers, setManufacturers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/manufacturer`);
      const data = await response.json();
      setManufacturers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      setError('Failed to fetch manufacturers');
      setManufacturers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };

  const handleAddOrEditManufacturer = async (event) => {
    event.preventDefault();
    if (manufacturerName.trim() !== '') {
      try {
        if (isEditing) {
          await updateManufacturer(editId, manufacturerName);
        } else {
          await addManufacturer(manufacturerName);
        }
        handleCloseDialog();
        await fetchManufacturers();
      } catch (error) {
        setError('Failed to process manufacturer');
      }
    }
  };

  const addManufacturer = async (name) => {
    try {
      const response = await fetch(`${url}/manufacturer/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('Failed to add manufacturer');
      }
      setSuccessMessage('Manufacturer Added Successfully!');
    } catch (error) {
      setError('Error adding manufacturer');
      throw error;
    }
  };

  const updateManufacturer = async (id, name) => {
    try {
      const response = await fetch(`${url}/manufacturer/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('Failed to update manufacturer');
      }
      setSuccessMessage('Updated Successfully!');
    } catch (error) {
      setError('Error updating manufacturer');
      throw error;
    }
  };

  const handleDeleteManufacturer = async (id) => {
    try {
      const response = await fetch(`${url}/manufacturer/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete manufacturer');
      }
      setSuccessMessage('Deleted Successfully!');
      await fetchManufacturers();
    } catch (error) {
      setError('Error deleting manufacturer');
    }
  };

  const handleAddManufacturer = () => {
    setIsEditing(false);
    setManufacturerName('');
    setOpen(true);
  };

  const handleEditManufacturer = (id, name) => {
    setEditId(id);
    setManufacturerName(name);
    setIsEditing(true);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setManufacturerName('');
    setEditId(null);
    setIsEditing(false);
  };

  const filteredManufacturers = manufacturers.filter((manufacturer) =>
    manufacturer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" gap={2}>
          <CircularProgress />
          <Typography>Loading Manufacturers...</Typography>
        </Box>
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
        <Typography variant="h5" sx={{ padding: '5px', fontWeight: 'bold' }} color="black">
          Manage Bike Manufacturers
        </Typography>
      </Box>

      <Divider sx={{ backgroundColor: 'primary.main', marginBottom: '15px' }} />

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          marginBottom: 4,
          marginTop: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
        }}
      >
        <TextField
          label="Search Manufacturer"
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
          onClick={handleAddManufacturer}
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
          Add Manufacturer
        </Button>
      </Box>

      {manufacturers.length === 0 ? (
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center" 
          p={4} 
          bgcolor="grey.100" 
          borderRadius={2}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No manufacturers found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddManufacturer}
            sx={{
              mt: 2,
              '&:hover': {
                backgroundColor: 'green',
              },
            }}
          >
            Add Your First Manufacturer
          </Button>
        </Box>
      ) : (
        <TableContainer sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem', 
                    backgroundColor: theme.palette.grey[200] 
                  }}
                >
                  Serial Number
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem', 
                    backgroundColor: theme.palette.grey[200] 
                  }}
                >
                  Manufacturer Name
                </TableCell>
                <TableCell 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontSize: '1.1rem', 
                    backgroundColor: theme.palette.grey[200] 
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredManufacturers.map((manufacturer, index) => (
                <TableRow key={manufacturer.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{manufacturer.name}</TableCell>
                  <TableCell>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEditManufacturer(manufacturer.id, manufacturer.name)}
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
                      onClick={() => handleDeleteManufacturer(manufacturer.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

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
            onSubmit={handleAddOrEditManufacturer}
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
              {isEditing ? 'Edit Manufacturer' : 'Add Manufacturer'}
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
                  label="Manufacturer Name"
                  name="manufacturerName"
                  value={manufacturerName}
                  onChange={(e) => setManufacturerName(e.target.value)}
                  required
                />
              </FormControl>
            </Box>

            <DialogActions sx={{ padding: 2 }}>
              <Button onClick={handleCloseDialog} variant="contained" color="secondary">
                Cancel
              </Button>
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

export default ManageBikeManufacturers;