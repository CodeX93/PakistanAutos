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

const BikePurchaseCreditModal = ({ open, onClose, bikeData, seller, priceDetails }) => {
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
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Calculate totals
  const paidAmount = paymentsReceived.reduce((total, payment) => total + Number(payment.paymentAmount), 0);
  const pendingBalance = priceDetails?.purchasePrice ? Number(priceDetails.purchasePrice) - paidAmount : 0;

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
      bikeDetails: {
        manufacturer: bikeData?.manufacturer || "",
        model: bikeData?.model || "",
        type: bikeData?.type || "",
        motorNo: bikeData?.motorNo || "",
        frameNo: bikeData?.frameNo || "",
        chassisNumber: bikeData?.chassisNumber || "",
        engineNo: bikeData?.engineNo || "",
        condition: bikeData?.condition || "new"
      },
      seller: {
        name: seller?.name || "",
        cnic: seller?.cnic || "",
        contactNo: seller?.contactNo || "",
        address: seller?.address || ""
      },
      priceDetails: {
        purchasePrice: priceDetails?.purchasePrice || "0",
        paidAmount: paidAmount.toString(),
        pendingBalance: pendingBalance.toString()
      },
      paymentsReceived,
      trustedPerson,
      promisedDate
    };

    try {
      const response = await fetch(`${url}/bikePurchaseCredit/`, {
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
        }, 2000);
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
  
    // Header Section
    const addHeader = () => {
      const headerHeight = 40;
      const logoWidth = 50;
      const logoHeight = 25;
  
      doc.setFillColor(0, 100, 0);
      doc.rect(0, 0, pageWidth, headerHeight, "F");
  
      if (logoData) {
        doc.addImage(logoData, "PNG", margin, 5, logoWidth, logoHeight);
      }
  
      const titleFontSize = 24;
      const addressFontSize = 14;
  
      doc.setFont("helvetica", "bold");
      doc.setFontSize(titleFontSize);
      doc.setTextColor(255, 255, 255);
  
      const titleText = "Pakistan Autos - Credit Purchase";
      const titleX = (pageWidth - doc.getTextWidth(titleText)) / 2;
      doc.text(titleText, titleX, 15);
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(addressFontSize);
      const addressText = "Near Din Plaza, GT Road, Gujranwala";
      const addressX = (pageWidth - doc.getTextWidth(addressText)) / 2;
      doc.text(addressText, addressX, 25);
  
      currentY = headerHeight + 10;
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
  
    const addField = (label, value, xOffset = 0) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50);
      doc.text(`${label}: ${value}`, margin + xOffset, currentY);
    };
  
    addHeader();
  
    // Invoice Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const invoiceNumber = Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toLocaleDateString();
    doc.text(`Invoice #: ${invoiceNumber}`, margin, currentY);
    doc.text(`Date: ${date}`, pageWidth - margin - doc.getTextWidth(`Date: ${date}`), currentY);
    currentY += spacing * 2;
  
    // Seller Details
    addSectionHeader("Seller Information");
    addField("Name", selectedBuy.seller.name);
    addField("CNIC", selectedBuy.seller.cnic, 100);
    currentY += spacing;
    addField("Contact", selectedBuy.seller.contactNo);
    addField("Address", selectedBuy.seller.address, 100);
    currentY += spacing * 2;
  
    // Bike Details
    addSectionHeader("Bike Information");
    addField("Manufacturer", selectedBuy.bikeDetails.manufacturer);
    addField("Model", selectedBuy.bikeDetails.model, 100);
    currentY += spacing;
    addField("Type", selectedBuy.bikeDetails.type);
    currentY += spacing * 2;
  
    // Payment Details
    addSectionHeader("Payment Details");
    addField("Purchase Price", `Rs. ${selectedBuy.priceDetails.purchasePrice}`);
    addField("Paid Amount", `Rs. ${selectedBuy.priceDetails.paidAmount}`, 100);
    currentY += spacing;
    addField("Pending Balance", `Rs. ${selectedBuy.priceDetails.pendingBalance}`);
    currentY += spacing * 2;
  
    // Payment History
    if (selectedBuy.paymentsReceived.length > 0) {
      addSectionHeader("Payment History");
      selectedBuy.paymentsReceived.forEach((payment, index) => {
        addField(`Payment ${index + 1}`, `Rs. ${payment.paymentAmount} (${payment.paymentMode})`);
        currentY += spacing;
      });
      currentY += spacing;
    }
  
    // Trusted Person Details
    addSectionHeader("Trusted Person Details");
    addField("Name", selectedBuy.trustedPerson.name);
    addField("CNIC", selectedBuy.trustedPerson.cnic, 100);
    currentY += spacing;
    addField("Contact", selectedBuy.trustedPerson.contactNo);
    addField("Address", selectedBuy.trustedPerson.address, 100);
    currentY += spacing;
    addField("Promised Date", selectedBuy.promisedDate);
    
    doc.save("credit_purchase_invoice.pdf");
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
                  {/* Seller Information */}
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
                      Seller: {seller?.name}
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
                              Payments Made:
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

export default BikePurchaseCreditModal;