import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Checkbox } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Search, DirectionsBike, AttachMoney, Assignment, Person,  Build, } from '@mui/icons-material';
import BikeCreditModal from '../Components/BikeCreditBuyModal';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

const cities = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Multan',
  'Hyderabad',
  'Faisalabad',
  'Gujranwala',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Bahawalpur',
  'Sukkur',
  'Larkana',
  'Nawabshah',
];

const BikeSearch = (role) => {
  // State Definitions
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  const [chassisNumber, setChassisNumber] = useState('');
  const [bikeData, setBikeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [discountType, setDiscountType] = useState('percent'); // 'amount' or 'percent'
  const [discountOffered, setDiscountOffered] = useState('');
  const [cashPaid, setCashPaid] = useState('');
  const [onlinePaid, setOnlinePaid] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [registrationCity, setRegistrationCity] = useState('');
  const [clientIDCardNo, setClientIDCardNo] = useState('');
  const [clientFullName, setClientFullName] = useState('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [profit, setProfit] = useState('');
  const [balance, setBalance] = useState('');
  const [agent, setAgent] = useState('');
  const [agents, setAgents] = useState([]);
  const [agentSelection, setAgentSelection] = useState('saved');
  const [searchNumber, setSearchNumber] = useState('');
  const [warranty, setWarranty] = useState('');
const [issueWarrantyBook, setIssueWarrantyBook] = useState(false);
  const [manualAgentInfo, setManualAgentInfo] = useState({
    name: '',
    cnic: '',
    contactNo: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default to 'cash'

const updateBalance = (method, value) => {
  const selling = parseFloat(sellingPrice) || 0;
  const paidAmount = parseFloat(value) || 0;

  if (method === 'cash') {
    const remainingBalance = selling - paidAmount;
    setBalance(remainingBalance.toFixed(2));
  } else if (method === 'online') {
    const remainingBalance = selling - paidAmount;
    setBalance(remainingBalance.toFixed(2));
  }
};

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualAgentInfo((prevState) => ({ ...prevState, [name]: value }));
  };
  const selectedAgent = agents.find((a) => a.name === agent) || {};
  const handleAgentChange = (e) => {
    setAgent(e.target.value);
    if (agentSelection === 'saved') {
      setManualAgentInfo({ name: '', cnic: '', contactNo: '', address: '' });
    }
  };

  // Helper Functions
  const allFieldsFilled = () => {
    // Check if registration is valid based on condition
    const isRegistrationValid = 
      bikeData?.condition === 'New' || bikeData?.condition === 'new' ||(registrationNo && registrationCity); 
  
    // Ensure at least one payment method is valid
    const isPaymentValid = cashPaid || onlinePaid;
  
    return (
      chassisNumber &&
      sellingPrice &&
      discountOffered &&
      isPaymentValid && // At least one payment method must be valid
      clientIDCardNo &&
      clientFullName &&
      clientPhoneNumber &&
      clientAddress &&
      isRegistrationValid // Use the updated isRegistrationValid logic
    );
  };
  
  

  const handleActionConfirmation = (type) => {
    setActionType(type);
    setConfirmationDialogOpen(true);
  };

  const confirmAction = () => {
    setConfirmationDialogOpen(false);
    if (actionType === 'proceed') {
      handleProceed();

    } else if (actionType === 'credit') {
      setCreditModalOpen(true);
    }
  };

  // Fetch Agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${url}/agent/`);
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(
          data.map((agent) => ({
            name: agent.agentName,
            contact: agent.contactNumber,
            address: agent.address,
            cnic: agent.identificationNumber,
          }))
        );
      } catch (error) {
        setSnackbarMessage('Error fetching agents');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    };
    fetchAgents();
  }, []);

  // Handle Profit and Balance Calculation
  useEffect(() => {
    if (bikeData && sellingPrice) {
      const basePrice = parseFloat(bikeData.purchasePrice) || 0;
      const selling = parseFloat(sellingPrice) || 0;
      const discount = parseFloat(discountOffered) || 0;
  
      // Calculate discount value based on type
      const discountValue =
        discountType === 'percent' ? (selling * discount) / 100 : discount;
  
      // Calculate profit
      const profitValue = selling - basePrice - discountValue;
      setProfit(profitValue.toFixed(2));
    }
  }, [sellingPrice, discountOffered, discountType, bikeData]);

  useEffect(() => {
    if (cashPaid && onlinePaid && sellingPrice) {
      const balanceValue =
        parseFloat(sellingPrice) - parseFloat(cashPaid) - parseFloat(onlinePaid);
      setBalance(balanceValue.toFixed(2));
    }
  }, [cashPaid, onlinePaid, sellingPrice]);
  


  const handleSearch = () => {
    if (!searchNumber) {
      setError('Please provide an identification number.');
      return;
    }
  
    resetFormFields();
    setLoading(true);
    setError('');
    
    fetch(`${url}/bikeinventory/getBikeByChassisNumber/${searchNumber}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.bikes && data.bikes.length > 0) {
          const foundBike = data.bikes[0];
          setBikeData(foundBike);
          
          // Set the appropriate identification number based on what matched
          let idNumber = '';
          switch(foundBike.searchMatchedOn) {
            case 'motorNo':
              idNumber = foundBike.motorNo;
              break;
            case 'frameNo':
              idNumber = foundBike.frameNo;
              break;
            case 'engineNo':
              idNumber = foundBike.engineNo;
              break;
            case 'chassisNumber':
              idNumber = foundBike.chassisNumber;
              break;
            default:
              idNumber = searchNumber;
          }
          setChassisNumber(idNumber);
  
          // Show success message with which field matched
          setSnackbarMessage(`Bike found by ${foundBike.searchMatchedOn}`);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } else {
          setError('No bike found with the provided identification number.');
          setBikeData(null);
          setChassisNumber('');
        }
      })
      .catch((error) => {
        console.error('Error searching bike:', error);
        setError('An error occurred while fetching bike data.');
        setBikeData(null);
        setChassisNumber('');
      })
      .finally(() => setLoading(false));
  };
  


  const handleProceed = async () => {
    try {
      const newSales = {
        agent: agentSelection === 'saved' ? selectedAgent : manualAgentInfo,
        bikeDetails: {
          manufacturer: bikeData?.manufacturer,
          model: bikeData?.model,
          type: bikeData?.type,
          condition: bikeData?.condition,
          mileage: bikeData?.mileage,
          purchasePrice: bikeData?.purchasePrice,
          warranty: bikeData?.warranty || 'N/A',
        warrantyBookIssued: issueWarrantyBook,
          // Add all identification numbers
          ...(bikeData?.type === 'Electric' 
            ? {
                motorNo: bikeData.motorNo,
                frameNo: bikeData.frameNo,
              }
            : {
                engineNo: bikeData.engineNo,
                chassisNumber: bikeData.chassisNumber,
              }
          ),
          // Add additional type-specific details
          ...(bikeData?.type === 'Electric' 
            ? {
                power: bikeData.power,
                range: bikeData.range,
                batteryDetails: bikeData.batteryDetails,
              }
            : {
                cc: bikeData.cc,
                stroke: bikeData.stroke,
              }
          ),
        },
        priceDetails: {
          sellingPrice,
          discountOffered,
          cashPaid,
          onlinePaid,
          profit,
          balance,
        },
        registrationDetails: {
          registrationNo,
          registrationCity,
          client: {
            idCardNo: clientIDCardNo,
            fullName: clientFullName,
            phoneNumber: clientPhoneNumber,
            address: clientAddress,
          },
        },
      
      
      };
  
      
  
      // Make the API request
      const response = await fetch(`${url}/bikeSaleinventory/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSales),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(
          `Failed to save sales data: ${errorDetails.message || response.statusText}`
        );
      }
  
      const responseData = await response.json();
      
  
      setSnackbarMessage('Bike sale recorded successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      generateInvoice(newSales);
  
      // Reset form fields
      resetFormFields();
    } catch (error) {
      console.error("Error while saving sales data:", error);
  
      setSnackbarMessage(error.message);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  // Function to reset form fields
  const resetFormFields = () => {
    setSellingPrice('');
    setDiscountOffered('');
    setDiscountType('percent');
    setCashPaid('');
    setOnlinePaid('');
    setProfit('');
    setBalance('');
    setRegistrationNo('');
    setRegistrationCity('');
    setClientIDCardNo('');
    setClientFullName('');
    setClientPhoneNumber('');
    setClientAddress('');
    setAgent('');
    setManualAgentInfo({
      name: '',
      cnic: '',
      contactNo: '',
      address: '',
    });
  };
  


  const generateInvoice = (selectedBuy) => {
    if (!selectedBuy) return;
  
    const doc = new jsPDF();
    const margin = 15;
    const spacing = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = margin;
  
    const {
      registrationDetails,
      agent,
      bikeDetails,
      priceDetails,
    } = selectedBuy;
  
    // Helper function for page breaks
    const checkPageBreak = () => {
      if (currentY > pageHeight - margin - 20) {
        doc.addPage();
        currentY = margin;
        addHeader();
        addWatermark();
      }
    };
  
    // Header Section
    const addHeader = () => {
      const headerHeight = 40;
      const logoWidth = 50;
      const logoHeight = 25;
  
      doc.setFillColor(0, 100, 0); // Dark green background
      doc.rect(0, 0, pageWidth, headerHeight, "F");
  
      if (logoData) {
        doc.addImage(logoData, "PNG", margin, 5, logoWidth, logoHeight);
      }
  
      const titleFontSize = 24;
      const addressFontSize = 14;
  
      doc.setFont("Bailey", "bold");
      doc.setFontSize(titleFontSize);
      doc.setTextColor(255, 255, 255);
  
      const titleText = "Pakistan Autos";
      const titleX = (pageWidth - doc.getTextWidth(titleText)) / 2;
      doc.text(titleText, titleX, 15);
  
      doc.setFont("Brush", "normal");
      doc.setFontSize(addressFontSize);
      const addressText = "Near Din Plaza, GT Road, Gujranwala";
      const addressX = (pageWidth - doc.getTextWidth(addressText)) / 2;
      doc.text(addressText, addressX, 25);
  
      currentY = headerHeight + 10;
    };
  
    const addFooter = () => {
      const footerHeight = 20;
      doc.setFillColor(0, 100, 0);
      doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");
  
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("Bailey", "bold");
      doc.setFontSize(16);
  
      doc.text("Pakistan Autos", margin, pageHeight - 8);
  
      const ownerName = "Owner: Afaq Atiq";
      const ownerX = (pageWidth - doc.getTextWidth(ownerName)) / 2;
      doc.text(ownerName, ownerX, pageHeight - 8);
  
      const contactText = "Contact: 0317-9901457";
      const contactX = pageWidth - margin - doc.getTextWidth(contactText);
      doc.text(contactText, contactX, pageHeight - 8);
    };
  
    const addSectionHeader = (title) => {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin, currentY);
      currentY += spacing;
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += spacing;
    };
  
    const addWatermark = () => {
      doc.setFontSize(60);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(200, 200, 200);
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.text("PAKISTAN AUTOS", pageWidth / 2, pageHeight / 2, {
        align: "center",
        angle: -45,
      });
      doc.restoreGraphicsState();
    };
  
    const addField = (label, value, xOffset = 0) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50);
      doc.text(`${label} ${value}`, margin + xOffset, currentY);
    };
  
    addHeader();
    addWatermark();
  
    const invoiceNumber = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB");
    const formattedTime = now.toLocaleTimeString("en-US", { hour12: false });
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Payment Invoice", pageWidth / 2, currentY, { align: "center" });
    currentY += spacing;
  
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoiceNumber}`, margin, currentY);
    doc.text(`Date: ${formattedDate} | Time: ${formattedTime}`, pageWidth - margin, currentY, { align: "right" });
    currentY += spacing * 2;
    checkPageBreak();
  
   // Client Details Section
   addSectionHeader("Client Details");
   addField("Name:", registrationDetails?.client?.fullName || "N/A");
   addField("CNIC:", registrationDetails?.client?.idCardNo || "N/A", 90);
   currentY += spacing;

   addField("Contact No:", registrationDetails?.client?.phoneNumber || "N/A", 0);
   addField("Address:", registrationDetails?.client?.address || "N/A", 90);
   currentY += spacing * 2;

   checkPageBreak();

 
   // Agent Details
   addSectionHeader("Agent Details");
   addField("Name:", agent?.name || "N/A");
   addField("CNIC:", agent?.cnic || "N/A", 90);
   currentY += spacing;
   addField("Contact:", agent?.contactNo || "N/A",0);
   addField("Address:", agent?.address || "N/A", 90);
   currentY += spacing * 2;
   checkPageBreak();
 
   // Updated Bike Details section in the invoice
addSectionHeader("Bike Details");
addField("Manufacturer:", bikeDetails?.manufacturer || "N/A");
addField("Model:", bikeDetails?.model || "N/A", 90);
currentY += spacing;
addField("Type:", bikeDetails?.type || "N/A", 0);

// Conditional rendering of identification numbers based on bike type
if (bikeDetails?.type === 'Electric') {
  addField("Motor Number:", bikeDetails?.motorNo || "N/A", 90);
  currentY += spacing;
  addField("Frame Number:", bikeDetails?.frameNo || "N/A", 0);
} else {
  addField("Engine Number:", bikeDetails?.engineNo || "N/A", 90);
  currentY += spacing;
  addField("Chassis Number:", bikeDetails?.chassisNumber || "N/A", 0);
}

currentY += spacing;
addField("Condition:", bikeDetails?.condition || "N/A", 0);
addField("Mileage:", bikeDetails?.mileage || "N/A", 90);
currentY += spacing * 2;

// Add type-specific details
if (bikeDetails?.type === 'Electric') {
  addField("Power:", `${bikeDetails?.power || 'N/A'} W`, 0);
  addField("Range:", `${bikeDetails?.range || 'N/A'} km`, 90);
  currentY += spacing;
  addField("Battery Capacity:", `${bikeDetails?.batteryDetails?.capacity || 'N/A'} Ah`, 0);
} else {
  addField("CC:", bikeDetails?.cc || "N/A", 0);
  addField("Stroke:", bikeDetails?.stroke || "N/A", 90);
}

currentY += spacing * 2;
checkPageBreak();

// Add Warranty Information
addSectionHeader("Warranty Information");
addField("Warranty Details:", bikeDetails?.warranty || "N/A", 0);
currentY += spacing;
addField("Warranty Book Issued:", bikeDetails?.warrantyBookIssued ? "Yes" : "No", 0);
currentY += spacing ;
checkPageBreak();
 
   // Payment Details
   addSectionHeader("Payment Details");
   addField("Selling Price:", `₨${priceDetails?.sellingPrice?.toLocaleString() || "N/A"}`);
   addField("Cash Paid:", `₨${priceDetails?.cashPaid?.toLocaleString() || "N/A"}`, 90);
   currentY += spacing;

   addField("Online Paid:", `₨${priceDetails?.onlinePaid?.toLocaleString() || "N/A"}`, 0);
   addField("Discount Offered:", `₨${priceDetails?.discountOffered?.toLocaleString() || "N/A"}`,90);
   currentY += spacing;

   addField("Balance:", `₨${priceDetails?.balance?.toLocaleString() || "N/A"}`, 0);
 
   currentY += spacing * 2;
   checkPageBreak();

   // Payment History Section
 if (selectedBuy.paymentsReceived && selectedBuy.paymentsReceived.length > 0) {
   addSectionHeader("Payment History");
   selectedBuy.paymentsReceived.forEach((payment, index) => {
       addField("Amount:", `₨${payment.paymentAmount.toLocaleString()}`);
       addField("Date:", payment.paymentDate, 80);
       addField("Mode:", payment.paymentMode, 160);
       currentY += spacing;

       checkPageBreak();

       if (index < selectedBuy.paymentsReceived.length - 1) {
           doc.setDrawColor(220);
           doc.setLineWidth(0.3);
           doc.line(margin, currentY, pageWidth - margin, currentY);
           currentY += spacing / 2;
       }
   });
}
  
    addFooter();
    doc.save(`Invoice_${registrationDetails?.client?.fullName || "Client"}.pdf`);
  };
  


  return (
    <>
      <Box sx={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
        {/* Header */}
        <Typography variant="h4" sx={{ 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center',
          color: '#388e3c',
          fontWeight: 'bold' 
        }}>
          <DirectionsBike sx={{ marginRight: '10px', fontSize: 32 }} />
          Bike Inventory Search
        </Typography>
  
        {/* Search Section */}
        <Paper elevation={3} sx={{ 
          padding: '20px', 
          marginBottom: '20px',
          backgroundColor: '#f8faf8'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                label="Search Bike"
                variant="outlined"
                fullWidth
                value={searchNumber}
                onChange={(e) => setSearchNumber(e.target.value)}
                helperText="Enter any identification number (Motor No, Frame No, Engine No, or Chassis No)"
                sx={{ backgroundColor: '#ffffff', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading}
                fullWidth
                startIcon={<Search />}
                sx={{
                  height: '56px',
                  borderRadius: '8px',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'transform 0.2s'
                  }
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </Paper>
  
        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress color="primary" />
          </Box>
        )}
  
        {error && (
          <Typography 
            color="error" 
            sx={{ 
              textAlign: 'center', 
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#ffebee',
              borderRadius: '8px' 
            }}
          >
            {error}
          </Typography>
        )}
  
        {/* Bike Details Section */}
        {bikeData && (
          <Grid container spacing={3}>
            {/* Bike Details Card */}
            <Grid item xs={12}>
              <Card sx={{
                boxShadow: 4,
                borderRadius: 3,
                padding: 3,
                background: '#f1f8e9',
                '&:hover': { boxShadow: 6 }
              }}>
                <CardContent>
                  <Typography variant="h5" sx={{ 
                    color: '#388e3c', 
                    fontWeight: 'bold', 
                    textAlign: 'center', 
                    marginBottom: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <DirectionsBike sx={{ fontSize: 30, marginRight: 1 }} />
                    Bike Details
                  </Typography>
                  <Divider sx={{ marginBottom: 3 }} />
  
                  <Grid container spacing={3}>
                    {/* First Row */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Manufacturer"
                        value={bikeData.manufacturer}
                        fullWidth
                        disabled
                        sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Model"
                        value={bikeData.model}
                        fullWidth
                        disabled
                        sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Model Year"
                        value={bikeData.modelYear}
                        fullWidth
                        disabled
                        sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                      />
                    </Grid>
  
  {/* Second Row */}
  <Grid item xs={12} md={4}>
                    <TextField
                      label="Type"
                      value={bikeData.type}
                      fullWidth
                      disabled
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Condition"
                      value={bikeData.condition}
                      fullWidth
                      disabled
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Mileage"
                      value={bikeData.mileage}
                      fullWidth
                      disabled
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>

                  {/* Identification Numbers - Conditional Rendering */}
                  {bikeData.type === 'Electric' ? (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Motor Number"
                          value={bikeData.motorNo || 'N/A'}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Frame Number"
                          value={bikeData.frameNo || 'N/A'}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Engine Number"
                          value={bikeData.engineNo || 'N/A'}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Chassis Number"
                          value={bikeData.chassisNumber || 'N/A'}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Additional Details based on Type */}
                  {bikeData.type === 'Electric' ? (
                    <>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Power"
                          value={`${bikeData.power || 'N/A'} W`}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Range"
                          value={`${bikeData.range || 'N/A'} km`}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Battery Capacity"
                          value={`${bikeData.batteryDetails?.capacity || 'N/A'} Ah`}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="CC"
                          value={bikeData.cc || 'N/A'}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Stroke"
                          value={bikeData.stroke || 'N/A'}
                          fullWidth
                          disabled
                          sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Purchase Price */}
                  {role.role !== 'manager' && (
                  <Grid item xs={12}>
                    <TextField
                      label="Purchase Price"
                      value={`₨ ${bikeData.purchasePrice}`}
                      fullWidth
                      disabled
                      sx={{ 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: 2,
                        '& input': {
                          fontWeight: 'bold',
                          color: '#1b5e20'
                        }
                      }}
                    />
                  </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
{/* Price & Profit Details Card */}
<Grid item xs={12}>
            <Card sx={{
              boxShadow: 4,
              borderRadius: 3,
              padding: 3,
              background: '#f1f8e9',
              '&:hover': { boxShadow: 6 }
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ 
                  color: '#388e3c', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoney sx={{ fontSize: 30, marginRight: 1 }} />
                  Price & Profit Details
                </Typography>
                <Divider sx={{ marginBottom: 3 }} />

                <FormControl component="fieldset" sx={{ width: '100%', marginBottom: 2 }}>
                  <RadioGroup
                    row
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <FormControlLabel
                      value="percent"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#388e3c' } }} />}
                      label="Percent"
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    />
                    <FormControlLabel
                      value="rupee"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#388e3c' } }} />}
                      label="Rupee"
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    />
                  </RadioGroup>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Discount Offered"
                      value={discountOffered}
                      onChange={(e) => setDiscountOffered(e.target.value)}
                      fullWidth
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Selling Price"
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(e.target.value)}
                      fullWidth
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  {role.role !== 'manager' && (
                  <Grid item xs={12}>
                    <TextField
                      label="Profit"
                      value={`₨ ${profit}`}
                      fullWidth
                      disabled
                      sx={{ 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: 2,
                        '& input': {
                          color: '#1b5e20',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Registration Details Card */}
          <Grid item xs={12}>
            <Card sx={{
              boxShadow: 4,
              borderRadius: 3,
              padding: 3,
              background: '#f1f8e9',
              '&:hover': { boxShadow: 6 }
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ 
                  color: '#388e3c', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Assignment sx={{ fontSize: 30, marginRight: 1 }} />
                  Registration Details
                </Typography>
                <Divider sx={{ marginBottom: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Registration No"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value)}
                      fullWidth
                      disabled={bikeData?.condition === 'New' || bikeData?.condition === 'new'}
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Registration City"
                      value={registrationCity}
                      onChange={(e) => setRegistrationCity(e.target.value)}
                      select
                      fullWidth
                      disabled={bikeData?.condition === 'New' || bikeData?.condition === 'new'}
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    >
                      {cities.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client ID Card No"
                      value={clientIDCardNo}
                      onChange={(e) => setClientIDCardNo(e.target.value)}
                      fullWidth
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client Full Name"
                      value={clientFullName}
                      onChange={(e) => setClientFullName(e.target.value)}
                      fullWidth
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client Phone Number"
                      value={clientPhoneNumber}
                      onChange={(e) => setClientPhoneNumber(e.target.value)}
                      fullWidth
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Client Address"
                      value={clientAddress}
                      onChange={(e) => setClientAddress(e.target.value)}
                      fullWidth
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

{/* Payment Details Card */}
<Grid item xs={12}>
            <Card sx={{
              boxShadow: 4,
              borderRadius: 3,
              padding: 3,
              background: '#f1f8e9',
              '&:hover': { boxShadow: 6 }
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ 
                  color: '#388e3c', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoney sx={{ fontSize: 30, marginRight: 1 }} />
                  Payment Details
                </Typography>
                <Divider sx={{ marginBottom: 3 }} />

                <FormControl component="fieldset" sx={{ width: '100%', marginBottom: 2 }}>
                  <RadioGroup
                    row
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="cash"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#388e3c' } }} />}
                      label="Pay by Cash"
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    />
                    <FormControlLabel
                      value="online"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#388e3c' } }} />}
                      label="Pay Online"
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    />
                  </RadioGroup>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Cash Paid"
                      value={cashPaid}
                      onChange={(e) => {
                        setCashPaid(e.target.value);
                        updateBalance('cash', e.target.value);
                      }}
                      fullWidth
                      disabled={paymentMethod !== 'cash'}
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Online Paid"
                      value={onlinePaid}
                      onChange={(e) => {
                        setOnlinePaid(e.target.value);
                        updateBalance('online', e.target.value);
                      }}
                      fullWidth
                      disabled={paymentMethod !== 'online'}
                      sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Remaining Balance"
                      value={balance}
                      fullWidth
                      disabled
                      sx={{ 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: 2,
                        '& input': {
                          color: '#1b5e20',
                          fontWeight: 'bold'
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* Warranty Claims Card */}
<Grid item xs={12}>
  <Card sx={{
    boxShadow: 4,
    borderRadius: 3,
    padding: 3,
    background: '#f1f8e9',
    '&:hover': { boxShadow: 6 }
  }}>
    <CardContent>
      <Typography variant="h5" sx={{ 
        color: '#388e3c', 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginBottom: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Build sx={{ fontSize: 30, marginRight: 1 }} />
        Warranty Claims
      </Typography>
      <Divider sx={{ marginBottom: 3 }} />

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Warranty Details"
            value={bikeData?.warranty || 'N/A'}
            multiline
            rows={3}
            fullWidth
            disabled
            sx={{ backgroundColor: '#e8f5e9', borderRadius: 2, marginBottom: 2 }}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={issueWarrantyBook}
                onChange={(e) => setIssueWarrantyBook(e.target.checked)}
                sx={{
                  '&.Mui-checked': {
                    color: '#388e3c',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ color: '#1b5e20', fontWeight: 'bold' }}>
                Issue Warranty/Claim Book
              </Typography>
            }
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>

          {/* Agent Information Card */}
          <Grid item xs={12}>
            <Card sx={{
              boxShadow: 4,
              borderRadius: 3,
              padding: 3,
              background: '#f1f8e9',
              '&:hover': { boxShadow: 6 }
            }}>
              <CardContent>
                <Typography variant="h5" sx={{ 
                  color: '#388e3c', 
                  fontWeight: 'bold', 
                  textAlign: 'center', 
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Person sx={{ fontSize: 30, marginRight: 1 }} />
                  Agent Information
                </Typography>
                <Divider sx={{ marginBottom: 3 }} />

                <FormControl component="fieldset" sx={{ width: '100%', marginBottom: 2 }}>
                  <RadioGroup
                    row
                    value={agentSelection}
                    onChange={(e) => {
                      setAgentSelection(e.target.value);
                      if (e.target.value === 'manual') {
                        setAgent('');
                      }
                    }}
                  >
                    <FormControlLabel
                      value="saved"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#388e3c' } }} />}
                      label="Saved"
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    />
                    <FormControlLabel
                      value="manual"
                      control={<Radio sx={{ '&.Mui-checked': { color: '#388e3c' } }} />}
                      label="Manual"
                      sx={{ color: '#388e3c', fontWeight: 'bold' }}
                    />
                  </RadioGroup>
                </FormControl>
{/* Saved Agent Selection */}
{agentSelection === 'saved' && (
                  <FormControl fullWidth sx={{ marginTop: '10px' }}>
                    <InputLabel sx={{ color: '#1b5e20' }}>Agent</InputLabel>
                    <Select
                      label="Agent"
                      name="agent"
                      value={agent}
                      onChange={handleAgentChange}
                      sx={{
                        backgroundColor: '#e8f5e9',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#c8e6c9' },
                      }}
                    >
                      {agents.map((agent) => (
                        <MenuItem
                          key={agent.name}
                          value={agent.name}
                          sx={{ '&:hover': { backgroundColor: '#a5d6a7' } }}
                        >
                          {agent.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {/* Manual Agent Information */}
                {agentSelection === 'manual' && (
                  <Box sx={{
                    marginTop: '10px',
                    backgroundColor: '#e8f5e9',
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Name"
                          name="name"
                          value={manualAgentInfo.name}
                          onChange={handleManualChange}
                          fullWidth
                          sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="CNIC"
                          name="cnic"
                          value={manualAgentInfo.cnic}
                          onChange={handleManualChange}
                          fullWidth
                          sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Contact No"
                          name="contactNo"
                          value={manualAgentInfo.contactNo}
                          onChange={handleManualChange}
                          fullWidth
                          sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Address"
                          name="address"
                          value={manualAgentInfo.address}
                          onChange={handleManualChange}
                          fullWidth
                          sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: 2,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {/* Display Selected Agent Details */}
                {agentSelection === 'saved' && agent && (
                  <Box sx={{
                    marginTop: '10px',
                    backgroundColor: '#e8f5e9',
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 2,
                  }}>
                    <Typography variant="body1" sx={{ color: '#1b5e20', fontWeight: 'bold', marginBottom: 1 }}>
                      <strong>CNIC:</strong> {selectedAgent.cnic}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1b5e20', fontWeight: 'bold', marginBottom: 1 }}>
                      <strong>Contact No:</strong> {selectedAgent.contact}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#1b5e20', fontWeight: 'bold', marginBottom: 1 }}>
                      <strong>Address:</strong> {selectedAgent.address}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              marginTop: 3,
              marginBottom: 3,
            }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => handleActionConfirmation('proceed')}
                disabled={!allFieldsFilled()}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  borderRadius: '50px',
                  padding: '12px 32px',
                  fontSize: '1.1rem',
                  minWidth: '200px',
                  backgroundColor: '#388e3c',
                  '&:hover': {
                    backgroundColor: '#2e7d32',
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                Proceed Now
              </Button>

              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => handleActionConfirmation('credit')}
                disabled={!allFieldsFilled()}
                sx={{
                  borderRadius: '50px',
                  padding: '12px 32px',
                  fontSize: '1.1rem',
                  minWidth: '200px',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                Credit Sale
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmationDialogOpen}
        onClose={() => setConfirmationDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ color: '#388e3c' }}>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {actionType === 'proceed' ? 'proceed now' : 'perform a credit sale'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmationDialogOpen(false)}
            sx={{ color: '#757575' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmAction} 
            variant="contained" 
            color="primary"
            sx={{
              backgroundColor: '#388e3c',
              '&:hover': { backgroundColor: '#2e7d32' }
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Credit Modal */}
      <BikeCreditModal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        bikeData={bikeData}
        agent={agentSelection === 'saved' ? selectedAgent : manualAgentInfo}
        clientDetails={{
          fullName: clientFullName,
          idCardNo: clientIDCardNo,
          phoneNumber: clientPhoneNumber,
          address: clientAddress,
          registrationCity,
          registrationNo
        }}
        priceDetails={{
          sellingPrice,
          discountOffered,
          cashPaid,
          onlinePaid,
          profit,
          balance
        }}
      />
    </Box>
  </>
);


};

export default BikeSearch;
