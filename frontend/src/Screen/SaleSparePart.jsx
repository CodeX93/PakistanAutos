import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Fab, Badge, Paper, Snackbar, Box, useTheme, InputAdornment,
  CircularProgress
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import MuiAlert from '@mui/material/Alert';
import CartDialog from '../Components/CartDiaglog';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

const SaleSparePart = () => {
  const theme = useTheme();
  const [spareParts, setSpareParts] = useState([]);
  const [filteredSpareParts, setFilteredSpareParts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [purchaserDetails, setPurchaserDetails] = useState({
    name: '',
    contactNo: '',
    cnic: '',
    address: ''
  });
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSpareParts();
  }, []);

  useEffect(() => {
    filterSpareParts();
  }, [searchTerm, spareParts]);

  const filterSpareParts = () => {
    const filtered = spareParts.filter(part =>
      part.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.subCategory?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSpareParts(filtered);
  };

  const fetchSpareParts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${url}/sparepart/`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid data format received');
      
      setSpareParts(data);
      setFilteredSpareParts(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      setError(error.message);
      showNotification('Failed to fetch spare parts', 'error');
      setSpareParts([]);
      setFilteredSpareParts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const addToCart = (sparePart) => {
    if (!sparePart.quantity || sparePart.quantity <= 0) {
      showNotification('Product out of stock', 'error');
      return;
    }

    const existingItem = cart.find(item => item.id === sparePart.id);
    if (existingItem) {
      if (existingItem.quantity >= sparePart.quantity) {
        showNotification('Maximum available quantity reached', 'warning');
        return;
      }

      const updatedCart = cart.map(item => 
        item.id === sparePart.id
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
        unitSellingPrice: sparePart.unitPrice,
        total: sparePart.unitPrice,
        category: sparePart.category.name,
        subCategory: sparePart.subCategory.name
      }]);
    }
    showNotification('Added to cart');
  };

  const updateCartItem = (index, field, value) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const item = { ...updatedCart[index] };
      const originalItem = spareParts.find(part => part.id === item.id);

      if (field === 'quantity') {
        const newQuantity = Math.max(1, Math.min(
          parseInt(value) || 0,
          originalItem?.quantity || 0
        ));
        item.quantity = newQuantity;
        item.total = newQuantity * item.unitSellingPrice;
      } else if (field === 'unitSellingPrice') {
        const newPrice = Math.max(0, parseFloat(value) || 0);
        item.unitSellingPrice = newPrice;
        item.total = item.quantity * newPrice;
      }

      updatedCart[index] = item;
      return updatedCart;
    });
  };

  const removeFromCart = (index) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
    showNotification('Removed from cart', 'warning');
  };

  const handleCheckout = async () => {
    if (!validatePurchaserDetails()) return;
    if (cart.length === 0) {
      showNotification('Cart is empty', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // First update quantities
      await Promise.all(cart.map(item =>
        fetch(`${url}/sparepart/decreaseQuantity/${item.productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity })
        }).then(res => {
          if (!res.ok) throw new Error(`Failed to update quantity for ${item.productName}`);
        })
      ));

      // Then create sale record
      const saleData = {
        products: cart.map(item => ({
          productName: item.productName,
          category: item.category,
          subCategory: item.subCategory,
          condition: item.condition,
          quantity: item.quantity,
          unitPrice: item.purchaseUnitPrice,
          unitSellingPrice: item.unitSellingPrice,
          sellingDate: item.sellingDate,
          warranty: item.warranty || ''
        })),
        purchaserDetails
      };

      const saleResponse = await fetch(`${url}/SparePartSaleinventory/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });

      if (!saleResponse.ok) throw new Error('Failed to create sale record');

      const result = await saleResponse.json();
      showNotification('Sale completed successfully');
      generateInvoice(saleData);
      
      // Reset state
      setCart([]);
      setIsCartOpen(false);
      await fetchSpareParts();

    } catch (error) {
      console.error('Checkout Error:', error);
      showNotification(error.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const validatePurchaserDetails = () => {
    const requiredFields = ['name', 'contactNo', 'cnic', 'address'];
    const missingFields = requiredFields.filter(field => !purchaserDetails[field]);
    
    if (missingFields.length > 0) {
      showNotification(`Please fill in: ${missingFields.join(', ')}`, 'error');
      return false;
    }
    return true;
  };

  const generateInvoice = (requestBody) => {
    if (!requestBody) return;
  
    const doc = new jsPDF();
    const margin = 15;
    const spacing = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let currentY = margin;
  
    const { products, purchaserDetails } = requestBody;
  
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
    products.forEach((product, index) => {
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        my: 3
      }}>
        <Typography variant="h4" fontWeight="bold">
          Spare Parts Inventory
        </Typography>

        <TextField
          variant="outlined"
          placeholder="Search spare parts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 350 }}
        />
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" my={4}>
          {error}
        </Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 10 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Product Name
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Sub Category
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Condition
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Available Quantity
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Unit Price
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', bgcolor: theme.palette.grey[200] }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSpareParts.map((part) => (
                <TableRow key={part.id} hover>
                  <TableCell>{part.productName}</TableCell>
                  <TableCell>{part.category.name}</TableCell>
                  <TableCell>{part.subCategory.name}</TableCell>
                  <TableCell>{part.condition}</TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>Rs. {part.unitPrice.toFixed(2)}</TableCell>
                  <TableCell>
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
      )}

      <Fab
        color="secondary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
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
        handlePurchaserDetailsChange={(e) => setPurchaserDetails(prev => ({
          ...prev,
          [e.target.name]: e.target.value
        }))}
        updateCartItem={updateCartItem}
        removeFromCart={removeFromCart}
        calculateTotalAmount={() => cart.reduce((total, item) => total + item.total, 0)}
        handleCheckout={handleCheckout}
        isProcessing={isProcessing}
        spareParts={spareParts}
      />

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={notification.severity}
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default SaleSparePart;