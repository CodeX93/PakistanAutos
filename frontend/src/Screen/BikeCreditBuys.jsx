import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Grid,
  Divider,useTheme,
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  Info as InfoIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';


// Utility function for date formatting
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};


// Utility function for currency formatting
const formatCurrency = (amount) => {
  return `Rs. ${parseFloat(amount)?.toFixed(2) || '0.00'}`;
};

// Info Modal Component
const BikeDetailsModal = ({ buy }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton 
        size="small" 
        onClick={() => setOpen(true)}
        color="primary"
      >
        <InfoIcon />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            position: "relative",
          }}
        >
          Credit Buy Details
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              color: "white",
              "&:hover": {
                color: "red",
                transform: "scale(1.1)",
                transition: "transform 0.2s ease-in-out",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ padding: 3 }}>
          <Grid container spacing={3} justifyContent="center">
            
            {/* Client Information */}
            <Grid item xs={12} md={10}>
            <Card
                sx={{
                  marginTop:3,
                  padding: 3,
                  boxShadow: 3,
                  borderRadius: 2,
                  background: "#f5f5f5",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                >
                  Client Information
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />
                <Grid container spacing={2}>
                  {[
                    { label: "Name", value: buy.clientDetails?.name || "N/A" },
                    { label: "CNIC", value: buy.clientDetails?.cnic || "N/A" },
                    { label: "Contact", value: buy.clientDetails?.contactNo || "N/A" },
                    { label: "Address", value: buy.clientDetails?.address || "N/A" },
                  ].map((field, index) => (
                    <Grid item xs={6} key={index}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {field.label}
                      </Typography>
                      <Typography>{field.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Bike Details */}
            <Grid item xs={12} md={10}>
            <Card
                sx={{
                  padding: 3,
                  boxShadow: 3,
                  borderRadius: 2,
                  background: "#f5f5f5",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                >
                  Bike Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />
                <Grid container spacing={2}>
                  {[
                    { label: "Manufacturer", value: buy.bikeDetails?.manufacturer || "N/A" },
                    { label: "Model", value: buy.bikeDetails?.model || "N/A" },
                    { label: "Type", value: buy.bikeDetails?.type || "N/A" },
                    { label: "Condition", value: buy.bikeDetails?.condition || "N/A" },
                    { label: "Chassis Number", value: buy.bikeDetails?.chassisNumber || "N/A" },
                    { label: "Purchase Price", value: formatCurrency(buy.bikeDetails?.purchasePrice) },
                  ].map((field, index) => (
                    <Grid item xs={6} key={index}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {field.label}
                      </Typography>
                      <Typography>{field.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Registration Details */}
            <Grid item xs={12} md={10}>
            <Card
                sx={{
                  padding: 3,
                  boxShadow: 3,
                  borderRadius: 2,
                  background: "#f5f5f5",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                >
                  Registration Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />
                <Grid container spacing={2}>
                  {[
                    { label: "Registration Number", value: buy.registrationDetails?.registrationNo || "N/A" },
                    { label: "Registration City", value: buy.registrationDetails?.registrationCity || "N/A" },
                  ].map((field, index) => (
                    <Grid item xs={6} key={index}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {field.label}
                      </Typography>
                      <Typography>{field.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Financial Details */}
            <Grid item xs={12} md={10}>
            <Card
                sx={{
                  padding: 3,
                  boxShadow: 3,
                  borderRadius: 2,
                  background: "#f5f5f5",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                >
                  Financial Details
                </Typography>
                <Divider sx={{ marginBottom: "10px" }} />
                <Grid container spacing={2}>
                  {[
                    { label: "Selling Price", value: formatCurrency(buy.priceDetails?.sellingPrice) },
                    { label: "Pending Balance", value: formatCurrency(buy.pendingBalance) },
                    { label: "Cash Paid", value: formatCurrency(buy.priceDetails?.cashPaid) },
                    { label: "Online Paid", value: formatCurrency(buy.priceDetails?.onlinePaid) },
                    { label: "Promised Date", value: formatDate(buy.promisedDate) },
                  ].map((field, index) => (
                    <Grid item xs={6} key={index}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {field.label}
                      </Typography>
                      <Typography>{field.value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </Grid>

            {/* Payment History */}
            {buy.paymentsReceived?.length > 0 && (
              <Grid item xs={12} md={10}>
                <Card
                  sx={{
                    padding: 3,
                    boxShadow: 3,
                    borderRadius: 2,
                    background: "#f5f5f5",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#388e3c", fontWeight: "bold", textAlign: "center" }}
                  >
                    Payment History
                  </Typography>
                  <Divider sx={{ marginBottom: "10px" }} />
                  {buy.paymentsReceived.map((payment, index) => (
                    <Box key={index}>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Amount
                          </Typography>
                          <Typography>{formatCurrency(payment.paymentAmount)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Date
                          </Typography>
                          <Typography>{formatDate(payment.paymentDate)}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="subtitle2" color="textSecondary">
                            Mode
                          </Typography>
                          <Typography>{payment.paymentMode}</Typography>
                        </Grid>
                      </Grid>
                      {index < buy.paymentsReceived.length - 1 && <Divider sx={{ my: 2 }} />}
                    </Box>
                  ))}
                </Card>
              </Grid>
            )}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

const PaymentModal = ({ open, onClose, selectedBuy, onSubmit }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [updatedPendingBalance, setUpdatedPendingBalance] = useState(
    selectedBuy?.pendingBalance || 0
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const paymentModes = ["Cash", "Cheque", "Online"];


  useEffect(() => {
    if (selectedBuy && open) {
      // Initialize paymentAmount to pendingBalance when the modal opens
      setPaymentAmount(selectedBuy.pendingBalance || "");
      setUpdatedPendingBalance(selectedBuy.pendingBalance || 0);
    }
  }, [selectedBuy, open]);

  const handleSubmit = () => {
    onSubmit({
      paymentAmount: Number(paymentAmount),
      paymentDate,
      paymentMode,
    });

    // Generate invoice after successful payment
    generateInvoice();
    setIsConfirmDialogOpen(false); // Close the confirmation dialog
  };
  const generateInvoice = () => {
    if (!selectedBuy) return;

    const doc = new jsPDF();
    const margin = 15;
    const spacing = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = margin;

    // Helper function for page breaks
    const checkPageBreak = () => {
        if (currentY > pageHeight - margin - 20) {
            doc.addPage();
            currentY = margin;
            addHeader();
            addWatermark();
        }
    };
    const addHeader = () => {
      const headerHeight = 40; // Adjust for header height
      const logoWidth = 50; // Logo width
      const logoHeight = 25; // Logo height
  
      // Add background color
      doc.setFillColor(0, 100, 0); // Dark green
      doc.rect(0, 0, pageWidth, headerHeight, "F");
  
      // Add the logo
      if (logoData) {
          doc.addImage(logoData, "PNG", margin, 5, logoWidth, logoHeight);
      }
  
      // Center-align "Pakistan Autos" and the address
      const titleFontSize = 24;
      const addressFontSize = 14;
  
      doc.setFont("Bailey", "bold");
      doc.setFontSize(titleFontSize); // Set font size for title
      doc.setTextColor(255, 255, 255); // White text
  
      const titleText = "Pakistan Autos";
      const titleWidth = doc.getTextWidth(titleText);
      const titleX = (pageWidth - titleWidth) / 2; // Center horizontally
  
      doc.text(titleText, titleX, 15); // Add "Pakistan Autos" at the center
  
      doc.setFont("Brush", "normal");
      doc.setFontSize(addressFontSize); // Set font size for address
  
      const addressText = "Near Din Plaza, GT Road, Gujranwala";
      const addressWidth = doc.getTextWidth(addressText);
      const addressX = (pageWidth - addressWidth) / 2; // Center horizontally
  
      doc.text(addressText, addressX, 25); // Add address below title
  
      currentY = headerHeight + 10; // Adjust current Y for the main content
  };
  
  

  const addFooter = () => {
    const footerHeight = 20; // Height of the footer

    // Add background color for footer
    doc.setFillColor(0, 100, 0); // Dark green
    doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");
    // Set font and text color
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // White text

    // Add "Pakistan Autos" on the left
    doc.setFont("Bailey", "bold");
    doc.setFontSize(16); // Bigger font size
    doc.text("Pakistan Autos", margin, pageHeight - 8);

    // Add owner's name in the middle
    const ownerName = "Owner: Afaq Atiq";
    const ownerNameWidth = doc.getTextWidth(ownerName);
    const ownerX = (pageWidth - ownerNameWidth) / 2;
    doc.setFont("Bailey", "normal");
    doc.text(ownerName, ownerX, pageHeight - 8);

    // Add contact number on the right
    const contactText = "Contact: 0317-9901457";
    const contactWidth = doc.getTextWidth(contactText);
    const contactX = pageWidth - margin - contactWidth;
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

    // Start creating the PDF
    addHeader();
    addWatermark();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);


    // Generate a random invoice number
    const invoiceNumber = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit random number

    // Get the current date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB"); // Format: DD/MM/YYYY
    const formattedTime = now.toLocaleTimeString("en-US", { hour12: false }); // Format: HH:mm:ss

    // Add Payment Invoice Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Black text
    doc.text("Payment Invoice", pageWidth / 2, currentY, { align: "center" });

    // Adjust Y position for invoice number and date/time
    currentY += spacing;

    // Add Invoice Number on the left
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Invoice Number: ${invoiceNumber}`, margin, currentY);

    // Date and Time on the right corner
    const rightAlignedText = `Date: ${formattedDate} | Time: ${formattedTime}`;
    doc.text(rightAlignedText, pageWidth - margin, currentY, { align: "right" });

    // Add spacing before the next section
    currentY += spacing * 2;
    checkPageBreak();

    // Client Details Section
    addSectionHeader("Client Details");
    addField("Name:", selectedBuy.clientDetails?.name || "N/A");
    addField("Contact:", selectedBuy.clientDetails?.contactNo || "N/A", 80);
    currentY += spacing;
    addField("Address:", selectedBuy.clientDetails?.address || "N/A");
    currentY += spacing * 2;
    checkPageBreak();



    // Payment Details Section
    addSectionHeader("Payment Details");
    addField("Payment Amount:", `₨${Number(paymentAmount).toLocaleString()}`, 0);
    addField("Payment Date:", paymentDate, pageWidth / 3); // Adjust X-offset for middle alignment
    addField("Payment Mode:", paymentMode, (2 * pageWidth) / 3 - margin); // Adjust for right alignment
    currentY += spacing + 4; // Reduce unnecessary spacing here
    checkPageBreak();
    
    // Financial Details Section
    addSectionHeader("Financial Details");
    addField("Total Selling Price:", `₨${selectedBuy.priceDetails?.sellingPrice?.toLocaleString() || "N/A"}`, 0);
    addField("Previous Pending Balance:", `₨${selectedBuy.pendingBalance?.toLocaleString() || "N/A"}`, 80);
    currentY += spacing;
    addField("New Pending Balance:", `₨${updatedPendingBalance.toLocaleString()}`, 0);
    currentY += spacing;
    addField("Cash Paid:", `₨${selectedBuy.priceDetails?.cashPaid?.toLocaleString() || "N/A"}`, 0);
    addField("Online Paid:", `₨${selectedBuy.priceDetails?.onlinePaid?.toLocaleString() || "N/A"}`, pageWidth / 3);
    currentY += spacing*2; // Keep spacing consistent
    checkPageBreak();

    // Bike Details
    addSectionHeader("Bike Details");
    addField("Manufacturer:", selectedBuy.bikeDetails?.manufacturer || "N/A");
    addField("Model:", selectedBuy.bikeDetails?.model || "N/A", 80);
    addField("Type:", selectedBuy.bikeDetails?.type || "N/A", 160);
    currentY += spacing;
    addField("Condition:", selectedBuy.bikeDetails?.condition || "N/A");
    addField("Chassis Number:", selectedBuy.bikeDetails?.chassisNumber || "N/A", 80);
    currentY += spacing * 2;
    checkPageBreak();

    // Registration Details
    addSectionHeader("Registration Details");
    addField("Registration Number:", selectedBuy.registrationDetails?.registrationNo || "N/A");
    addField("Registration City:", selectedBuy.registrationDetails?.registrationCity || "N/A", 80);
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

    // Add Footer last
    addFooter();

    // Save PDF
    doc.save(`Invoice_${selectedBuy.clientDetails?.name || "Client"}.pdf`);
};
  
  const handleOpenConfirmDialog = () => {
    setIsConfirmDialogOpen(true);
  };

  const isSubmitDisabled = !paymentAmount || !paymentDate || !paymentMode;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: "1.5rem",
          }}
        >
          Make Payment
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: 3, py: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card
              sx={{
                boxShadow: 3,
                padding: 2,
                borderRadius: 2,
                bgcolor: "#f5f5f5",
                "&:hover": { boxShadow: 6 },
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "primary.main", mb: 1, textAlign: "center" }}
              >
                Payment Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Payment Amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => {
                      const enteredValue = parseFloat(e.target.value) || 0;
                      const updatedBalance = (selectedBuy?.pendingBalance || 0) - enteredValue;
                      setPaymentAmount(enteredValue);
                      setUpdatedPendingBalance(updatedBalance);
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>₨</Typography>,
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Payment Date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      label="Payment Mode"
                    >
                      {paymentModes.map((mode) => (
                        <MenuItem key={mode} value={mode}>
                          {mode}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined" color="error" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleOpenConfirmDialog}
            variant="contained"
            color="primary"
            disabled={isSubmitDisabled}
            sx={{
              borderRadius: 2,
              "&:hover": { bgcolor: "#004d40", transform: "scale(1.05)", transition: "0.3s" },
            }}
          >
            Submit Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onClose={() => setIsConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit this payment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};



// Main Component
const BikeCreditBuys = () => {
  const [creditBuys, setCreditBuys] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBuy, setSelectedBuy] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchCreditBuys();
  }, []);

  const fetchCreditBuys = async () => {
    try {
      const response = await fetch(`${url}/BikeCreditBuy/`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      const pendingData = data.filter(buy => buy.pendingBalance > 0);
      setCreditBuys(pendingData);
    } catch (error) {
      console.error("Error fetching credit buys:", error);
    }
  };

  const handleOpenPaymentModal = (buy) => {
    setSelectedBuy(buy);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBuy(null);
  };

  const handleMakePayment = async (payment) => {
    if (!selectedBuy) return;
  
    
    try {
      const response = await fetch(`${url}/BikeCreditBuy/update/${selectedBuy.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update payment");
      }
  
      await fetchCreditBuys();
      handleClosePaymentModal();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const getTodayPendingPayments = () => {
    const today = new Date().toISOString().split("T")[0]; 
    return creditBuys.filter((buy) => {
      if (!buy.promisedDate) return false; 
      try {
        const promisedDate = new Date(buy.promisedDate).toISOString().split("T")[0];
        return promisedDate === today;
      } catch (error) {
        console.error("Invalid date format in promisedDate:", buy.promisedDate);
        return false; // Skip invalid dates
      }
    });
  };
  

  const getAllPendingPayments = () => creditBuys;
  const theme=new useTheme();

  const PaymentTable = ({ payments }) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Client</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Bike</TableCell>
            <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Pending Balance</TableCell>
            <TableCell  sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(!payments || payments.length === 0) ? (
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="textSecondary">
                  No pending payments available.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((buy) => (
              <TableRow key={buy.id}>
                <TableCell>{buy.clientDetails?.name || 'N/A'}</TableCell>
                <TableCell>{`${buy.bikeDetails?.manufacturer} ${buy.bikeDetails?.model}`}</TableCell>
                <TableCell>{formatCurrency(buy.pendingBalance)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <BikeDetailsModal buy={buy} />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PaymentIcon />}
                      onClick={() => handleOpenPaymentModal(buy)}
                      size="small"
                    >
                      Make Payment
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{  fontWeight: 'bold' ,mb: 3 }} color="Black">
        
        Bike Credits
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            icon={<TodayIcon />} 
            label="Today's Pending" 
            iconPosition="start"
          />
          <Tab 
            icon={<PaymentIcon />} 
            label="All Pending" 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      <Card>
        <CardHeader 
          title={activeTab === 0 ? "Today's Pending Payments" : "All Pending Payments"}
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          <PaymentTable 
            payments={activeTab === 0 ? getTodayPendingPayments() : getAllPendingPayments()} 
          />
        </CardContent>
      </Card>

      <PaymentModal
        open={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        selectedBuy={selectedBuy}
        onSubmit={handleMakePayment}
      />
    </Box>
  );
};

export default BikeCreditBuys;