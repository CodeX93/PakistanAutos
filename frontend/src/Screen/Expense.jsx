import React, { useEffect, useState } from 'react';
import { Button, Modal, Backdrop, Fade, Box, Typography, TextField } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Alert, Snackbar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import ExpenseCard from '../Components/ExpenseCard';
import axios from 'axios';
import url from '../baseUrl';


export default function Expense() {
  const [data, setData] = useState({ today: [], weekly: [], monthly: [] });
  const [filter, setFilter] = useState('today');
  const [totals, setTotals] = useState({ today: 0, weekly: 0, monthly: 0 });

  // Modal states
  const [open, setOpen] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  
  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Update states
  const [updateId, setUpdateId] = useState('');
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateDesc, setUpdateDesc] = useState('');
  
  // Alert states
  const [alert, setAlert] = useState({ open: false, message: '', type: 'success' });

    useEffect(() => {
    fetchExpenses();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ open: true, message, type });
  };

  const fetchExpenses = async () => {
    try {
      const [todayRes, weeklyRes, monthlyRes] = await Promise.all([
        axios.post(`${url}/expense/today`),
        axios.post(`${url}/expense/weekly`),
        axios.post(`${url}/expense/monthly`)
      ]);

      setData({
        today: todayRes.data.expenses,
        weekly: weeklyRes.data.expenses,
        monthly: monthlyRes.data.expenses
      });

      setTotals({
        today: todayRes.data.total,
        weekly: weeklyRes.data.total,
        monthly: monthlyRes.data.total
      });
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error fetching expenses', 'error');
    }
  };

  const handleAddExpense = async () => {
    
    try {
      
      await axios.post(`${url}/expense/add`, {
        itemDescription,
        expenseAmount: Number(expenseAmount),
        expenseDate
      });
      
      showAlert('Expense added successfully');
      setOpen(false);
      resetAddForm();
      fetchExpenses();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error adding expense', 'error');
    }
  };

  const handleUpdateExpense = async () => {
    try {
      await axios.put(`${url}/expense/update/${updateId}`, {
        itemDescription: updateDesc,
        expenseAmount: Number(updateAmount)
      });
      
      showAlert('Expense updated successfully');
      setOpenUpdateModal(false);
      fetchExpenses();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error updating expense', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`${url}/expense/delete/${id}`, {
      });
      
      showAlert('Expense deleted successfully');
      fetchExpenses();
    } catch (error) {
      showAlert(error.response?.data?.message || 'Error deleting expense', 'error');
    }
  };

  const resetAddForm = () => {
    setExpenseAmount('');
    setItemDescription('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
  };

  const handleOpenUpdateModal = (expense) => {
    setUpdateId(expense.id);
    setUpdateAmount(expense.expenseAmount);
    setUpdateDesc(expense.itemDescription);
    setOpenUpdateModal(true);
  };

  const showDataInTable = () => {
    const expenses = data[filter];
    return expenses.map((expense, index) => (
      <TableRow key={expense.id}>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{expense.itemDescription}</TableCell>
        <TableCell>Rs.{expense.expenseAmount}</TableCell>
        <TableCell>{new Date(expense.expenseDate).toDateString()}</TableCell>
        <TableCell>
          <Button 
            variant="contained" 
            color="success" 
            startIcon={<SyncAltIcon />} 
            sx={{ mr: 1 }} 
            onClick={() => handleOpenUpdateModal(expense)}
          >
            Update
          </Button>
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={() => handleDeleteExpense(expense.id)}
          >
            Delete
          </Button>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div style={{ width: '80%' }}>
          <Typography variant="h4" gutterBottom>My Expenses</Typography>
          
          <Box display="flex" mt={4} mb={4} gap={4}>
            <ExpenseCard expenses={data.today.slice(0, 5)} title="Today's Expenses" total={totals.today} />
            <ExpenseCard expenses={data.weekly.slice(0, 5)} title="Weekly Expenses" total={totals.weekly} />
            <ExpenseCard expenses={data.monthly.slice(0, 5)} title="Monthly Expenses" total={totals.monthly} />
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
              Add Expense
            </Button>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="select-label">Show Expenses</InputLabel>
              <Select
                labelId="select-label"
                value={filter}
                label="Show Expenses"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="today">Today's Expenses</MenuItem>
                <MenuItem value="weekly">Weekly Expenses</MenuItem>
                <MenuItem value="monthly">Monthly Expenses</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {showDataInTable()}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Add Expense Modal */}
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
          >
            <Fade in={open}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Add New Expense
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Description"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    type="date"
                    label="Date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddExpense}
                    disabled={!itemDescription || !expenseAmount}
                  >
                    Add Expense
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          {/* Update Expense Modal */}
          <Modal
            open={openUpdateModal}
            onClose={() => setOpenUpdateModal(false)}
            closeAfterTransition
            BackdropComponent={Backdrop}
          >
            <Fade in={openUpdateModal}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}>
                <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                  Update Expense
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Description"
                    value={updateDesc}
                    onChange={(e) => setUpdateDesc(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={updateAmount}
                    onChange={(e) => setUpdateAmount(e.target.value)}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    onClick={handleUpdateExpense}
                    disabled={!updateDesc || !updateAmount}
                  >
                    Update Expense
                  </Button>
                </Box>
              </Box>
            </Fade>
          </Modal>

          {/* Alert Snackbar */}
          <Snackbar
            open={alert.open}
            autoHideDuration={6000}
            onClose={() => setAlert({ ...alert, open: false })}
          >
            <Alert severity={alert.type} sx={{ width: '100%' }}>
              {alert.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </>
  );
}