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

const ManageBikeAgents = () => {
  const theme=new useTheme();
  const [bikeAgents, setBikeAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [formData, setFormData] = useState({
    agentName: '',
    contactNumber: '',
    address: '',
    identificationNumber: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all bike agents
  const fetchBikeAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${url}/agent/`);
      const data = await response.json();
      setBikeAgents(data);
      setFilteredAgents(data); // Initialize filtered agents
    } catch (error) {
      console.error('Error fetching bike agents:', error);
    }
    finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikeAgents();
  }, []);

  useEffect(() => {
    // Filter agents based on search term
    const filtered = bikeAgents.filter((agent) =>
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAgents(filtered);
  }, [searchTerm, bikeAgents]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add or update a bike agent
  const handleAddAgent = async (e) => {
    e.preventDefault();

    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };
  
      const response=await fetch(`${url}/agent/add`, requestOptions);
      const newAgent = await response.json();
      // Update state with the new seller
    setBikeAgents((prevAgents) => [...prevAgents, newAgent]);
    setFilteredAgents((prevFiltered) => [...prevFiltered, newAgent]);
      setSuccessMessage('Seller Added Successfully!');
      resetForm();
      } catch (error) {
      console.error('Error adding bike agent:', error);
      setError(error)
    }
  };
  
  const handleUpdateAgent = async (e) => {
    e.preventDefault();
  
    try {
      const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      };
  
      const response = await fetch(`${url}/agent/update/${editingId}`, requestOptions);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update agent');
      }
  
      const updatedAgent = await response.json();
  
      // Update agent in state
      if (updatedAgent && updatedAgent.id === editingId) {
        setBikeAgents((prevAgents) =>
          prevAgents.map((agent) => (agent.id === editingId ? updatedAgent : agent))
        );
        setFilteredAgents((prevFiltered) =>
          prevFiltered.map((agent) => (agent.id === editingId ? updatedAgent : agent))
        );
        setSuccessMessage('Updated Successfully!');
        setError(null); // Clear error if successful
        resetEditingState();
      } else {
        console.warn("Updated Agent data missing ID or does not match editing ID:", updatedAgent);
      }
    } catch (error) {
      console.error('Error updating bike agent:', error);
      setError(new Error('Error updating bike agent: ' + error.message));
    }
  };
  
  
    // Delete a bike agent
    const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this agent?')) {
        try {
          await fetch(`${url}/agent/delete/${id}`, { method: 'DELETE' });
          setBikeAgents((prevAgents) => prevAgents.filter((Agent) => Agent.id !== id)); 
        setFilteredAgents((prevFiltered) => prevFiltered.filter((Agent) => Agent.id !== id)); 
          setSuccessMessage('Deleted Successfully!')
        } catch (error) {
          console.error('Error deleting bike agent:', error);
          setError(error)
        }
      }
    };


    const handleAddOrEditAgent = async (event) => {
      event.preventDefault();
      if (isEditing) {
        await handleUpdateAgent(event);
      } else {
        await handleAddAgent(event);
      }
      handleCloseDialog();
    };

  const handleCloseDialog = () => {
    setOpen(false);
    resetEditingState();
  };
  // Helper function to reset the form
  const resetForm = () => {
    setFormData({ agentName: '', contactNumber: '', address: '', identificationNumber: '' });
  };
  
  // Helper function to reset editing state
  const resetEditingState = () => {
    setIsEditing(false);
    setEditingId(null);
    resetForm();
  };
  // Edit a bike agent
  const handleEdit = (agent) => {
    setOpen(true)
    setFormData(agent);
    setIsEditing(true);
    setEditingId(agent.id);
  };
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage('');
  };  
  const handleAdd = () => {
    setIsEditing(false);
    setFormData({ agentName: '', contactNumber: '', address: '', identificationNumber: '' });
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
            <Typography>Loading Agents details...</Typography>
          </Container>
        );
      }
    
      if (error) {
        return (
          <Container>
            <Typography color="error">{error}</Typography>
            <IconButton onClick={fetchBikeAgents} variant="contained" color="primary">
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
        Manage Bike Agents
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
        label="Search by Agent Name"
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
        Add Agent
      </Button>
    </Box>
    {bikeAgents.length=== 0 ? (
        <Typography>No Agent details found.</Typography>
            ) : (
              <TableContainer  sx={{ boxShadow: 3, borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>

                    <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Serial Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Agent Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Address
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Identification Number
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Contact
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredAgents.length>0?(
                      filteredAgents.map((Agent, index) => (
                        <TableRow key={Agent.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                          <TableCell >{index + 1}</TableCell>
                          <TableCell>{Agent.agentName}</TableCell>
                          <TableCell>{Agent.address}</TableCell>
                          <TableCell>{Agent.identificationNumber}</TableCell>
                          <TableCell>{Agent.contactNumber}</TableCell>
                          <TableCell>
                            <IconButton
                              edge="end"
                              aria-label="edit"
                              onClick={() => handleEdit(Agent)}
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
                              onClick={() => handleDelete(Agent.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} align="center">
                            No Agent details found.
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
                    {isEditing ? 'Update' : 'Add'} Bike Agents
                </Typography>

                  <Divider sx={{ marginBottom: '20px' }} />

                  <Box sx={{ maxHeight: '320px', overflowY: 'auto', paddingRight: '8px' }}>
                  <TextField
                    label="Agent Name"
                    name="agentName"
                    value={formData.agentName}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Contact Number"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Identification Number"
                    name="identificationNumber"
                    value={formData.identificationNumber}
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

export default ManageBikeAgents;
