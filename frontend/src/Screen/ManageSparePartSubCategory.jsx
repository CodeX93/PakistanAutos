import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TableCell, TableHead, TableContainer, Table, Snackbar, Alert,
  Divider, useTheme, InputAdornment, CircularProgress, TextField, Button,
  Typography, IconButton, TableRow, TableBody, Modal, FormControl, DialogActions,
  Select, MenuItem, InputLabel } from '@mui/material';
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

const ManageSparePartSubCategory = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${url}/category`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
    }
  };

  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/subcategory`);
      const data = await response.json();
      setSubCategories(data);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      setError('Failed to fetch sub-categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };

  const checkDuplicateSubCategory = (name, categoryId) => {
    return subCategories.some(
      subCategory => 
        subCategory.name.toLowerCase() === name.toLowerCase() && 
        subCategory.categoryId === categoryId &&
        (!isEditing || subCategory.id !== editId)
    );
  };

  const handleAddOrEditSubCategory = async (event) => {
    event.preventDefault();
    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }
    if (subCategoryName.trim() === '') {
      setError('Sub-category name cannot be empty');
      return;
    }

    if (checkDuplicateSubCategory(subCategoryName, selectedCategory)) {
      setError('This sub-category already exists for the selected category');
      return;
    }

    if (isEditing) {
      await updateSubCategory(editId, selectedCategory, subCategoryName);
    } else {
      await addSubCategory(selectedCategory, subCategoryName);
    }
    handleCloseDialog();
    fetchSubCategories();
  };

  const addSubCategory = async (categoryId, name) => {
    try {
      const response = await fetch(`${url}/subcategory/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, name }),
      });
      if (!response.ok) {
        throw new Error('Failed to add sub-category');
      }
      setSuccessMessage('Sub-category Added Successfully!');
    } catch (error) {
      setError('Error adding sub-category');
      console.error('Error adding sub-category:', error);
    }
  };

  const updateSubCategory = async (id, categoryId, name) => {
    try {
      const response = await fetch(`${url}/subcategory/update/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, name }),
      });
      if (!response.ok) {
        throw new Error('Failed to update sub-category');
      }
      setSuccessMessage('Updated Successfully!');
    } catch (error) {
      setError('Error updating sub-category');
      console.error('Error updating sub-category:', error);
    }
  };

  const handleDeleteSubCategory = async (id) => {
    try {
      const response = await fetch(`${url}/subcategory/delete/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete sub-category');
      }
      setSuccessMessage('Deleted Successfully!');
      fetchSubCategories();
    } catch (error) {
      setError('Error deleting sub-category');
      console.error('Error deleting sub-category:', error);
    }
  };

  const handleAddSubCategory = () => {
    setIsEditing(false);
    setSelectedCategory('');
    setSubCategoryName('');
    setOpen(true);
  };

  const handleEditSubCategory = (subCategory) => {
    setEditId(subCategory.id);
    setSelectedCategory(subCategory.categoryId);
    setSubCategoryName(subCategory.name);
    setIsEditing(true);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedCategory('');
    setSubCategoryName('');
    setEditId(null);
    setIsEditing(false);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  const filteredSubCategories = subCategories.filter((subCategory) =>
    (subCategory.name && subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (getCategoryName(subCategory.categoryId).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading Sub-categories...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
        <IconButton onClick={fetchSubCategories} variant="contained" color="primary">
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
          Manage Spare Part Sub-categories
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
          label="Search Sub-category"
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
          onClick={handleAddSubCategory}
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
          Add Sub-category
        </Button>
      </Box>

      {subCategories.length === 0 ? (
        <Typography>No sub-categories found.</Typography>
      ) : (
        <TableContainer sx={{ boxShadow: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Serial Number
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Sub-category Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubCategories.length > 0 ? (
                filteredSubCategories.map((subCategory, index) => (
                  <TableRow key={subCategory.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{getCategoryName(subCategory.categoryId)}</TableCell>
                    <TableCell>{subCategory.name}</TableCell>
                    <TableCell>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditSubCategory(subCategory)}
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
                        onClick={() => handleDeleteSubCategory(subCategory.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No sub-categories found.
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
            onSubmit={handleAddOrEditSubCategory}
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
              {isEditing ? 'Edit Sub-category' : 'Add Sub-category'}
            </Typography>

            <Divider sx={{ marginBottom: '20px' }} />

            <Box
              sx={{
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '8px',
              }}
            >
              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <TextField
                  label="Sub-category Name"
                  name="subCategoryName"
                  value={subCategoryName}
                  onChange={(e) => setSubCategoryName(e.target.value)}
                  required
                />
              </FormControl>
            </Box>

            <DialogActions sx={{padding: 2 }}>
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

export default ManageSparePartSubCategory;