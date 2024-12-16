import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Fab, Badge,  Paper, Snackbar,  Box,
  useTheme,
  InputAdornment
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';import SearchIcon from '@mui/icons-material/Search';
import MuiAlert from '@mui/material/Alert';
import CartDialog from '../Components/CartDiaglog';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

const SaleSparePart = () => {
  const theme =new useTheme();
  const [spareParts, setSpareParts] = useState([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaserDetails, setPurchaserDetails] = useState({
    name: '',
    contactNo: '',
    cnic: '',
    address: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);



  useEffect(() => {
    fetchSpareParts();
  }, []);

  useEffect(() => {
    const filtered = spareParts.filter(part =>
      part.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpareParts(filtered);
  }, [searchTerm, spareParts]);

  const fetchSpareParts = async () => {
    try {
      const response = await fetch(`${url}/sparepart/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setSpareParts(data);
        setFilteredSpareParts(data);
      } else {
        throw new Error('Data received is not an array');
      }
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      setError(error.message);
      setNotification({ 
        open: true, 
        message: 'Failed to fetch spare parts: ' + error.message, 
        severity: 'error' 
      });
      // Initialize with empty arrays if fetch fails
      setSpareParts([]);
      setFilteredSpareParts([]);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

 // Modified addToCart function
const addToCart = (sparePart) => {
    const existingItemIndex = cart.findIndex(item => item.id === sparePart.id);
    if (existingItemIndex !== -1) {
      const updatedCart = cart.map((item, index) => 
        index === existingItemIndex 
          ? { 
              ...item, 
              quantity: Math.min(item.quantity + 1, sparePart.quantity), 
              total: (Math.min(item.quantity + 1, sparePart.quantity)) * item.unitSellingPrice 
            }
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, {
        ...sparePart,
        quantity: 1,
        sellingDate: new Date().toISOString().split('T')[0],
        purchaseUnitPrice: sparePart.unitPrice,
        unitSellingPrice: sparePart.unitPrice, // Initialize selling price same as purchase price
        total: sparePart.unitPrice
      }]);
    }
    setNotification({ open: true, message: 'Added to cart.', severity: 'success' });
  };
  
  // Modified updateCartItem function
  const updateCartItem = (index, field, value) => {
    const updatedCart = cart.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity') {
          const availableQuantity = spareParts.find(part => part.id === item.id)?.quantity || 0;
          updatedItem.quantity = Math.max(1, Math.min(parseInt(value) || 0, availableQuantity));
        }
        // Update total based on unitSellingPrice instead of purchaseUnitPrice
        updatedItem.total = updatedItem.quantity * updatedItem.unitSellingPrice;
        return updatedItem;
      }
      return item;
    });
    setCart(updatedCart);
  };
  

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
    setNotification({ open: true, message: 'Removed from cart.', severity: 'warning' });
  };

  const handlePurchaserDetailsChange = (e) => {
    setPurchaserDetails({ ...purchaserDetails, [e.target.name]: e.target.value });
  };

  const calculateTotalAmount = () => {
    return cart.reduce((total, item) => total + item.total, 0);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };


  const handleCheckout = async () => {
    if (!purchaserDetails.name || !purchaserDetails.contactNo || !purchaserDetails.cnic || !purchaserDetails.address) {
      setNotification({
        open: true,
        message: 'Please fill in all purchaser details',
        severity: 'error',
      });
      return;
    }
  
    if (cart.length === 0) {
      setNotification({
        open: true,
        message: 'Cart is empty',
        severity: 'error',
      });
      return;
    }
  
    setIsProcessing(true);
  
    try {
      // First, update the quantities in inventory for each item
      const quantityUpdatePromises = cart.map((item) => 
        fetch(`${url}/sparepart/decreaseQuantity/${item.productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: item.quantity, // Send the quantity to decrease
          }),
        })
      );
  
      // Wait for all quantity updates to complete
      const quantityResults = await Promise.all(quantityUpdatePromises);
  
      // Check if any quantity updates failed
      for (let i = 0; i < quantityResults.length; i++) {
        if (!quantityResults[i].ok) {
          const errorData = await quantityResults[i].json();
          throw new Error(`Failed to update quantity for ${cart[i].productName}: ${errorData.error}`);
        }
      }
  
      // If all quantity updates successful, proceed with sale registration
      
      const requestBody = {
        products: cart.map((item) => ({
          productName: item.productName,
          category: item.category,
          condition: item.condition,
          quantity: item.quantity,
          unitPrice: item.purchaseUnitPrice,
          unitSellingPrice: item.unitSellingPrice,
          sellingDate: item.sellingDate || new Date().toISOString().split('T')[0],
        })),
        purchaserDetails: {
          name: purchaserDetails.name,
          contactNo: purchaserDetails.contactNo,
          cnic: purchaserDetails.cnic,
          address: purchaserDetails.address,
        },
        sellingDate: new Date().toISOString().split('T')[0],
      };
      console.log(requestBody)
  
      const response = await fetch(`${url}/SparePartSaleinventory/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      await response.json();
  

      setNotification({
        open: true,
        message: 'Checkout completed successfully',
        severity: 'success',
      });
  
      generateInvoice(requestBody)
      setCart([]); // Clear cart after successful checkout
      setIsCartOpen(false); // Close cart dialog
      fetchSpareParts()
  
    } catch (error) {
      console.error('Checkout Error:', error);
      setNotification({
        open: true,
        message: 'Error processing checkout: ' + error.message,
        severity: 'error',
      });
    } finally {
      setIsProcessing(false);
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
          cart,
          purchaserDetails,
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
      
        // Purchaser Details Section
        addSectionHeader("Purchaser Details");
        addField("Name:", purchaserDetails?.name || "N/A");
        addField("CNIC:", purchaserDetails?.cnic || "N/A", 90);
        currentY += spacing;

        addField("Contact No:", purchaserDetails?.contactNo || "N/A", 0);
        addField("Address:", purchaserDetails?.address || "N/A", 90);
        currentY += spacing * 2;
        checkPageBreak();

        // Products Section
        addSectionHeader("Product Details");
        cart.forEach((product, index) => {
          addField(`Product ${index + 1}:`, product.productName || "N/A");
          addField("Category:", product.category || "N/A", 90);
          currentY += spacing;

          addField("Condition:", product.condition || "N/A", 0);
          addField("Quantity:", product.quantity?.toString() || "N/A", 90);
          currentY += spacing;

          addField("Unit Price:", `₨${product.unitPrice?.toLocaleString() || "N/A"}`, 0);
          addField("Selling Price:", `₨${product.unitSellingPrice?.toLocaleString() || "N/A"}`, 90);
          currentY += spacing * 2;
          checkPageBreak();
        });
        addFooter();
        doc.save(`Invoice_${purchaserDetails?.name || "Client"}.pdf`);

      };


  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        {/* Heading */}
        <Typography
          variant="h4"
          style={{ fontWeight: 'bold' }}
        >
          Spare Parts Inventory
        </Typography>

        {/* Search Bar */}
        <TextField
          variant="outlined"
          label='Search spare parts'
          placeholder="Search spare parts..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '350px',
          }}
        />
      </Box>

      <TableContainer component={Paper} style={{ marginBottom: '80px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Condition</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Available Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Unit Price</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: theme.palette.grey[200] }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSpareParts.map((part) => (
              <TableRow key={part.id} hover>
                <TableCell>{part.productName}</TableCell>
                <TableCell>{part.category}</TableCell>
                <TableCell>{part.condition}</TableCell>
                <TableCell>{part.quantity}</TableCell>
                <TableCell>Rs. {part.unitPrice.toFixed(2)}</TableCell>
                <TableCell align="center">
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    onClick={() => addToCart(part)}
                    disabled={part.quantity === 0}
                  >
                    Add to Order
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Fab
        color="secondary"
        aria-label="cart"
        style={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setIsCartOpen(true)}
      >
        <Badge badgeContent={cart.length} color="error">
          <ShoppingCartIcon />
        </Badge>
      </Fab>

      <CartDialog
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      cart={cart}
      purchaserDetails={purchaserDetails}
      handlePurchaserDetailsChange={handlePurchaserDetailsChange}
      updateCartItem={updateCartItem}
      removeFromCart={removeFromCart}
      calculateTotalAmount={calculateTotalAmount}
      handleCheckout={handleCheckout}
      spareParts={spareParts}
    />

      <Snackbar open={notification.open} autoHideDuration={4000} onClose={handleCloseNotification}>
        <MuiAlert onClose={handleCloseNotification} severity={notification.severity} variant="filled">
          {notification.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default SaleSparePart;