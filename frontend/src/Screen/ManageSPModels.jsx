import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: '#f9f9f9',
  padding: theme.spacing(4),
  borderRadius: '10px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  maxWidth: '800px', // Increased width for better layout
  width: '90%',
  margin: 'auto',
  marginTop: '30px',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const ScrollableForm = styled(Box)(({ theme }) => ({
  maxHeight: '450px', // Limit height to allow scrollability
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
}));

const ScrollableList = styled(List)(({ theme }) => ({
  maxHeight: '250px', // Scrollable list for spare parts
  overflowY: 'auto',
  marginTop: theme.spacing(2),
  backgroundColor: '#f9f9f9',
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

const ManageSpareParts = () => {
  const [parts, setParts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [partDetails, setPartDetails] = useState({
    name: '',
    sku: '',
    manufacturer: '',
    category: '',
    description: '',
    quantity: '',
    unitPrice: '',
    dateAdded: '',
    supplier: '',
    condition: '',
    warrantyInfo: '',
    compatibility: '',
    weight: '',
    dimensions: '',
    location: '',
  });
  const [editIndex, setEditIndex] = useState(null);

  const manufacturers = ['Manufacturer A', 'Manufacturer B', 'Manufacturer C', 'Manufacturer D'];
  const categories = ['Engine', 'Electrical', 'Suspension', 'Transmission'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPartDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrEditPart = () => {
    const { name, sku, unitPrice, quantity } = partDetails;

    if (name && sku && unitPrice && quantity) {
      const updatedParts =
        editIndex !== null
          ? parts.map((part, index) => (index === editIndex ? partDetails : part))
          : [...parts, { ...partDetails, id: Date.now() }];

      setParts(updatedParts);
      resetFields();
    }
  };

  const handleEditPart = (index) => {
    setEditIndex(index);
    setPartDetails(parts[index]);
    setShowForm(true);
  };

  const handleDeletePart = (index) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const resetFields = () => {
    setPartDetails({
      name: '',
      sku: '',
      manufacturer: '',
      category: '',
      description: '',
      quantity: '',
      unitPrice: '',
      dateAdded: '',
      supplier: '',
      condition: '',
      warrantyInfo: '',
      compatibility: '',
      weight: '',
      dimensions: '',
      location: '',
    });
    setEditIndex(null);
    setShowForm(false);
  };

  const filteredParts = parts.filter((part) =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      {showForm ? (
        <>
          <Typography variant="h5" gutterBottom>
            {editIndex !== null ? 'Edit Spare Part' : 'Add New Spare Part'}
          </Typography>

          <ScrollableForm>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Manufacturer</InputLabel>
              <Select
                label="Manufacturer"
                name="manufacturer"
                value={partDetails.manufacturer}
                onChange={handleInputChange}
                inputProps={{
                  style: { borderRadius: '8px' },
                }}
              >
                {manufacturers.map((manufacturer, index) => (
                  <MenuItem key={index} value={manufacturer}>
                    {manufacturer}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                name="category"
                value={partDetails.category}
                onChange={handleInputChange}
                inputProps={{
                  style: { borderRadius: '8px' },
                }}
              >
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Part Name"
              variant="outlined"
              fullWidth
              name="name"
              value={partDetails.name}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />

            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              name="description"
              value={partDetails.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={3}
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />

            {/* Additional Fields */}
            <TextField
              label="Warranty Information"
              variant="outlined"
              fullWidth
              name="warrantyInfo"
              value={partDetails.warrantyInfo}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />
            <TextField
              label="Compatibility"
              variant="outlined"
              fullWidth
              name="compatibility"
              value={partDetails.compatibility}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />
            <TextField
              label="Weight"
              variant="outlined"
              fullWidth
              name="weight"
              value={partDetails.weight}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />
            <TextField
              label="Dimensions"
              variant="outlined"
              fullWidth
              name="dimensions"
              value={partDetails.dimensions}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />
            <TextField
              label="Location in Warehouse"
              variant="outlined"
              fullWidth
              name="location"
              value={partDetails.location}
              onChange={handleInputChange}
              margin="normal"
              InputProps={{
                style: { borderRadius: '8px' },
              }}
            />
          </ScrollableForm>

          <StyledButton variant="contained" color="primary" onClick={handleAddOrEditPart} fullWidth>
            {editIndex !== null ? 'Update Part' : 'Add Part'}
          </StyledButton>
          <Button variant="outlined" color="secondary" onClick={resetFields} fullWidth>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Button variant="contained" color="primary" onClick={() => setShowForm(true)} style={{ marginTop: '20px' }}>
            Add New Spare Part
          </Button>

          <TextField
            label="Search Part"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
            InputProps={{
              style: { borderRadius: '8px' },
            }}
          />

          <ScrollableList>
            {filteredParts.length > 0 ? (
              filteredParts.map((item, index) => (
                <ListItem
                  key={item.id}
                  secondaryAction={
                    <>
                      <IconButton edge="end" aria-label="edit" onClick={() => handleEditPart(index)}>
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeletePart(index)}>
                        <Delete />
                      </IconButton>
                    </>
                  }
                  sx={{
                    backgroundColor: '#ffffff',
                    marginBottom: '10px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <ListItemText
                    primary={`${item.manufacturer} ${item.name}`}
                    secondary={`Category: ${item.category}, SKU: ${item.sku}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" align="center">
                No spare parts found.
              </Typography>
            )}
          </ScrollableList>
        </>
      )}
    </Container>
  );
};

export default ManageSpareParts;
