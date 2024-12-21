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
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

const SparepartCreditPurchaseModal = ({ 
  open, 
  onClose, 
  formData,
  products,
  supplier
}) => {
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

  // Calculate total amount from all products
  const totalAmount = products.reduce((sum, product) => sum + (Number(product.total) || 0), 0);

  // Calculate totals for payments
  const paidAmount = paymentsReceived.reduce((total, payment) => total + Number(payment.paymentAmount), 0);
  const pendingBalance = totalAmount - paidAmount;

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
      formData,
      products: products.map(product => ({
        ...product,
        unitPrice: Number(product.unitPrice),
        quantity: Number(product.quantity),
        total: Number(product.total)
      })),
      supplier: {
        name: supplier?.SellerName || "",
        cnic: supplier?.identificationNumber || "",
        contactNo: supplier?.contactNumber || "",
        address: supplier?.address || ""
      },
      priceDetails: {
        totalAmount,
        paidAmount,
        pendingBalance
      },
      paymentsReceived,
      trustedPerson,
      promisedDate
    };

    try {
      const response = await fetch(`${url}/sparepartCredit/`, {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save credit purchase');
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
  
      const titleText = "Pakistan Autos - Spare Parts Credit Purchase";
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
    const invoiceNumber = Math.floor(100000 + Math.random() * 900000);
    const date = new Date().toLocaleDateString();
    doc.text(`Invoice #: ${invoiceNumber}`, margin, currentY);
    doc.text(`Date: ${date}`, pageWidth - margin - doc.getTextWidth(`Date: ${date}`), currentY);
    currentY += spacing * 2;
  
    // Supplier Details
    addSectionHeader("Supplier Information");
    addField("Name", selectedBuy.supplier.name);
    addField("CNIC", selectedBuy.supplier.cnic, 100);
    currentY += spacing;
    addField("Contact", selectedBuy.supplier.contactNo);
    addField("Address", selectedBuy.supplier.address, 100);
    currentY += spacing * 2;
  
    // Category Details
    addSectionHeader("Category Information");
    addField("Bike Type", selectedBuy.formData.bikeType);
    addField("Category", selectedBuy.formData.category?.name || "", 100);
    currentY += spacing;
    addField("Sub Category", selectedBuy.formData.subCategory?.name || "");
    currentY += spacing * 2;
  
    // Products Details
    addSectionHeader("Product Details");
    selectedBuy.products.forEach((product, index) => {
      addField(`${index + 1}. ${product.productName}`, "");
      currentY += spacing;
      addField("Condition", product.condition, 10);
      addField("Quantity", product.quantity.toString(), 90);
      addField("Unit Price", `Rs. ${product.unitPrice}`, 170);
      currentY += spacing;
      addField("Total", `Rs. ${product.total}`, 10);
      currentY += spacing;
      
      if (product.warranty) {
        addField("Warranty", product.warranty, 10);
        currentY += spacing;
      }
      
      currentY += spacing;
    });
  
    // Payment Details
    addSectionHeader("Payment Details");
    addField("Total Amount", `Rs. ${selectedBuy.priceDetails.totalAmount}`);
    addField("Paid Amount", `Rs. ${selectedBuy.priceDetails.paidAmount}`, 100);
    currentY += spacing;
    addField("Pending Balance", `Rs. ${selectedBuy.priceDetails.pendingBalance}`);
    currentY += spacing * 2;
  
    // Payment History
    if (selectedBuy.paymentsReceived.length > 0) {
      addSectionHeader("Payment History");
      selectedBuy.paymentsReceived.forEach((payment, index) => {
        addField(
          `Payment ${index + 1}`,
          `Rs. ${payment.paymentAmount} (${payment.paymentMode}) - ${payment.paymentDate}`
        );
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
    
    doc.save("spare_parts_credit_purchase_invoice.pdf");
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
          New Spare Parts Credit Purchase
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
          <Box sx={{ padding: '20px' }}>
            <Card sx={{
              boxShadow: 4,
              borderRadius: 3,
              padding: 3,
              background: '#f1f8e9',
              width: '100%',
              '&:hover': { boxShadow: 6 },
            }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Supplier Information */}
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
                      Supplier: {supplier?.SellerName}
                    </Typography>
                  </Grid>

                  {/* Products Summary */}
                  <Grid item xs={12}>
                    <Card sx={{
                      boxShadow: 2,
                      borderRadius: 3,
                      padding: 2,
                      background: '#ffffff',
                      marginBottom: 2,
                    }}>
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
                          Products Summary
                        </Typography>
                        
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Product</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {products.map((product, index) => (
                              <TableRow key={index}>
                                <TableCell>{product.productName}</TableCell>
                                <TableCell align="right">{product.quantity}</TableCell>
                                <TableCell align="right">Rs. {product.unitPrice}</TableCell>
                                <TableCell align="right">Rs. {product.total}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                                Grand Total:
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                Rs. {totalAmount}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Trusted Person and Promised Date Card */}
                  <Grid item xs={12}>
                    <Card sx={{
                      boxShadow: 2,
                      borderRadius: 3,
                      padding: 2,
                      background: '#ffffff',
                      marginBottom: 2,
                    }}>
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
                    <Card sx={{
                      boxShadow: 2,
                      borderRadius: 3,
                      padding: 2,
                      background: '#ffffff',
                      marginBottom: 2,
                    }}>
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

export default SparepartCreditPurchaseModal;