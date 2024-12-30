import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import { Box, TableCell, TableHead, TableContainer, Table, Snackbar, Alert,
  Divider, useTheme, InputAdornment, CircularProgress, TextField, Button,
  Typography, IconButton, TableRow, TableBody, Modal, FormControl, DialogActions,
  InputLabel, MenuItem, Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const [modelId, setModelId] = useState(null);
  const [originalManufacturerId, setOriginalManufacturerId] = useState(null);
  const [bikeDetails, setBikeDetails] = useState({
    modelName: '',
    type: '',
    manufacturer: '',
    manufacturerName: '',
    manufacturerYear: '',
    engine: {
      power: '',
      stroke: '',
    },
    power: {
      battery: {
        capacity: '',
        quantity: '',
        volts: '',
        amperes: ''
      },
      cc: '',
      watt: '',
    },
    range: '',
  });

  const fetchManufacturers = async () => {
    try {
      setError(null);
      const response = await fetch(`${url}/manufacturer/`);
      if (!response.ok) throw new Error('Failed to fetch manufacturers');
      const data = await response.json();
      setManufacturers(data || []);
    } catch (err) {
      console.error('Error fetching manufacturers:', err.message);
      setError('Unable to load manufacturers. Please try again.');
      setManufacturers([]);
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${url}/bikemodel/models`);
      
      // Handle different HTTP status codes
      if (response.status === 404) {
        setModels([]);
        setHasAttemptedLoad(true);
        return;
      }
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch bike models.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If error response is not JSON, use status text
          errorMessage = `${errorMessage} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response format from server.');
      }
      
      // Handle empty or invalid data
      if (!data) {
        setModels([]);
        setHasAttemptedLoad(true);
        return;
      }

      // Ensure data is an array
      if (!Array.isArray(data)) {
        data = [];
      }

      const modelsWithId = data.map((model) => {
        // Validate required fields
        if (!model || typeof model !== 'object') {
          console.warn('Invalid model data:', model);
          return null;
        }

        return {
          ...model,
          modelId: model.id || '',
          manufacturerId: model.parentId || '',
          modelName: model.modelName || model.model || 'Unnamed Model',
          manufacturerYear: model.manufacturerYear || model.modelYear || '',
          manufacturer: model.parentId || ''
        };
      }).filter(Boolean); // Remove null entries

      setModels(modelsWithId);
      setHasAttemptedLoad(true);
    } catch (err) {
      console.error('Error fetching models:', err);
      setError(err.message || 'Unable to load bike models. Please check your connection and try again.');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
    fetchModels();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [category, field, subfield] = name.split('.');
      
      if (subfield) {
        setBikeDetails((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            [field]: {
              ...prev[category]?.[field],
              [subfield]: value
            }
          }
        }));
      } else {
        setBikeDetails((prev) => ({
          ...prev,
          [category]: {
            ...prev[category],
            [field]: value
          }
        }));
      }
    } else {
      setBikeDetails((prev) => ({
        ...prev,
        [name]: value
      }));

      if (name === 'manufacturer') {
        const selectedManufacturer = manufacturers.find((m) => m.id === value);
        setBikeDetails((prev) => ({
          ...prev,
          manufacturerName: selectedManufacturer ? selectedManufacturer.name : '',
        }));
      }
    }
  };

  const handleAddModelSubmit = async (e) => {
    e.preventDefault();
    
    const { modelName, type, manufacturerYear, manufacturer, manufacturerName, range, power, engine } = bikeDetails;
    
    if (!modelName || !type || !manufacturerYear || !manufacturerName || !manufacturer) {
      setError('All required fields must be provided.');
      return;
    }
  
    if (type === 'Electric') {
      const batteryDetails = power?.battery;
      if (!range || !power.watt || !batteryDetails?.capacity || 
          !batteryDetails?.quantity || !batteryDetails?.volts || 
          !batteryDetails?.amperes) {
        setError('For electric bikes, please provide all battery and power details.');
        return;
      }
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
        battery: type === 'Electric' ? {
          capacity: power.battery.capacity,
          quantity: power.battery.quantity,
          volts: power.battery.volts,
          amperes: power.battery.amperes
        } : undefined,
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
        await fetchModels();
        setSuccessMessage('Model added successfully');
        setOpen(false);
        resetFields();
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
  
    const { modelName, type, manufacturerYear, manufacturer, manufacturerName, range, power, engine } = bikeDetails;
  
    if (type === 'Electric') {
      const batteryDetails = power?.battery;
      if (!range || !power.watt || !batteryDetails?.capacity || 
          !batteryDetails?.quantity || !batteryDetails?.volts || 
          !batteryDetails?.amperes) {
        setError('For electric bikes, please provide all battery and power details.');
        return;
      }
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
        battery: type === 'Electric' ? {
          capacity: power.battery.capacity,
          quantity: power.battery.quantity,
          volts: power.battery.volts,
          amperes: power.battery.amperes
        } : undefined,
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
        await fetchModels();
        setSuccessMessage('Model updated successfully');
        setOpen(false);
        resetFields();
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
        battery: {
          capacity: '',
          quantity: '',
          volts: '',
          amperes: ''
        },
        cc: '',
        watt: '',
      },
      range: '',
    });
    setModelId(null);
  };

  const handleAddModel = () => {
    setIsEditing(false);
    resetFields();
    setOpen(true);
  };

  const handleEditModel = (modelId, modelName, type, manufacturer, manufacturerYear, manufacturerName, engine, power, range) => {
    setModelId(modelId);
    setOriginalManufacturerId(manufacturer);
    setBikeDetails({
      modelName: modelName || '',
      type: type || '',
      manufacturer: manufacturer || '',
      manufacturerYear: manufacturerYear || '',
      manufacturerName: manufacturerName || '',
      range: range || '',
      power: {
        battery: power?.battery ? {
          capacity: power.battery.capacity || '',
          quantity: power.battery.quantity || '',
          volts: power.battery.volts || '',
          amperes: power.battery.amperes || ''
        } : {
          capacity: '',
          quantity: '',
          volts: '',
          amperes: ''
        },
        watt: power?.watt || '',
        cc: power?.cc || ''
      },
      engine: engine || { power: '', stroke: '' }
    });
    setIsEditing(true);
    setOpen(true);
  };

  const handleDeleteModel = async (manufacturerId, type, modelId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this model?");
    if (!isConfirmed) return;
  
    try {
      const response = await fetch(`${url}/bikemodel/delete/${manufacturerId}/${type}/${modelId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setSuccessMessage("Model deleted successfully!");
        setModels(models.filter((model) => model.modelId !== modelId));
      } else {
        setError('Failed to delete bike model.');
      }
    } catch (error) {
      console.error('Error deleting bike model:', error);
      setError('Error deleting bike model.');
    }
  };

  const EmptyState = () => (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
        textAlign: 'center',
        backgroundColor: 'background.paper',
        borderRadius: 2,
        minHeight: '200px'
      }}
    >
      <AddCircleOutlineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom>
        No Bike Models Found
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Get started by adding your first bike model
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleAddModel}
        sx={{ mt: 2 }}
      >
        Add Your First Model
      </Button>
    </Box>
  );

  const filteredModels = models.filter((model) =>
    model.modelName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px'
        }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading bike models...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          gap: 3,
          backgroundColor: '#FFF5F5',
          borderRadius: 2,
          border: '1px solid #FED7D7'
        }}>
          <Typography variant="h6" color="error" gutterBottom>
            Unable to Load Bike Models
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ maxWidth: '500px' }}>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This might be due to:
            • Network connectivity issues
            • Server unavailability
            • Invalid API endpoint
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              onClick={fetchModels}
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
            >
              Retry Loading
            </Button>
            <Button
              onClick={handleAddModel}
              variant="outlined"
              color="primary"
            >
              Add New Model
            </Button>
          </Box>
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
          marginTop: 4,
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

      {hasAttemptedLoad && models.length === 0 ? (
        <EmptyState />
      ) : (
        <TableContainer sx={{ boxShadow: 3, borderRadius: 2 }}>
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
              {filteredModels.map((model, index) => (
                <TableRow key={model.modelId} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{index + 1}</TableCell>
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
                      onClick={() => handleDeleteModel(model.manufacturerId, model.type, model.modelId)}
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
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>
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
              <TextField
                fullWidth
                label="Model Name"
                name="modelName"
                value={bikeDetails.modelName}
                onChange={handleInputChange}
                required
                margin="normal"
              />

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

              <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                <InputLabel>Manufacturer</InputLabel>
                <Select
                  value={bikeDetails.manufacturer}
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
                    label="Battery Quantity"
                    variant="outlined"
                    name="power.battery.quantity"
                    value={bikeDetails.power?.battery?.quantity || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Battery Voltage (V)"
                    variant="outlined"
                    name="power.battery.volts"
                    value={bikeDetails.power?.battery?.volts || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Battery Current (A)"
                    variant="outlined"
                    name="power.battery.amperes"
                    value={bikeDetails.power?.battery?.amperes || ''}
                    onChange={handleInputChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Battery Capacity (kWh)"
                    variant="outlined"
                    name="power.battery.capacity"
                    value={bikeDetails.power?.battery?.capacity || ''}
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

export default ManageMotorBikeModels;