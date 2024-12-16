import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TableCell, TableHead, TableContainer,Table, Snackbar, Alert, 
  Divider, useTheme, InputAdornment, CircularProgress,TextField, Button,
   Typography, IconButton, TableRow, TableBody, Modal, FormControl,DialogActions, InputLabel, MenuItem,Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import url from '../baseUrl';

const Container = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  maxWidth: '800px',
  width: '90%',
  margin: 'auto',
  marginTop: theme.spacing(4),
}));

const bikeTypes = ['Electric', 'Non-Electric'];
const strokeTypes = ['2-Stroke', '4-Stroke'];

const ManageMotorBikeModels = () => {
const theme = useTheme();
const [open, setOpen] = useState(false);
const [error, setError] = useState('');
const [successMessage, setSuccessMessage] = useState('');
const [models, setModels] = useState([]);
const [isEditing, setIsEditing] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [manufacturers, setManufacturers] = useState([]);
const [loading, setLoading] = useState(true);
const [modelId, setModelId] = useState(null);
const [originalManufacturerId, setOriginalManufacturerId] = useState(null);
const [bikeDetails, setBikeDetails] = useState({
  modelName: '',
  type: '',
  manufacturer: '', // This will hold the manufacturer ID
  manufacturerName: '', // Will hold the name
  manufacturerYear: '',
  engine: {
    power: '',
    stroke: '',
  },
  power: {
    battery: '',
    cc: '',
    watt: '',
  },
  range: '',
});

// Fetch manufacturers from API
const fetchManufacturers = async () => {
  try {
    setError(null);
    const response = await fetch(`${url}/manufacturer/`);
    if (!response.ok) throw new Error('Failed to fetch manufacturers');
    const data = await response.json();
    setManufacturers(data);
  } catch (err) {
    console.error('Error fetching manufacturers:', err.message);
    setError(err.message);
  }
};

const fetchModels = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await fetch(`${url}/bikemodel/models`);
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const modelsWithId = data.map((model) => ({
      ...model,
      modelId: model.id,
      manufacturerId: model.parentId,
      modelName: model.modelName || model.model || '',  // Some models have 'model' instead of 'modelName'
      manufacturerYear: model.manufacturerYear || model.modelYear || '', // Some models have 'modelYear'
      manufacturer: model.parentId // Store parentId as manufacturer for form handling
    }));

    setModels(modelsWithId);
    
    if (!data || data.length === 0) {
      throw new Error('No data received from the server.');
    }
  } catch (err) {
    console.error('Error fetching models:', err.message);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};//fixed

// Initialize data on component mount
useEffect(() => {
  fetchManufacturers();
  fetchModels();
}, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('engine') || name.includes('power')) {
      const [category, field] = name.split('.');
      setBikeDetails((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    } else {
      setBikeDetails((prev) => ({ ...prev, [name]: value }));
    }
    if (name === 'manufacturer') {
      const selectedManufacturer = manufacturers.find((m) => m.id === value);
      setBikeDetails((prev) => ({
        ...prev,
        manufacturerName: selectedManufacturer ? selectedManufacturer.name : '',
      }));
    }
  };



  const handleAddModelSubmit = async (e) => {
    e.preventDefault();
    
    const { modelName, type, manufacturerYear, manufacturer, manufacturerName, range, power, engine } = bikeDetails;
    
    if (!modelName || !type || !manufacturerYear || !manufacturerName || !manufacturer) {
      setError('All required fields must be provided.');
      return;
    }
    if (type === 'Electric' && (!range || !power.battery || !power.watt)) {
      setError('Range, Battery, and Power in Watt are required for electric bikes.');
      return;
    }
    if (type === 'Non-Electric' && (!power.cc || !engine.stroke)) {
      setError('Engine Capacity (CC) and Stroke are required for non-electric bikes.');
      return;
    }
  
    const requestBody = {
      modelName,
      type,
      manufacturerId: manufacturer,
      manufacturerName,
      manufacturerYear,
      engine: {
        power: engine.power,
        stroke: type === 'Non-Electric' ? engine.stroke : undefined,
      },
      power: {
        battery: type === 'Electric' ? power.battery : undefined,
        cc: type === 'Non-Electric' ? power.cc : undefined,
        watt: type === 'Electric' ? power.watt : undefined,
      },
      range: type === 'Electric' ? range : undefined,
    };
  
    try {
      const response = await fetch(`${url}/bikemodel/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setModels([...models, { ...bikeDetails, id: result.documentId }]);
        setSuccessMessage('Model added successfully');
        setOpen(false);
      } else {
        setError(result.error || 'Failed to add bike model.');
      }
    } catch (error) {
      console.error('Error adding bike model:', error);
      setError('Error adding bike model.');
    }
  };

  const handleEditModelSubmit = async (e) => {
    e.preventDefault();


    const { modelName, type, manufacturerYear,manufacturer, manufacturerName, range, power, engine } = bikeDetails;


    if (type === 'Electric' && (!range || !power.battery || !power.watt)) {
      setError('Range, Battery, and Power in Watt are required for electric bikes.');
      return;
    }
    if (type === 'Non-Electric' && (!power.cc || !engine.stroke)) {
      setError('Engine Capacity (CC) and Stroke are required for non-electric bikes.');
      return;
    }

    const requestBody = {
      modelName,
      type,
      manufacturerId: manufacturer,
      manufacturerName,
      manufacturerYear,
      engine: {
        power: engine.power,
        stroke: type === 'Non-Electric' ? engine.stroke : undefined,
      },
      power: {
        battery: type === 'Electric' ? power.battery : undefined,
        cc: type === 'Non-Electric' ? power.cc : undefined,
        watt: type === 'Electric' ? power.watt : undefined,
      },
      range: type === 'Electric' ? range : undefined,
    };
    try {
      const response = await fetch(`${url}/bikemodel/update/${originalManufacturerId}/${type}/${modelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (response.ok) {
        // const updatedModels = models.map((model) => (model.modelId === modelId ? { ...bikeDetails, id: result.modelId } : model));
        // setModels(updatedModels);
        await fetchModels(); // This will update the state with the latest data

        setSuccessMessage('Model updated successfully');
        setOpen(false);
      } else {
        setError(result.error || 'Failed to update bike model.');
      }
    } catch (error) {
      console.error('Error updating bike model:', error);
      setError('Error updating bike model.');
    }
  };

  const handleAddOrEditModel = async (event) => {
    event.preventDefault();
    if (isEditing) {
      await handleEditModelSubmit(event);
    } else {
      await handleAddModelSubmit(event);
    }
    handleCloseDialog();
  };
  
  
  

  const handleCloseDialog = () => {
    setOpen(false);
    resetFields(); 
  };
  
  const resetFields = () => {
    setBikeDetails({
      modelName: '',
      type: '',
      manufacturerYear: '',
      manufacturer: '',
      manufacturerName: '',
      engine: {
        power: '',
        stroke: '',
      },
      power: {
        battery: '',
        cc: '',
        watt: '',
      },
      range: '',
    });
    setModelId(null);
  };
  
  
  const handleAddModel = () => {
    setIsEditing(false);
    setBikeDetails({
      modelName: '',
      type: '',
      manufacturer: '',
      manufacturerYear: '',
      range: '',
      power: { battery: '', watt: '', cc: '' },
      engine: { stroke: '' }
    });
    setOpen(true);
  };

  const handleEditModel = (modelId, modelName, type, manufacturer, manufacturerYear, manufacturerName, engine, power, range) => {
    setModelId(modelId); // Ensure this uses the correct field name
    setOriginalManufacturerId(manufacturer); // Store original manufacturer ID
    setBikeDetails({
      modelName: modelName || '',
      type: type || '',
      manufacturer: manufacturer || '', // For display, we can still use `manufacturer`
      manufacturerYear: manufacturerYear || '',
      range: range || '',
      power: power || { battery: '', watt: '', cc: '' },
      engine: engine || { stroke: '' },
    });
  
    setIsEditing(true);
    setOpen(true);
  };

 
  

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };    

const handleDeleteModel = async (manufacturerId, type, modelId) => {
  const isConfirmed = window.confirm("Are you sure you want to delete this model?");
  if (!isConfirmed) return;



  try {
    const response = await fetch(`${url}/bikemodel/delete/${manufacturerId}/${type}/${modelId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setSuccessMessage("Deleted Successfully!");
      setModels(models.filter((model) => model.modelId !== modelId));
    } else {
      alert('Failed to delete bike model.');
    }
  } catch (error) {
    console.error('Error deleting bike model:', error);
    alert('Error deleting bike model.');
  }
};
  

   const filteredModels=models.filter((model) =>
          model.modelName.toLowerCase().includes(searchTerm.toLowerCase()));


   if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading Model details...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
        <IconButton onClick={fetchModels} variant="contained" color="primary">
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
          Manage Bike Models
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
          label="Search by Model"
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
          onClick={handleAddModel}
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
          Add Model
        </Button>
      </Box>

        

        {models.length === 0 ? (
          <Typography>No Model details found.</Typography>
        ) : (
          <TableContainer  sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>

                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Serial Number
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Model Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Manufacturer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Model Year
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredModels.length > 0 ? (
                  filteredModels.map((model, index) => (
                    <TableRow key={model.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell >{index + 1}</TableCell>
                      <TableCell>{model.modelName}</TableCell>
                      <TableCell>{model.type}</TableCell>
                      <TableCell>{model.manufacturerName}</TableCell>
                      <TableCell>{model.manufacturerYear}</TableCell>


                      <TableCell>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditModel(
                          model.modelId,
                          model.modelName,
                          model.type,
                          model.manufacturer,
                          model.manufacturerYear,
                          model.manufacturerName,
                          model.engine,
                          model.power,
                          model.range,
                        )}
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
                        onClick={() => handleDeleteModel(model.manufacturerId,model.type,model.modelId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>

                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center">
                      No model details found.
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
                    onSubmit={handleAddOrEditModel}
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
                      {isEditing ? 'Edit Model' : 'Add Model'}
                    </Typography>

                    <Divider sx={{ marginBottom: '20px' }} />

                    <Box sx={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
                      {/* Model Name */}
                      <TextField
                        fullWidth
                        label="Model Name"
                        name="modelName"
                        value={bikeDetails.modelName}
                        onChange={handleInputChange}
                        required
                        margin="normal"
                      />

                      {/* Type */}
                      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={bikeDetails.type}
                          onChange={handleInputChange}
                          name="type"
                          label="Type"
                          sx={{ textAlign: 'left' }}             
                        >
                          {bikeTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {/* Manufacturer */}
                      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                        <InputLabel>Manufacturer</InputLabel>
                        <Select
                          value={bikeDetails.manufacturer || ''}  // Use bikeDetails.manufacturer as the value
                          onChange={handleInputChange}
                          name="manufacturer"
                          label="Manufacturer"
                          sx={{ textAlign: 'left' }}
                        >
                          {manufacturers.map((manufacturer) => (
                            <MenuItem key={manufacturer.id} value={manufacturer.id}>
                              {manufacturer.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>


                      {/* Model Year */}
                      <FormControl fullWidth variant="outlined" margin="normal">
                        <InputLabel>Model Year</InputLabel>
                        <Select
                          label="Model Year"
                          name="manufacturerYear"
                          sx={{ textAlign: 'left' }}
                          value={bikeDetails.manufacturerYear}
                          onChange={handleInputChange}
                        >
                          {[...Array(50)].map((_, index) => {
                            const year = new Date().getFullYear() - index;
                            return (
                              <MenuItem key={year} value={year}>
                                {year}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      {/* Electric Fields */}
                      {bikeDetails.type === 'Electric' && (
                        <>
                          <TextField
                            fullWidth
                            label="Range (km)"
                            variant="outlined"
                            name="range"
                            value={bikeDetails.range}
                            onChange={handleInputChange}
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Battery Capacity (kWh)"
                            variant="outlined"
                            name="power.battery"
                            value={bikeDetails.power?.battery || ''}
                            onChange={handleInputChange}
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Power (Watt)"
                            variant="outlined"
                            name="power.watt"
                            value={bikeDetails.power?.watt || ''}
                            onChange={handleInputChange}
                            margin="normal"
                          />
                        </>
                      )}

                      {/* Non-Electric Fields */}
                      {bikeDetails.type === 'Non-Electric' && (
                        <>
                          <TextField
                            fullWidth
                            label="Engine Capacity (CC)"
                            variant="outlined"
                            name="power.cc"
                            value={bikeDetails.power?.cc || ''}
                            onChange={handleInputChange}
                            margin="normal"
                          />
                          <FormControl fullWidth variant="outlined" margin="normal">
                            <InputLabel>Stroke</InputLabel>
                            <Select
                              value={bikeDetails.engine?.stroke || ''}
                              onChange={handleInputChange}
                              name="engine.stroke"
                              label="Stroke"
                            >
                              {strokeTypes.map((stroke) => (
                                <MenuItem key={stroke} value={stroke}>
                                  {stroke}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </>
                      )}
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

export default ManageMotorBikeModels;

