import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TableCell, TableHead, TableContainer, Table, Snackbar, Alert,
  Divider, useTheme, InputAdornment, CircularProgress, TextField, Button,
  Typography, IconButton, TableRow, TableBody, Modal, FormControl, DialogActions } from '@mui/material';
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

const ManageSparePartCategory = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/category`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };

  const checkDuplicateCategory = (name) => {
    return categories.some(
      category => category.name.toLowerCase() === name.toLowerCase() && 
      (!isEditing || category.id !== editId)
    );
  };

  const handleAddOrEditCategory = async (event) => {
    event.preventDefault();
    if (categoryName.trim() === '') {
      setError('Category name cannot be empty');
      return;
    }

    if (checkDuplicateCategory(categoryName)) {
      setError('This category already exists');
      return;
    }

    if (isEditing) {
      await updateCategory(editId, categoryName);
    } else {
      await addCategory(categoryName);
    }
    handleCloseDialog();
    fetchCategories();
  };

  const addCategory = async (name) => {
    try {
      const response = await fetch(`${url}/category/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('Failed to add category');
      }
      setSuccessMessage('Category Added Successfully!');
    } catch (error) {
      setError('Error adding category');
      console.error('Error adding category:', error);
    }
  };

  const updateCategory = async (id, name) => {
    try {
      const response = await fetch(`${url}/category/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      setSuccessMessage('Updated Successfully!');
    } catch (error) {
      setError('Error updating category');
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const response = await fetch(`${url}/category/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      setSuccessMessage('Deleted Successfully!');
      fetchCategories();
    } catch (error) {
      setError('Error deleting category');
      console.error('Error deleting category:', error);
    }
  };

  const handleAddCategory = () => {
    setIsEditing(false);
    setCategoryName('');
    setOpen(true);
  };

  const handleEditCategory = (id, name) => {
    setEditId(id);
    setCategoryName(name);
    setIsEditing(true);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCategoryName('');
    setEditId(null);
    setIsEditing(false);
  };

  const filteredCategories = categories.filter((category) =>
    category.name && category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading Categories...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
        <IconButton onClick={fetchCategories} variant="contained" color="primary">
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
          Manage Spare Part Categories
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
          label="Search Category"
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
          onClick={handleAddCategory}
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
          Add Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Typography>No categories found.</Typography>
      ) : (
        <TableContainer sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Serial Number
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Category Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditCategory(category.id, category.name)}
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
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No categories found.
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
            onSubmit={handleAddOrEditCategory}
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
              {isEditing ? 'Edit Category' : 'Add Category'}
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
                  label="Category Name"
                  name="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
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

export default ManageSparePartCategory;