import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MuiAlert from '@mui/material/Alert';

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: '#f0f0f0', // Light grey background
  padding: theme.spacing(3),
  borderRadius: '10px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', // Increased shadow for depth
  maxWidth: '600px', // Adjust width as needed
  width: '90%',
  margin: 'auto', // Centering the div
  marginTop: '20px', // Space from top
}));

const ScrollableForm = styled(Box)(({ theme }) => ({
  maxHeight: '400px', // Set a fixed height to make the form scrollable
  overflowY: 'auto', // Enable vertical scrolling for form fields
  paddingRight: theme.spacing(1), // Add padding to avoid scroll bar overlap
  marginBottom: theme.spacing(2), // Add some space for buttons below the form
}));

const ScrollableList = styled(List)(({ theme }) => ({
  maxHeight: '250px', // Fixed height for the list
  overflowY: 'auto', // Enable vertical scrolling for list items
  marginTop: theme.spacing(2),
  backgroundColor: '#f9f9f9', // Light background for the list
  borderRadius: '8px',
  padding: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: '8px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  marginBottom: theme.spacing(1),
  transition: '0.3s',
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
}));

const ButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: theme.spacing(2),
}));

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ManufacturerForm = () => {
  const [manufacturerName, setManufacturerName] = useState('');
  const [manufacturers, setManufacturers] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleAddManufacturer = () => {
    if (manufacturerName.trim() !== '') {
      if (editIndex !== null) {
        // Update existing manufacturer
        const updatedManufacturers = manufacturers.map((item, index) =>
          index === editIndex ? manufacturerName : item
        );
        setManufacturers(updatedManufacturers);
        setEditIndex(null); // Reset edit index
      } else {
        // Add new manufacturer
        setManufacturers([...manufacturers, manufacturerName]);
        setSnackbarOpen(true); // Show snackbar on add
      }
      setManufacturerName(''); // Clear the input field
    }
  };

  const handleEditManufacturer = (index) => {
    setManufacturerName(manufacturers[index]);
    setEditIndex(index);
  };

  const handleDeleteManufacturer = (index) => {
    setManufacturers(manufacturers.filter((_, i) => i !== index));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container>
      <Typography variant="h6" gutterBottom>
        {editIndex !== null ? 'Edit Manufacturer' : 'Add Spare Part Manufacturer'}
      </Typography>

      {/* Scrollable form section */}
      <ScrollableForm>
        <TextField
          label="Manufacturer Name"
          variant="outlined"
          fullWidth
          value={manufacturerName}
          onChange={(e) => setManufacturerName(e.target.value)}
          margin="normal"
        />
      </ScrollableForm>

      <ButtonContainer>
        <StyledButton variant="contained" color="primary" onClick={handleAddManufacturer} fullWidth>
          {editIndex !== null ? 'Update Manufacturer' : 'Add Manufacturer'}
        </StyledButton>
      </ButtonContainer>

      {/* Scrollable list section */}
      <ScrollableList>
        {manufacturers.length > 0 ? (
          manufacturers.map((manufacturer, index) => (
            <StyledListItem
              key={index}
              secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => handleEditManufacturer(index)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDeleteManufacturer(index)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={manufacturer} />
            </StyledListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No manufacturers added yet." />
          </ListItem>
        )}
      </ScrollableList>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success">
          Manufacturer added successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ManufacturerForm;
