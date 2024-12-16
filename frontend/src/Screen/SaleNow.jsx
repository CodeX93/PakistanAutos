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

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Search, DirectionsBike, AttachMoney, Assignment, Person } from '@mui/icons-material';
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

const BikeSearch = () => {
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
    if (!chassisNumber) {
      setError('Please provide a chassis number.');
      return;
    }
  
    // Reset fields before fetching new bike data
    resetFormFields();
  
    setLoading(true);
    setError('');
    fetch(`${url}/bikeinventory/getBikeByChassisNumber/${chassisNumber}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.bikes && data.bikes.length > 0) {
          setBikeData(data.bikes[0]);
        } else {
          setError('Bike not found.');
          setBikeData(null);
        }
      })
      .catch(() => setError('An error occurred while fetching bike data.'))
      .finally(() => setLoading(false));
  };
  


  const handleProceed = async () => {
    try {
      // Construct the sales data
      const newSales = {
        agent: agentSelection === 'saved' ? selectedAgent : manualAgentInfo,
        bikeDetails: {
          manufacturer: bikeData?.manufacturer,
          model: bikeData?.model,
          type: bikeData?.type,
          condition: bikeData?.condition,
          mileage: bikeData?.mileage,
          purchasePrice: bikeData?.purchasePrice,
          chassisNumber,
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
  
      console.log("Sending sales data:", newSales);
  
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
      console.log("Sales data saved successfully:", responseData);
  
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
 
   // Bike Details
   addSectionHeader("Bike Details");
   addField("Manufacturer:", bikeDetails?.manufacturer || "N/A");
   addField("Model:", bikeDetails?.model || "N/A", 90);
   currentY += spacing;
   addField("Type:", bikeDetails?.type || "N/A", 0);
   addField("Chassis Number:", bikeDetails?.chassisNumber || "N/A",90);
   currentY += spacing;
   addField("Condition:", bikeDetails?.condition || "N/A", 0);
   addField("Mileage:", bikeDetails?.mileage || "N/A", 90);
   currentY += spacing * 2;
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
    <Box sx={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <Typography variant="h4" sx={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <DirectionsBike sx={{ marginRight: '10px' }} />
        Bike Inventory Search
      </Typography>

      <Paper elevation={3} sx={{ padding: '20px', marginBottom: '20px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              label="Chassis Number"
              variant="outlined"
              fullWidth
              value={chassisNumber}
              onChange={(e) => setChassisNumber(e.target.value)}
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
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      {error && <Typography color="error" sx={{ textAlign: 'center', marginBottom: '20px' }}>{error}</Typography>}

      {bikeData && (
  <Grid container spacing={4}>
    {/* Bike Details */}
    <Grid item xs={12} md={12}>
      <Card
        sx={{
          boxShadow: 4,
          borderRadius: 3,
          padding: 3,
          background: '#f1f8e9',
          '&:hover': { boxShadow: 6 },
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}
          >
            <DirectionsBike sx={{ fontSize: 30, marginRight: 1 }} />
            Bike Details
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Manufacturer"
                value={bikeData.manufacturer}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Model"
                value={bikeData.model}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Type"
                value={bikeData.type}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Condition"
                value={bikeData.condition}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Mileage"
                value={bikeData.mileage}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Purchase Price"
                value={`₨ ${bikeData.purchasePrice}`}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    {/* Price & Profit Details */}
    <Grid item xs={12} md={12}>
      <Card
        sx={{
          boxShadow: 4,
          borderRadius: 3,
          padding: 3,
          background: '#f1f8e9',
          '&:hover': { boxShadow: 6 },
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}
          >
            <AttachMoney sx={{ fontSize: 30, marginRight: 1 }} />
            Price & Profit Details
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)} // Update discount type
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
            <Grid item xs={6}>
              <TextField
                label="Discount Offered"
                value={discountOffered}
                onChange={(e) => setDiscountOffered(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Selling Price"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Profit"
                value={`₨ ${profit}`}
                fullWidth
                disabled
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>

    {/* Registration Details */}
    <Grid item xs={12}>
      <Card
        sx={{
          boxShadow: 4,
          borderRadius: 3,
          padding: 3,
          background: '#f1f8e9',
          '&:hover': { boxShadow: 6 },
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}
          >
            <Assignment sx={{ fontSize: 30, marginRight: 1 }} />
            Registration Details
          </Typography>
          <Divider sx={{ marginBottom: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Registration No"
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                fullWidth
                disabled={bikeData?.condition === 'New' || bikeData?.condition === 'new'}
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Registration City"
                value={registrationCity}
                onChange={(e) => setRegistrationCity(e.target.value)}
                fullWidth
                select
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
            <Grid item xs={6}>
              <TextField
                label="Client ID Card No"
                value={clientIDCardNo}
                onChange={(e) => setClientIDCardNo(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Client Full Name"
                value={clientFullName}
                onChange={(e) => setClientFullName(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Client Phone Number"
                value={clientPhoneNumber}
                onChange={(e) => setClientPhoneNumber(e.target.value)}
                fullWidth
                sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
              />
            </Grid>
            <Grid item xs={6}>
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

    {/* Payment Details */}
    <Grid item xs={12}>
  <Card
    sx={{
      boxShadow: 4,
      borderRadius: 3,
      padding: 3,
      background: '#f1f8e9',
      '&:hover': { boxShadow: 6 },
    }}
  >
    <CardContent>
      <Typography
        variant="h5"
        sx={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}
      >
        <AttachMoney sx={{ fontSize: 30, marginRight: 1 }} />
        Payment Details
      </Typography>
      <Divider sx={{ marginBottom: 3 }} />
      <FormControl component="fieldset">
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
        {/* Cash Paid */}
        <Grid item xs={6}>
          <TextField
            label="Cash Paid"
            value={cashPaid}
            onChange={(e) => {
              setCashPaid(e.target.value);
              updateBalance('cash', e.target.value);
            }}
            fullWidth
            disabled={paymentMethod !== 'cash'} // Disable if not 'cash' payment method
            sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
          />
        </Grid>

        {/* Online Paid */}
        <Grid item xs={6}>
          <TextField
            label="Online Paid"
            value={onlinePaid}
            onChange={(e) => {
              setOnlinePaid(e.target.value);
              updateBalance('online', e.target.value);
            }}
            fullWidth
            disabled={paymentMethod !== 'online'} // Disable if not 'online' payment method
            sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
          />
        </Grid>

        {/* Balance */}
        <Grid item xs={12}>
          <TextField
            label="Remaining Balance"
            value={balance}
            fullWidth
            disabled
            sx={{ backgroundColor: '#e8f5e9', borderRadius: 2 }}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>

    <Grid item xs={12}>
  <Card
    sx={{
      boxShadow: 4,
      borderRadius: 3,
      padding: 3,
      background: '#f1f8e9',
      '&:hover': { boxShadow: 6 },
    }}
  >
    <CardContent>
      <Typography
        variant="h5"
        sx={{ color: '#388e3c', fontWeight: 'bold', textAlign: 'center', marginBottom: 2 }}

      >
        <Person sx={{ fontSize: 30, marginRight: 1 }} />
        Agent Information
      </Typography>
      <Divider sx={{ marginBottom: 3 }} />

      <FormControl component="fieldset">
        <RadioGroup
          row
          value={agentSelection}
          onChange={(e) => {
            setAgentSelection(e.target.value);
            if (e.target.value === 'manual') {
              setAgent(''); // Reset selected agent when switching to manual
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
          <InputLabel  sx={{ color: '#1b5e20' }}>Agent</InputLabel>
          <Select
          label='Agent'
          name='agent'
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
        <Box
          sx={{
            marginTop: '10px',
            backgroundColor: '#e8f5e9',
            padding: 2,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <TextField
            label="Name"
            name="name"
            value={manualAgentInfo.name}
            onChange={handleManualChange}
            fullWidth
            sx={{
              marginBottom: '10px',
              backgroundColor: '#ffffff',
              borderRadius: 2,
            }}
          />
          <TextField
            label="CNIC"
            name="cnic"
            value={manualAgentInfo.cnic}
            onChange={handleManualChange}
            fullWidth
            sx={{
              marginBottom: '10px',
              backgroundColor: '#ffffff',
              borderRadius: 2,
            }}
          />
          <TextField
            label="Contact No"
            name="contactNo"
            value={manualAgentInfo.contactNo}
            onChange={handleManualChange}
            fullWidth
            sx={{
              marginBottom: '10px',
              backgroundColor: '#ffffff',
              borderRadius: 2,
            }}
          />
          <TextField
            label="Address"
            name="address"
            value={manualAgentInfo.address}
            onChange={handleManualChange}
            fullWidth
            sx={{
              marginBottom: '10px',
              backgroundColor: '#ffffff',
              borderRadius: 2,
            }}
          />
        </Box>
      )}

      {/* Display Selected Agent Details (if saved is selected) */}
      {agentSelection === 'saved' && agent && (
        <Box
          sx={{
            marginTop: '10px',
            backgroundColor: '#e8f5e9',
            padding: 2,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ color: '#1b5e20', fontWeight: 'bold', marginBottom: '5px' }}
          >
            <strong>CNIC:</strong> {selectedAgent.cnic}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#1b5e20', fontWeight: 'bold', marginBottom: '5px' }}
          >
            <strong>Contact No:</strong> {selectedAgent.contact}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#1b5e20', fontWeight: 'bold', marginBottom: '5px' }}
          >
            <strong>Address:</strong> {selectedAgent.address}
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
</Grid>

    {/* Action Buttons */}
    <Grid item xs={12}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-evenly',
          marginTop: 3,
          marginBottom: 3,
        }}
      >
        {/* Proceed Now Button */}
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{
            borderRadius: '50px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
          }}
          endIcon={<ArrowForwardIcon />}
          onClick={() => handleActionConfirmation('proceed')}
          disabled={!allFieldsFilled()} 
        >
          Proceed Now
        </Button>

        {/* Credit Sale Button */}
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            borderRadius: '50px',
            padding: '10px 20px',
          }}
          onClick={() => handleActionConfirmation('credit')}
          disabled={!allFieldsFilled()} 
        >
          Credit Sale
        </Button>
      </Box>


  {/* Confirmation Dialog */}
  <Dialog
    open={confirmationDialogOpen}
    onClose={() => setConfirmationDialogOpen(false)}
  >
    <DialogTitle>Confirm Action</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Are you sure you want to{' '}
        {actionType === 'proceed' ? 'Proceed Now' : 'perform a Credit Sale'}?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setConfirmationDialogOpen(false)} color="primary">
        Cancel
      </Button>
      <Button onClick={confirmAction} color="primary" autoFocus>
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
</Grid>

  </Grid>
)}
</Box>

    <Snackbar
    open={snackbarOpen}
    autoHideDuration={6000}
    onClose={() => setSnackbarOpen(false)}
>
    <Alert
        onClose={() => setSnackbarOpen(false)}
        severity={snackbarSeverity}
        sx={{ width: '100%' }}
    >
        {snackbarMessage}
    </Alert>
</Snackbar>

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


    </>
  );
};

export default BikeSearch;
