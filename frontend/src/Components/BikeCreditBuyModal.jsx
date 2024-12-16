import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Box
} from '@mui/material';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

const BikeCreditModal = ({ open, onClose, bikeData, agent, clientDetails, priceDetails }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentsReceived, setPaymentsReceived] = useState([]);
  const [promisedDate, setPromisedDate] = useState("");
  const [trustedPerson, setTrustedPerson] = useState({
    name: "",
    cnic: "",
    contactNo: "",
    address: ""
  });
  
  // New state for Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate the total paid amount
  const paidAmount = paymentsReceived.reduce((total, payment) => total + Number(payment.paymentAmount), 0);
  const pendingBalance = priceDetails?.sellingPrice ? Number(priceDetails.sellingPrice) - paidAmount : 0;


  const allDetailsValid =
  trustedPerson.name &&
  trustedPerson.cnic &&
  trustedPerson.contactNo &&
  trustedPerson.address &&
  promisedDate &&
  paymentsReceived.length > 0;

  const handleAddPayment = () => {
    if (!paymentAmount) return;

    const newPayment = {
      paymentMode,
      paymentAmount: Number(paymentAmount),
      paymentDate: new Date().toISOString().split("T")[0]
    };

    setPaymentsReceived(prev => [...prev, newPayment]);
    setPaymentAmount("");
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSave = async () => {
    const data = {
      agent: {
        name: agent?.name || "",
        cnic: agent?.cnic || "",
        contact: agent?.contactNo || "",
        address: agent?.address || ""
      },
      bikeDetails: {
        chassisNumber: bikeData?.chassisNumber || "",
        condition: bikeData?.condition || "",
        manufacturer: bikeData?.manufacturer || "",
        mileage: bikeData?.mileage || "",
        model: bikeData?.model || "",
        purchasePrice: bikeData?.purchasePrice || "",
        type: bikeData?.type || ""
      },
      priceDetails: {
        balance: priceDetails?.balance || "0.00",
        cashPaid: priceDetails?.cashPaid || "0",
        discountOffered: priceDetails?.discountOffered || "0",
        onlinePaid: priceDetails?.onlinePaid || "0",
        profit: priceDetails?.profit || "0.00",
        sellingPrice: priceDetails?.sellingPrice || "0"
      },
      registrationDetails: {
        client: {
          name: clientDetails?.fullName || "",
          cnic: clientDetails?.idCardNo || "",
          contactNo: clientDetails?.phoneNumber || "",
          address: clientDetails?.address || ""
        },
        registrationCity: clientDetails?.registrationCity || "",
        registrationNo: clientDetails?.registrationNo || ""
      },
      paymentsReceived,
      clientDetails: {
        name: clientDetails?.fullName || "",
        cnic: clientDetails?.idCardNo || "",
        contactNo: clientDetails?.phoneNumber || "",
        address: clientDetails?.address || ""
      },
      trustedPerson,
      pendingBalance,
      promisedDate
    };

    try {
      const response = await fetch(`${url}/BikeCreditBuy/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        generateInvoice(data);
        setSnackbar({
          open: true,
          message: 'Credit purchase saved successfully!',
          severity: 'success'
        });
        setTimeout(() => {
          onClose();
        }, 2000); // Close modal after 2 seconds on success
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${response.statusText || 'Failed to save credit purchase'}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.message || 'Failed to save credit purchase'}`,
        severity: 'error'
      });
    }
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
      addField("Name:", clientDetails?.fullName || "N/A");
      addField("CNIC:", clientDetails?.idCardNo || "N/A", 90);
      currentY += spacing;

      addField("Contact No:", clientDetails?.phoneNumber || "N/A", 0);
      addField("Address:", clientDetails?.address || "N/A", 90);
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
      addField("Profit:", `₨${priceDetails?.profit?.toLocaleString() || "N/A"}`, 90);
    
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
      doc.save(`Invoice_${clientDetails?.fullName || "Client"}.pdf`);
    };

  return (
    <>
<Dialog
  open={open}
  onClose={onClose}
  maxWidth="md"
  fullWidth
  sx={{
    '& .MuiDialog-paper': {
      backgroundColor: '#f1f8e9',
      borderRadius: '16px',
    },
  }}
>
  <DialogTitle
    sx={{
      backgroundColor: '#e8f5e9',
      color: '#388e3c',
      fontWeight: 'bold',
      textAlign: 'center',
      position: 'relative',
    }}
  >
    New Bike Credit Purchase
    <Button
      onClick={onClose}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        color: '#388e3c',
      }}
    >
      ✕
    </Button>
  </DialogTitle>
  <DialogContent>
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      {/* Outer Card */}
      <Card
        sx={{
          boxShadow: 4,
          borderRadius: 3,
          padding: 3,
          background: '#f1f8e9',
          width: '100%',
          maxWidth: '800px',
          '&:hover': { boxShadow: 6 },
        }}
      >
        <CardContent>
          <Grid container spacing={3}>
            {/* Client Information */}
            <Grid item xs={12}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  color: '#1b5e20',
                  fontWeight: 'bold',
                  marginBottom: '20px',
                }}
              >
                Client: {clientDetails?.fullName}
              </Typography>
            </Grid>

            {/* Trusted Person and Promised Date Card */}
            <Grid item xs={12}>
              <Card
                sx={{
                  boxShadow: 2,
                  borderRadius: 3,
                  padding: 2,
                  background: '#ffffff',
                  marginBottom: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: '#1b5e20',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                    }}
                  >
                    Trusted Person Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={trustedPerson.name}
                        onChange={(e) =>
                          setTrustedPerson({ ...trustedPerson, name: e.target.value })
                        }
                        sx={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="CNIC"
                        value={trustedPerson.cnic}
                        onChange={(e) =>
                          setTrustedPerson({ ...trustedPerson, cnic: e.target.value })
                        }
                        sx={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Number"
                        value={trustedPerson.contactNo}
                        onChange={(e) =>
                          setTrustedPerson({ ...trustedPerson, contactNo: e.target.value })
                        }
                        sx={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={trustedPerson.address}
                        onChange={(e) =>
                          setTrustedPerson({ ...trustedPerson, address: e.target.value })
                        }
                        sx={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: '#1b5e20',
                      fontWeight: 'bold',
                      marginTop: '20px',
                      marginBottom: '10px',
                    }}
                  >
                    Promised Date
                  </Typography>
                  <TextField
                    fullWidth
                    label="Promised Date"
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      backgroundColor: '#f9f9f9',
                      borderRadius: 2,
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Details Card */}
            <Grid item xs={12}>
              <Card
                sx={{
                  boxShadow: 2,
                  borderRadius: 3,
                  padding: 2,
                  background: '#ffffff',
                  marginBottom: 2,
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: '#1b5e20',
                      fontWeight: 'bold',
                      marginBottom: '10px',
                    }}
                  >
                    Payment Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        sx={{ color: '#1b5e20', fontWeight: 'bold' }}
                      >
                        Payments Received:
                      </Typography>
                      {paymentsReceived.map((payment, index) => (
                        <Typography key={index} variant="body2" sx={{ marginLeft: '10px' }}>
                          • Amount: Rs.{payment.paymentAmount}, Mode: {payment.paymentMode},
                          Date: {payment.paymentDate}
                        </Typography>
                      ))}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: '#388e3c',
                          marginTop: '10px',
                          fontWeight: 'bold',
                        }}
                      >
                        Total Paid: Rs.{paidAmount} | Pending Balance: Rs.{pendingBalance}
                      </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Payment Amount"
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        sx={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Payment Mode"
                        select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                        sx={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="Cash">Cash</MenuItem>
                        <MenuItem value="Online">Online</MenuItem>
                        <MenuItem value="Cheque">Cheque</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleAddPayment}
                        disabled={!paymentAmount}
                        sx={{
                          borderRadius: '50px',
                          padding: '10px 20px',
                          fontWeight: 'bold',
                          width: '100%',
                        }}
                      >
                        Add Payment
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Save Button */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
              <Button
                onClick={handleSave}
                variant="contained"
                color="primary"
                sx={{
                  backgroundColor: '#388e3c',
                  color: '#ffffff',
                  borderRadius: '50px',
                  padding: '10px 40px',
                  fontWeight: 'bold',
                }}
                disabled={!allDetailsValid}

              >
                Save
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  </DialogContent>
</Dialog>




      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BikeCreditModal;

