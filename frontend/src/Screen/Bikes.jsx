import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Breadcrumbs,
  Link,
  TablePagination,
  InputAdornment,
  Typography,
  Modal,
  IconButton,
  CircularProgress,
  useTheme,
  Divider,
  Grid,
  Container,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import BuildIcon from '@mui/icons-material/Build';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import EmojiFlagsIcon from '@mui/icons-material/EmojiFlags';
import SpeedIcon from '@mui/icons-material/Speed';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsInputSvideoIcon from '@mui/icons-material/SettingsInputSvideo';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import url from '../baseUrl';

const BikeList = (role) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [bikeData, setBikeData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedBike, setSelectedBike] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(role)
    const fetchData = async () => {
      setLoading(true);
      try {
        if (navigator.onLine) {
          const response = await fetch(`${url}/bikeinventory/getAllInventory`);
          const data = await response.json();

          if (data.inventory && Array.isArray(data.inventory)) {
            localStorage.setItem('bikeInventory', JSON.stringify(data.inventory));
            setBikeData(data.inventory);
          } else {
            console.error('Invalid inventory data structure:', data);
            setBikeData([]);
          }
        } else {
          const cachedData = localStorage.getItem('bikeInventory');
          if (cachedData) {
            setBikeData(JSON.parse(cachedData));
          } else {
            console.warn('No cached data available.');
            setBikeData([]);
          }
        }
      } catch (error) {
        console.error('Error fetching bike inventory:', error);
        const cachedData = localStorage.getItem('bikeInventory');
        if (cachedData) {
          setBikeData(JSON.parse(cachedData));
        } else {
          setBikeData([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = (bike) => {
    setSelectedBike(bike);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBike(null);
  };

  const filteredBikes = bikeData.filter((bike) => {
    const searchTermLower = searchTerm.toLowerCase();
    
    // Common searchable fields
    const modelMatch = bike.model.toLowerCase().includes(searchTermLower);
    const manufacturerMatch = bike.manufacturer.toLowerCase().includes(searchTermLower);
    
    // ID number matches based on bike type
    const nonElectricMatches = bike.type === 'Non-Electric' && (
      (bike.engineNo?.toLowerCase().includes(searchTermLower) ?? false) ||
      (bike.chassisNumber?.toLowerCase().includes(searchTermLower) ?? false)
    );
    
    const electricMatches = bike.type === 'Electric' && (
      (bike.motorNo?.toLowerCase().includes(searchTermLower) ?? false) ||
      (bike.frameNo?.toLowerCase().includes(searchTermLower) ?? false)
    );
  
    const matchesSearch = modelMatch || 
                         manufacturerMatch || 
                         nonElectricMatches || 
                         electricMatches;
  
    const matchesType = filterType === 'All' || bike.type === filterType;
  
    return matchesSearch && matchesType;
  });

  return (
    <Container>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ marginBottom: '15px' }}>
        <Typography variant="h4" sx={{ padding: '5px', fontWeight: 'bold' }} color="primary">
          All Available Bikes
        </Typography>

        <TextField
  label="Search by Model, Manufacturer, or any ID Number"
  variant="outlined"
  value={searchTerm}
  onChange={handleSearchChange}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
  }}
  sx={{
    width: '400px', // Increased width to accommodate longer label
    backgroundColor: theme.palette.background.paper,
    borderRadius: '12px',
  }}
/>
      </Box>

      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: '20px', fontSize: '1.1rem', fontWeight: '500' }}>
        <Link
          color={filterType === 'All' ? 'textPrimary' : theme.palette.text.secondary}
          onClick={() => handleFilterChange('All')}
          underline="hover"
          sx={{
            padding: '5px',
            cursor: 'pointer',
            fontSize: '1.1rem',
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          All
        </Link>
        <Link
          color={filterType === 'Electric' ? 'textPrimary' : theme.palette.text.secondary}
          onClick={() => handleFilterChange('Electric')}
          underline="hover"
          sx={{
            cursor: 'pointer',
            fontSize: '1.1rem',
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          Electric
        </Link>
        <Link
          color={filterType === 'Non-Electric' ? 'textPrimary' : theme.palette.text.secondary}
          onClick={() => handleFilterChange('Non-Electric')}
          underline="hover"
          sx={{
            cursor: 'pointer',
            fontSize: '1.1rem',
            '&:hover': { color: theme.palette.primary.main },
          }}
        >
          Non-Electric
        </Link>
      </Breadcrumbs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      ) : bikeData.length === 0 ? (
        <Typography>No bikes available.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: theme.shadows[4] }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Identification Numbers
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Model
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Manufacturer
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Engine Type
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Condition
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Model Year
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Mileage
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Registration City
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem', backgroundColor: theme.palette.grey[200] }}>
                    Info
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBikes
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((bike, index) => (
                    <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] } }}>
                     <TableCell>
  {bike.type === 'Electric' ? (
    <>
      Motor No: {bike.motorNo}<br />
      Frame No: {bike.frameNo}
    </>
  ) : (
    <>
      Engine No: {bike.engineNo}<br />
      Chassis No: {bike.chassisNumber}
    </>
  )}
</TableCell>
                      <TableCell>{bike.model}</TableCell>
                      <TableCell>{bike.manufacturer}</TableCell>
                      <TableCell>{bike.type}</TableCell>
                      <TableCell>{bike.condition}</TableCell>
                      <TableCell>{bike.modelYear}</TableCell>
                      <TableCell>{bike.mileage}</TableCell>
                      <TableCell>{bike.registrationCity}</TableCell>
                      <TableCell>
                        <IconButton
                          sx={{
                            color: 'primary',
                            '&:hover': {
                              color: '#03b5f1',
                              transform: 'scale(1.1)',
                              transition: 'transform 0.2s ease-in-out',
                            },
                          }}
                          onClick={() => handleOpenModal(bike)}
                        >
                          <InfoIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredBikes.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </>
      )}

      <Modal open={openModal} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {selectedBike && (
            <div>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
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
                  marginBottom: '20px',
                  fontWeight: 'bold',
                  color: '#4CAF50',
                  fontSize: '1.5rem',
                }}
              >
                BIKE DETAILS
              </Typography>

              <Divider sx={{ marginBottom: '20px' }} />

              <Grid
  container
  spacing={2}
  sx={{
    maxHeight: '400px',
    overflowY: 'auto',
    scrollbarColor: '#B0BEC5 transparent',
    '&::-webkit-scrollbar': {
      width: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: '#4CAF50',
      borderRadius: '5px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
  }}
>
  {/* Identification Numbers Section */}
  {selectedBike.type === 'Electric' ? (
    <>
      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <DirectionsBikeIcon color="primary" /> Motor Number:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.motorNo}
      </Grid>

      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <DirectionsBikeIcon color="primary" /> Frame Number:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.frameNo}
      </Grid>
    </>
  ) : (
    <>
      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <DirectionsBikeIcon color="primary" /> Engine Number:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.engineNo}
      </Grid>

      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <DirectionsBikeIcon color="primary" /> Chassis Number:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.chassisNumber}
      </Grid>
    </>
  )}

  {/* Basic Info Section */}
  <Grid item xs={12}>
    <Divider sx={{ my: 1 }}>
      <Typography variant="subtitle2" color="primary">Basic Information</Typography>
    </Divider>
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <BuildIcon color="primary" /> Model:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.model}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <EmojiFlagsIcon color="primary" /> Manufacturer:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.manufacturer}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <BuildIcon color="primary" /> Engine Type:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.type}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <EmojiFlagsIcon color="primary" /> Condition:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.condition}
  </Grid>

  {/* Registration Info Section */}
  <Grid item xs={12}>
    <Divider sx={{ my: 1 }}>
      <Typography variant="subtitle2" color="primary">Registration Details</Typography>
    </Divider>
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <CalendarTodayIcon color="primary" /> Model Year:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.modelYear}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <SpeedIcon color="primary" /> Mileage:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.mileage || 'NA'}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <LocationCityIcon color="primary" /> Registration City:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.registrationCity || 'NA'}
  </Grid>

  {/* Purchase Details Section */}

  {role.role !== 'manager' && (
  <>
    <Grid item xs={12}>
      <Divider sx={{ my: 1 }}>
        <Typography variant="subtitle2" color="primary">Purchase Details</Typography>
      </Divider>
    </Grid>

    <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
      <AttachMoneyIcon color="primary" /> Purchase Price:
    </Grid>
    <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
      ₨ {selectedBike.purchasePrice?.toLocaleString() || 0}
    </Grid>
  </>
)}


  {selectedBike.condition === 'used' && (
    <>
      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <AttachMoneyIcon color="primary" /> Commission:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        ₨ {selectedBike.commissionPrice?.toLocaleString() || 0}
      </Grid>

      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <AttachMoneyIcon color="primary" /> Total Expenses:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        ₨ {selectedBike.totalExpenses?.toLocaleString() || 0}
      </Grid>

      {selectedBike.expenses?.length > 0 && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" color="primary" sx={{ mt: 1, mb: 1 }}>
            Expense Details:
          </Typography>
          {selectedBike.expenses.map((expense, index) => (
            <Typography key={index} variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
              <span>{expense.name}:</span>
              <span>₨ {expense.cost?.toLocaleString() || 0}</span>
            </Typography>
          ))}
        </Grid>
      )}

      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <AttachMoneyIcon color="primary" /> Final Price:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        ₨ {selectedBike.finalPurchasePrice?.toLocaleString() || 0}
      </Grid>
    </>
  )}

  {/* Seller Info Section */}
  <Grid item xs={12}>
    <Divider sx={{ my: 1 }}>
      <Typography variant="subtitle2" color="primary">Seller Information</Typography>
    </Divider>
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <PersonIcon color="primary" /> Seller Name:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.sellerInfo?.name || 'NA'}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <PersonIcon color="primary" /> Contact:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.sellerInfo?.contactNo || 'NA'}
  </Grid>

  <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
    <PersonIcon color="primary" /> CNIC:
  </Grid>
  <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    {selectedBike.sellerInfo?.cnic || 'NA'}
  </Grid>

  {/* Technical Specifications Section */}
  <Grid item xs={12}>
    <Divider sx={{ my: 1 }}>
      <Typography variant="subtitle2" color="primary">Technical Specifications</Typography>
    </Divider>
  </Grid>

  {selectedBike.type === 'Non-Electric' ? (
    <>
      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <SettingsIcon color="primary" /> CC:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.cc || 'NA'}
      </Grid>

      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <SettingsInputSvideoIcon color="primary" /> Stroke:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.stroke || 'NA'}
      </Grid>
    </>
  ) : (
    <>
      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <FlashOnIcon color="primary" /> Power:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.power || 'NA'}
      </Grid>

      <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        <ShowChartIcon color="primary" /> Range:
      </Grid>
      <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
        {selectedBike.range || 'NA'}
      </Grid>

      {selectedBike.batteryDetails && (
        <>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>
              Battery Details:
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            Capacity:
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {selectedBike.batteryDetails.capacity || 'NA'}
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            Quantity:
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {selectedBike.batteryDetails.quantity || 'NA'}
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            Volts:
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {selectedBike.batteryDetails.volts || 'NA'}
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            Amperes:
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
            {selectedBike.batteryDetails.amperes || 'NA'}
          </Grid>
        </>
      )}
    </>
  )}

  {/* Warranty Section */}
  <Grid item xs={12}>
    <Divider sx={{ my: 1 }}>
      <Typography variant="subtitle2" color="primary">Warranty Information</Typography>
    </Divider>
  </Grid>

  <Grid item xs={12} sx={{ textAlign: 'left', display: 'flex', alignItems: 'center' }}>
    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
      {selectedBike.warranty || 'No warranty information available'}
    </Typography>
  </Grid>
</Grid>
            </div>
          )}
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

export default BikeList;