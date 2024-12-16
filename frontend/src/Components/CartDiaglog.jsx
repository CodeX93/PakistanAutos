import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Paper,
  TextField,
  Divider,
  Box,
  Button,
  IconButton,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SparePartCreditBuyModal from './SparePartCreditBuyModal'; // Import the modal component


const CartDialog = ({
  isOpen,
  onClose,
  cart,
  purchaserDetails,
  handlePurchaserDetailsChange,
  updateCartItem,
  removeFromCart,
  calculateTotalAmount,
  handleCheckout,
  spareParts,
}) => {
  const [isSparePartModalOpen, setIsSparePartModalOpen] = useState(false);
  const handleOpenSparePartModal = () => setIsSparePartModalOpen(true);

  const handleCloseSparePartModal = () => setIsSparePartModalOpen(false);

  // Check if all purchaser details and cart items are valid
  const isFormValid = () => {
    const purchaserFieldsFilled = Object.values(purchaserDetails).every(
      (field) => field.trim() !== ''
    );

    const cartFieldsFilled = cart.every(
      (item) =>
        item.quantity > 0 &&
        item.sellingDate &&
        item.unitSellingPrice > 0
    );

    return purchaserFieldsFilled && cartFieldsFilled;
  };

  return (
    <>

    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Typography variant="h5" style={{ fontWeight: 'bold' }}>
          Order Details
        </Typography>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        <Grid container spacing={4}>
          {/* Purchaser Details Section */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                style={{ fontWeight: 'bold', color: '#279508' }}
              >
                Purchaser Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <TextField
                fullWidth
                margin="normal"
                label="Purchaser Name"
                name="name"
                value={purchaserDetails.name}
                onChange={handlePurchaserDetailsChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="normal"
                label="Contact No"
                name="contactNo"
                value={purchaserDetails.contactNo}
                onChange={handlePurchaserDetailsChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="normal"
                label="CNIC"
                name="cnic"
                value={purchaserDetails.cnic}
                onChange={handlePurchaserDetailsChange}
                variant="outlined"
              />
              <TextField
                fullWidth
                margin="normal"
                label="Address"
                name="address"
                value={purchaserDetails.address}
                onChange={handlePurchaserDetailsChange}
                variant="outlined"
                multiline
              />
            </Paper>
          </Grid>

          {/* Order Items Section */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                style={{ fontWeight: 'bold', color: '#279508' }}
              >
                Order Items
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ maxHeight: '50vh', overflowY: 'auto', pr: 2 }}>
                {cart.map((item, index) => (
                  <Paper
                    key={index}
                    elevation={1}
                    sx={{
                      p: 3,
                      mb: 2,
                      backgroundColor: '#fafafa',
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box>
                        <Typography variant="h6" color="primary">
                          {item.productName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Category: {item.category} | Condition: {item.condition}
                        </Typography>
                      </Box>
                      <IconButton
                        onClick={() => removeFromCart(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Quantity"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartItem(index, 'quantity', e.target.value)}
                          inputProps={{
                            min: 1,
                            max: spareParts.find((part) => part.id === item.id)?.quantity || 0,
                          }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          type="date"
                          label="Selling Date"
                          value={item.sellingDate}
                          onChange={(e) => updateCartItem(index, 'sellingDate', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Purchase Unit Price"
                          value={item.unitPrice}
                          disabled
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          label="Selling Unit Price"
                          type="number"
                          value={item.unitSellingPrice}
                          onChange={(e) =>
                            updateCartItem(index, 'unitSellingPrice', parseFloat(e.target.value))
                          }
                          inputProps={{ min: 0, step: 0.01 }}
                          variant="outlined"
                          InputProps={{
                            startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                        Item Total: Rs. {item.total.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>

              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3, // Add margin-top for spacing from the previous content
                  border: '1px solid #e0e0e0',
                }}
              >
                <Typography variant="h6">Total Amount</Typography>
                <Typography
                  variant="h5"
                  color="primary"
                  style={{ fontWeight: 'bold' }}
                >
                  Rs. {calculateTotalAmount().toFixed(2)}
                </Typography>
              </Paper>


            </Paper>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          size="large"
          sx={{
            '&:hover': {
              backgroundColor: '#f5f5f5',
              color: '#000',
            },
          }}
        >
          Continue Shopping
        </Button>
        <Button
          onClick={handleOpenSparePartModal}
          variant="contained"
          color="success"
          size="large"
          disabled={!isFormValid()}
          sx={{
            '&:hover': {
              backgroundColor: '#4aeb52',
            },
          }}
        >
          Sell On Credit
        </Button>
        <Button
          onClick={handleCheckout}
          variant="contained"
          color="primary"
          size="large"
          disabled={!isFormValid()}
          sx={{
            '&:hover': {
              backgroundColor: '#1976d2',
            },
          }}
        >
          Checkout
        </Button>
      </DialogActions>
    </Dialog>
     <SparePartCreditBuyModal
     open={isSparePartModalOpen}
     onClose={handleCloseSparePartModal}
     purchaserDetails={purchaserDetails}
     products={cart}
     totalAmount={calculateTotalAmount()}
   />
   </>

  );
};

export default CartDialog;
