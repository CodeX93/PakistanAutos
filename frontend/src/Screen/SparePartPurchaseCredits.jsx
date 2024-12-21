import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import { 
  Payment as PaymentIcon, 
  Info as InfoIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useTheme } from '@emotion/react';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF } from "jspdf";
import logoData from '../Asset/Images/PakistanAutoLogo-bgRemoved.png';
import url from '../baseUrl';

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return `Rs. ${amount?.toFixed(2) || '0.00'}`;
};

// Details Modal Component
const DetailsModal = ({ credit }) => {
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
          Credit Purchase Details
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: "white",
              "&:hover": {
                color: "red",
                transform: "scale(1.1)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 3 }}>
          <Grid container spacing={3} justifyContent="center">
            {/* Supplier Information */}
            <Grid item xs={12}>
              <Card sx={{
                marginTop: 3,
                padding: 3,
                boxShadow: 3,
                borderRadius: 2,
                background: "#f5f5f5",
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#388e3c", fontWeight: "bold" }}>
                  Supplier Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                    <Typography>{credit.supplier?.name || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">CNIC</Typography>
                    <Typography>{credit.supplier?.cnic || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Contact</Typography>
                    <Typography>{credit.supplier?.contactNo || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography>{credit.supplier?.address || "N/A"}</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Products */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, background: "#f5f5f5" }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#388e3c", fontWeight: "bold" }}>
                  Products
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {credit.products?.map((product, index) => (
                        <TableRow key={index}>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>{`${product.category} - ${product.subCategory}`}</TableCell>
                          <TableCell align="right">{product.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(product.unitPrice)}</TableCell>
                          <TableCell align="right">{formatCurrency(product.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>

            {/* Payment Info */}
            <Grid item xs={12}>
              <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2, background: "#f5f5f5" }}>
                <Typography variant="h6" gutterBottom sx={{ color: "#388e3c", fontWeight: "bold" }}>
                  Payment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="textSecondary">Total Amount</Typography>
                    <Typography>{formatCurrency(credit.totalAmount)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="textSecondary">Pending Balance</Typography>
                    <Typography>{formatCurrency(credit.pendingBalance)}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="subtitle2" color="textSecondary">Promised Date</Typography>
                    <Typography>{formatDate(credit.promisedDate)}</Typography>
                  </Grid>
                </Grid>

                {credit.paymentsReceived?.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 3, mb: 2, color: "#388e3c", fontWeight: "bold" }}>
                      Payment History
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Mode</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {credit.paymentsReceived.map((payment, index) => (
                            <TableRow key={index}>
                              <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                              <TableCell>{formatCurrency(payment.paymentAmount)}</TableCell>
                              <TableCell>{payment.paymentMode}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Payment Modal Component
const PaymentModal = ({ open, onClose, selectedCredit, onSubmit }) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const paymentModes = ["Cash", "Cheque", "Online"];

  useEffect(() => {
    if (selectedCredit && open) {
      setPaymentAmount(selectedCredit.pendingBalance || "");
    }
  }, [selectedCredit, open]);

  const handleSubmit = () => {
    onSubmit({
      paymentAmount: Number(paymentAmount),
      paymentDate,
      paymentMode,
    });
    setIsConfirmDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          Make Payment
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₨</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  label="Payment Mode"
                >
                  {paymentModes.map(mode => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button
            onClick={() => setIsConfirmDialogOpen(true)}
            variant="contained"
            color="primary"
            disabled={!paymentAmount}
          >
            Submit Payment
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
      >
        <DialogTitle>Confirm Payment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to submit this payment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmDialogOpen(false)} color="inherit">
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
const SparePartPurchaseCredits = () => {
  const [credits, setCredits] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch(`${url}/sparepartCredit/`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      const pendingCredits = data.filter(credit => credit.pendingBalance > 0);
      setCredits(pendingCredits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const handleOpenPaymentModal = (credit) => {
    setSelectedCredit(credit);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedCredit(null);
  };

  const handleMakePayment = async (payment) => {
    if (!selectedCredit) return;
    try {
      const response = await fetch(`${url}/sparepartCredit/update/${selectedCredit.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      });

      if (!response.ok) throw new Error("Failed to update payment");
      await fetchCredits();
      handleClosePaymentModal();
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  const getTodayPendingPayments = () => {
    const today = new Date().toISOString().split("T")[0];
    return credits.filter(credit => {
      const promisedDate = new Date(credit.promisedDate).toISOString().split("T")[0];
      return promisedDate === today;
    });
  };

  const PaymentTable = ({ payments }) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              backgroundColor: theme.palette.grey[200] 
            }}>
              Supplier
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              backgroundColor: theme.palette.grey[200] 
            }}>
              Pending Balance
            </TableCell>
            <TableCell sx={{ 
              fontWeight: 'bold', 
              fontSize: '1.1rem', 
              backgroundColor: theme.palette.grey[200] 
            }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} align="center">
                <Typography color="textSecondary">
                  No pending payments found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            payments.map((credit, index) => (
              <TableRow key={index}>
                <TableCell>{credit.supplier?.name}</TableCell>
                <TableCell>{formatCurrency(credit.pendingBalance)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <DetailsModal credit={credit} />
                    <Button
                     variant="contained"
                     color="primary"
                     startIcon={<PaymentIcon />}
                     onClick={() => handleOpenPaymentModal(credit)}
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
     <Typography variant="h5" sx={{ mb: 3 }}>
       Purchase Credits
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
           payments={activeTab === 0 ? getTodayPendingPayments() : credits} 
         />
       </CardContent>
     </Card>

     <PaymentModal
       open={isPaymentModalOpen}
       onClose={handleClosePaymentModal}
       selectedCredit={selectedCredit}
       onSubmit={handleMakePayment}
     />
   </Box>
 );
};

export default SparePartPurchaseCredits;
