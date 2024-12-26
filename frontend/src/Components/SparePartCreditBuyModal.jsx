import React, { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions,Grid,Box, TextField, Button, Typography, MenuItem 
} from '@mui/material';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

const SparePartCreditBuyModal = ({ open, onClose, purchaserDetails, products, totalAmount }) => {
  const [addType] = useState("Spare Part");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash"); // Default value
  const [paymentsReceived, setPaymentsReceived] = useState([]); // To hold multiple payments
  const [promisedDate, setPromisedDate] = useState("");
  const [TotalPrice, setTotalAmount] = useState(0)
  const [trustedPerson, setTrustedPerson] = useState({ 
    name: "", 
    cnic: "", 
    phone: "", 
    address: "" 
  });
  const [errors, setErrors] = useState({
    promisedDate: '',
    trustedPersonName: '',
    trustedPersonCnic: '',
    trustedPersonPhone: '',
    trustedPersonAddress: '',
    paymentAmount: '',
    payments: ''
  });
  
  // Calculate the paid amount
  const paidAmount = paymentsReceived.reduce((total, payment) => total + Number(payment.paymentAmount), 0);

  const handleAddPayment = () => {
    const newPayment = {
      paymentAmount: Number(paymentAmount),
      paymentMode,
      paymentDate: new Date().toISOString().split("T")[0], // Format to YYYY-MM-DD
    };
    
    setPaymentsReceived(prev => [...prev, newPayment]);
    setPaymentAmount(""); // Clear the input field
  };

  const handleSave = async () => {
    const newErrors = {};
    // Validate required fields
    if (!promisedDate) {
      console.error("Promised date is required");
      return;
    }
  
    if (!trustedPerson.name || !trustedPerson.cnic || !trustedPerson.phone || !trustedPerson.address) {
      console.error("All trusted person details are required");
      return;
    }
  
    if (paymentsReceived.length === 0) {
      console.error("At least one payment is required");
      return;
    }
  
    if (!products || products.length === 0) {
      console.error("Products are required");
      return;
    }
  
    try {
      // Calculate total amount from products
      const total = products.reduce((acc, product) => 
        acc + (product.unitSellingPrice || product.unitPrice) * product.quantity, 0
      );
      setTotalAmount(total)
  
      // Format products data
      const formattedProducts = products.map(product => ({
        productName: product.productName,
        category: product.category,
        condition: product.condition,
        quantity: Number(product.quantity),
        unitPrice: Number(product.unitPrice),
        unitSellingPrice: Number(product.unitSellingPrice || product.unitPrice)
      }));
  
      // Format payments data
      const formattedPayments = paymentsReceived.map(payment => ({
        paymentAmount: Number(payment.paymentAmount),
        paymentMode: payment.paymentMode,
        paymentDate: payment.paymentDate
      }));
  
      // Create request body
      const requestBody = {
        products: formattedProducts,
        purchaserDetails: {
          name: purchaserDetails.name,
          contactNo: purchaserDetails.contactNo,
          cnic: purchaserDetails.cnic,
          address: purchaserDetails.address
        },
        addType: "Spare Part",
        clientDetails: {
          name: purchaserDetails.name,
          contactNo: purchaserDetails.contactNo,
          cnic: purchaserDetails.cnic,
          address: purchaserDetails.address
        },
        trustedPerson: {
          name: trustedPerson.name,
          cnic: trustedPerson.cnic,
          phone: trustedPerson.phone,
          address: trustedPerson.address
        },
        paymentsReceived: formattedPayments,
        promisedDate,
        paidAmount: Number(paidAmount),
        total: Number(total)
      };
  
      // Send request to API
      const response = await fetch(`${url}/SparePartCreditBuy/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create credit purchase');
      }
  
      const result = await response.json();
      
  
      // Generate invoice with the same data
      generateInvoice(requestBody);
  
      // Close modal and reset form
      onClose();
    } catch (error) {
      console.error("Error creating credit purchase:", error.message);
      // You might want to show an error message to the user here
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
  
    const { products, purchaserDetails, trustedPerson, paymentsReceived } = selectedBuy;
  
    // Define utility functions
    const checkPageBreak = () => {
      if (currentY > pageHeight - margin - 20) {
        doc.addPage();
        currentY = margin;
        addHeader();
        addWatermark();
      }
    };
  
    const addHeader = () => {
      const headerHeight = 40;
      const logoWidth = 50;
      const logoHeight = 25;
  
      doc.setFillColor(0, 100, 0); // Dark green background
      doc.rect(0, 0, pageWidth, headerHeight, "F");
  
      if (logoData) {
        doc.addImage(logoData, "PNG", margin, 5, logoWidth, logoHeight);
      }
  
      doc.setFont("Bailey", "bold");
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("Pakistan Autos", pageWidth / 2, 15, { align: "center" });
  
      doc.setFont("Brush", "normal");
      doc.setFontSize(14);
      doc.text("Near Din Plaza, GT Road, Gujranwala", pageWidth / 2, 25, { align: "center" });
  
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
  
    const addField = (label, value, xOffset = 0) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50);
      doc.text(`${label}: ${value}`, margin + xOffset, currentY);
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
      doc.text("PAKISTAN AUTOS", pageWidth / 2, pageHeight / 2, { align: "center", angle: -45 });
      doc.restoreGraphicsState();
    };
  
    // Start Generating Invoice
    addHeader();
    addWatermark();
    
  
    const invoiceNumber = Math.floor(100000 + Math.random() * 900000);
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-GB");
    const formattedTime = now.toLocaleTimeString("en-US", { hour12: false });
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Payment Invoice", pageWidth / 2, currentY, { align: "center" });
  
    currentY += spacing;
    addField("Invoice Number", invoiceNumber);
    doc.text(`Date: ${formattedDate} | Time: ${formattedTime}`, pageWidth - margin, currentY, { align: "right" });
    currentY += spacing * 2;
    checkPageBreak();
  
    // Purchaser Details
    addSectionHeader("Purchaser Details");
    addField("Name", purchaserDetails?.name || "N/A");
    addField("CNIC", purchaserDetails?.cnic || "N/A", 90);
    currentY += spacing;
    addField("Contact No", purchaserDetails?.contactNo || "N/A");
    addField("Address", purchaserDetails?.address || "N/A", 90);
    currentY += spacing * 2;
    checkPageBreak();
  
    // Trusted Person Details
    addSectionHeader("Trusted Person Details");
    addField("Name", trustedPerson?.name || "N/A");
    addField("CNIC", trustedPerson?.cnic || "N/A", 90);
    currentY += spacing;
    addField("Contact No", trustedPerson?.phone || "N/A");
    addField("Address", trustedPerson?.address || "N/A", 90);
    currentY += spacing * 2;
    checkPageBreak();
  
    // Products Section
   // Calculate total bill from selling prices
const totalBill = products?.reduce((total, product) => {
  const sellingPrice = product.unitSellingPrice || product.unitPrice || 0;
  const quantity = product.quantity || 0;
  return total + (sellingPrice * quantity);
}, 0);

// Add total section to invoice
addSectionHeader("Total Bill");
doc.setFontSize(12);
doc.setFont("helvetica", "bold");
addField("Total Amount", `₨${totalBill.toLocaleString() || "N/A"}`, 0);
currentY += spacing * 2;
checkPageBreak();
    addSectionHeader("Product Details");
    products?.forEach((product, index) => {
      addField(`Product ${index + 1}`, product.productName || "N/A");
      addField("Category", product.category || "N/A", 90);
      currentY += spacing;
  
      addField("Condition", product.condition || "N/A");
      addField("Quantity", product.quantity?.toString() || "N/A", 90);
      currentY += spacing;
      addField("Unit Price", `₨${product.unitSellingPrice?.toLocaleString() || "N/A"}`, 0);
      currentY += spacing * 2;
      checkPageBreak();
    });
    
    // Payments Received Section
    if (paymentsReceived?.length > 0) {
      addSectionHeader("Payments Received");
      paymentsReceived.forEach((payment) => {
        addField("Amount", `₨${payment.paymentAmount?.toLocaleString()}`);
        addField("Mode", payment.paymentMode || "N/A", 80);
        addField("Date", payment.paymentDate || "N/A", 160);
        currentY += spacing;
        checkPageBreak();
      });
    }
    addFooter();
    doc.save(`Invoice_${purchaserDetails?.name || "Client"}.pdf`);
  };
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
  <DialogTitle>
    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
      New Spare Part Credit Purchase
    </Typography>
  </DialogTitle>
  <DialogContent dividers>
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Purchaser: <span style={{ color: '#279508' }}>{purchaserDetails.name}</span>
      </Typography>
    </Box>

    <Grid container spacing={2}>
      {/* Payment Details Section */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#279508', mb: 2 }}>
          Payment Details
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Payment Amount"
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Payment Mode"
          select
          value={paymentMode}
          onChange={(e) => setPaymentMode(e.target.value)}
          variant="outlined"
        >
          <MenuItem value="Cash">Cash</MenuItem>
          <MenuItem value="Online">Online</MenuItem>
          <MenuItem value="Cheque">Cheque</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Promised Date"
          type="date"
          value={promisedDate}
          onChange={(e) => setPromisedDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
        />
      </Grid>

      {/* Trusted Person Details Section */}
      <Grid item xs={12}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#279508', mt: 3, mb: 2 }}>
          Trusted Person Details
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Trusted Person Name"
          value={trustedPerson.name}
          onChange={(e) => setTrustedPerson({ ...trustedPerson, name: e.target.value })}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Trusted Person CNIC"
          value={trustedPerson.cnic}
          onChange={(e) => setTrustedPerson({ ...trustedPerson, cnic: e.target.value })}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Trusted Person Phone"
          value={trustedPerson.phone}
          onChange={(e) => setTrustedPerson({ ...trustedPerson, phone: e.target.value })}
          variant="outlined"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Trusted Person Address"
          value={trustedPerson.address}
          onChange={(e) => setTrustedPerson({ ...trustedPerson, address: e.target.value })}
          variant="outlined"
        />
      </Grid>
    </Grid>

    {/* Payments Received Section */}
    <Box sx={{ mt: 3 }}>
      <Button
        onClick={handleAddPayment}
        variant="contained"
        color="success"
        sx={{ mb: 2 }}
      >
        Add Payment
      </Button>
      <Typography variant="body1" gutterBottom sx={{ fontWeight: 'bold', color: '#279508' }}>
        Payments Received:
      </Typography>
      <Box sx={{ maxHeight: 150, overflowY: 'auto', mb: 2 }}>
        {paymentsReceived.map((payment, index) => (
          <Typography key={index} variant="body2">
            {`Amount: ${payment.paymentAmount}, Mode: ${payment.paymentMode}, Date: ${payment.paymentDate}`}
          </Typography>
        ))}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
        Total Paid: <span style={{ color: '#279508' }}>Rs. {paidAmount}</span>
      </Typography>
   
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose} variant="outlined" color="secondary">
      Cancel
    </Button>
    <Button onClick={handleSave} variant="contained" color="primary">
      Save
    </Button>
  </DialogActions>
</Dialog>


  );
};

export default SparePartCreditBuyModal;
