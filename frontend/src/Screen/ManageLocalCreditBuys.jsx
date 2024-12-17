import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  Fade,
  Backdrop,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SearchIcon from '@mui/icons-material/Search';
import url from '../baseUrl';

const ContainerStyled = styled(Box)(({ theme }) => ({
  backgroundColor: '#fff',
  padding: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
  maxWidth: '1200px',
  width: '95%',
  margin: 'auto',
  marginTop: theme.spacing(4),
}));

const API_BASE_URL = `${url}/localCreditBuy`;

export default function LoanManagement() {
  // State management
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openRefundModal, setOpenRefundModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  

  // Form states
  const [newLoan, setNewLoan] = useState({
    name: '',
    loanAmount: '',
    promisedDate: '',
    loanDate: new Date().toISOString().split('T')[0]
  });

  const [refundDetails, setRefundDetails] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Cash' // Added default payment mode
  });

  // API calls
  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/getAllLoans`);
      if (!response.ok) throw new Error('Failed to fetch loans');
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      setError('Failed to fetch loans: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = async () => {
    if (!newLoan.name || !newLoan.loanAmount || !newLoan.promisedDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/addLoan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loan: {
            name: newLoan.name,
            loanAmount: parseFloat(newLoan.loanAmount),
            promisedDate: newLoan.promisedDate,
            loanDate: newLoan.loanDate
          }
        })
      });

      if (!response.ok) throw new Error('Failed to add loan');
      
      setSuccessMessage('Loan added successfully');
      setOpenAddModal(false);
      fetchLoans();
    } catch (error) {
      setError('Failed to add loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRefund = async () => {
    if (!refundDetails.amount || !refundDetails.paymentMode) {
      setError('Please fill in all required fields');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/addPayment/${selectedLoan.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment: {
            amount: parseFloat(refundDetails.amount),
            date: refundDetails.date,
            paymentMode: refundDetails.paymentMode
          }
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add payment');
      }
      
      const data = await response.json();
      setSuccessMessage(data.message || 'Payment recorded successfully');
      setOpenRefundModal(false);
      fetchLoans();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLoan = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/deleteLoan/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete loan');
      
      setSuccessMessage('Loan deleted successfully');
      fetchLoans();
    } catch (error) {
      setError('Failed to delete loan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchTerm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/searchLoans?name=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Failed to search loans');
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      setError('Failed to search loans: ' + error.message);
    }
  };

  // Event handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleNewLoanChange = (e) => {
    const { name, value } = e.target;
    setNewLoan(prev => ({ ...prev, [name]: value }));
  };

  const handleRefundChange = (e) => {
    const { name, value } = e.target;
    setRefundDetails(prev => ({ ...prev, [name]: value }));
  };

  // Modal handlers
  const handleOpenAddModal = () => {
    setNewLoan({
      name: '',
      loanAmount: '',
      promisedDate: '',
      loanDate: new Date().toISOString().split('T')[0]
    });
    setOpenAddModal(true);
  };

  const handleOpenEditModal = (loan) => {
    setSelectedLoan(loan);
    setOpenEditModal(true);
  };

  const handleOpenRefundModal = (loan) => {
    setSelectedLoan(loan);
    setRefundDetails({
      amount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setOpenRefundModal(true);
  };

  // Calculations
  const totalPendingAmount = loans.reduce((sum, loan) => 
    sum + (loan.totalDue - loan.paidAmount), 0
  );

  // Effects
  useEffect(() => {
    fetchLoans();
    return () => clearTimeout(window.searchTimeout);
  }, []);

  return (
    <ContainerStyled>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }} color="primary">
          Loan Management System
        </Typography>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Summary Card */}
      <Card sx={{ mb: 4, backgroundColor: '#f8f9fa' }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography color="textSecondary" gutterBottom>
                Total Pending Amount
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                ${totalPendingAmount.toLocaleString()}
              </Typography>
            </Box>
            <AccountBalanceWalletIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          </Box>
        </CardContent>
      </Card>

      {/* Search and Add */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <TextField
          placeholder="Search by name"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddModal}
          disabled={loading}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': { backgroundColor: 'primary.dark' }
          }}
        >
          Add New Loan
        </Button>
      </Box>

      {/* Loans Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Loan Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Total Due</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Paid Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Remaining</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Promise Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No loans found
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan) => (
                <TableRow key={loan.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell>{loan.name}</TableCell>
                  <TableCell>${loan.loanAmount.toLocaleString()}</TableCell>
                  <TableCell>${loan.totalDue.toLocaleString()}</TableCell>
                  <TableCell>${loan.paidAmount.toLocaleString()}</TableCell>
                  <TableCell>${(loan.totalDue - loan.paidAmount).toLocaleString()}</TableCell>
                  <TableCell>{loan.promisedDate}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditModal(loan)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="success"
                      onClick={() => handleOpenRefundModal(loan)}
                      disabled={loading}
                    >
                      <PaymentsOutlinedIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteLoan(loan.id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Loan Modal */}
      <Modal
        open={openAddModal}
        onClose={() => !loading && setOpenAddModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
      >
        <Fade in={openAddModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>Add New Loan</Typography>
            <Divider sx={{ mb: 3 }} />
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={newLoan.name}
                onChange={handleNewLoanChange}
                fullWidth
                required
                disabled={loading}
              />
              <TextField
                label="Loan Amount"
                name="loanAmount"
                type="number"
                value={newLoan.loanAmount}
                onChange={handleNewLoanChange}
                fullWidth
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                label="Promise Date"
                name="promisedDate"
                type="date"
                value={newLoan.promisedDate}
                onChange={handleNewLoanChange}
                fullWidth
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setOpenAddModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleAddLoan}
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Loan'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* View/Edit Modal */}
      <Modal
        open={openEditModal}
        onClose={() => !loading && setOpenEditModal(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
      >
        <Fade in={openEditModal}>
          <Box sx={modalStyle}>
            <Typography variant="h6" sx={{ mb: 2 }}>Loan Details</Typography>
            <Divider sx={{ mb: 3 }} />
            {selectedLoan && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography><strong>Name:</strong> {selectedLoan.name}</Typography>
                <Typography><strong>Loan Amount:</strong> ${selectedLoan.loanAmount.toLocaleString()}</Typography>
                <Typography><strong>Total Due:</strong> ${selectedLoan.totalDue.toLocaleString()}</Typography>
                <Typography><strong>Paid Amount:</strong> ${selectedLoan.paidAmount.toLocaleString()}</Typography>
                <Typography><strong>Remaining:</strong> ${(selectedLoan.totalDue - selectedLoan.paidAmount).toLocaleString()}</Typography>
                <Typography><strong>Loan Date:</strong> {selectedLoan.loanDate}</Typography>
                <Typography><strong>Promise Date:</strong> {selectedLoan.promisedDate}</Typography>
                
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Payment History</Typography>
                <TableContainer component={Paper}>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Date</TableCell>
        <TableCell>Payment Mode</TableCell>
        <TableCell align="right">Amount</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {selectedLoan.payments && selectedLoan.payments.length > 0 ? (
        selectedLoan.payments.map((payment, index) => (
          <TableRow key={index}>
            <TableCell>{payment.date}</TableCell>
            <TableCell>{payment.paymentMode}</TableCell>
            <TableCell align="right">${payment.amount.toLocaleString()}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={3} align="center">
            No payments recorded
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <Button
                    variant="contained"
                    onClick={() => setOpenEditModal(false)}
                    disabled={loading}
                  >
                    Close
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Refund Modal */}
<Modal
  open={openRefundModal}
  onClose={() => !loading && setOpenRefundModal(false)}
  closeAfterTransition
  BackdropComponent={Backdrop}
>
  <Fade in={openRefundModal}>
    <Box sx={modalStyle}>
      <Typography variant="h6" sx={{ mb: 2 }}>Add Payment</Typography>
      <Divider sx={{ mb: 3 }} />
      {selectedLoan && (
        <Box>
          <Typography sx={{ mb: 2 }}>
            Adding payment for loan to: <strong>{selectedLoan.name}</strong>
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Remaining amount: <strong>${(selectedLoan.totalDue - selectedLoan.paidAmount).toLocaleString()}</strong>
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Payment Amount"
              name="amount"
              type="number"
              value={refundDetails.amount}
              onChange={handleRefundChange}
              fullWidth
              required
              disabled={loading}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            <TextField
              select
              label="Payment Mode"
              name="paymentMode"
              value={refundDetails.paymentMode}
              onChange={handleRefundChange}
              fullWidth
              required
              disabled={loading}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Cheque">Cheque</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
            </TextField>
            <TextField
              label="Payment Date"
              name="date"
              type="date"
              value={refundDetails.date}
              onChange={handleRefundChange}
              fullWidth
              disabled={loading}
              InputLabelProps={{ shrink: true }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setOpenRefundModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddRefund}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Add Payment'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  </Fade>
</Modal>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccessMessage('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Global Loading Overlay */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </ContainerStyled>
  );
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '600px',
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  padding: '24px',
  maxHeight: '90vh',
  overflow: 'auto'
};