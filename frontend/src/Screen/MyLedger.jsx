// File: FinancialDashboard/index.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Collapse,
  IconButton,
  useTheme,
  useMediaQuery,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  DirectionsBike as BikeIcon,
  Build as ToolIcon,
} from '@mui/icons-material';
import url from '../baseUrl';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#388e3c',
      light: '#4caf50',
      dark: '#2e7d32',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
});

// Utility functions
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }
  return new Date(timestamp).toLocaleString();
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Initial state structure
const initialState = {
  bikes: {
    purchases: [],
    sales: [],
    creditPurchases: [],
    creditSales: [],
  },
  spareParts: {
    purchases: [],
    sales: [],
    creditPurchases: [],
    creditSales: [],
  },
  expenses: [],
  loans: [],
  summary: null,
};

// Generic Card Component
const StatCard = ({ title, value, icon: Icon, subtitle = null, color = "primary" }) => {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ my: 1, fontWeight: 'bold', color: `${color}.main` }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Icon sx={{ fontSize: 40, color: theme.palette[color].main, opacity: 0.7 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Search and Filter Component
const Filters = ({ searchTerm, setSearchTerm, startDate, setStartDate, endDate, setEndDate, placeholder }) => (
  <Grid container spacing={2} sx={{ mb: 4 }}>
    <Grid item xs={12} md={6}>
      <TextField
        fullWidth
        placeholder={placeholder}
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
        }}
      />
    </Grid>
    <Grid item xs={12} md={6}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

// Loading Component
const LoadingSpinner = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
    <CircularProgress />
  </Box>
);

// Empty State Component
const EmptyState = ({ message }) => (
  <Box sx={{ textAlign: 'center', py: 4 }}>
    <Typography color="textSecondary">{message}</Typography>
  </Box>
);
// Detail Components for Bikes and Spare Parts

// Vehicle Information component
const VehicleInformation = ({ data }) => (
  <Grid item xs={12} md={4}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      Vehicle Information
    </Typography>
    <Box sx={{ mt: 1 }}>
      <Typography>
        Chassis: {data.bikeDetails?.chassisNumber || data.chassisNumber}
      </Typography>
      <Typography>
        Condition: {data.bikeDetails?.condition || data.condition}
      </Typography>
      <Typography>
        Mileage: {data.bikeDetails?.mileage || data.mileage}
      </Typography>
      <Typography>
        Manufacturer: {data.bikeDetails?.manufacturer || data.manufacturer}
      </Typography>
      <Typography>
        Model: {data.bikeDetails?.model || data.model}
      </Typography>
      {data.type === 'sale' && data.registrationDetails?.registrationNo && (
        <Typography>
          Registration: {data.registrationDetails.registrationNo}
        </Typography>
      )}
    </Box>
  </Grid>
);

// Price Details component
const PriceDetails = ({ data }) => (
  <Grid item xs={12} md={4}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      {data.type === 'sale' ? 'Price Details' : 'Purchase Details'}
    </Typography>
    <Box sx={{ mt: 1 }}>
      {data.type === 'sale' ? (
        <>
          <Typography>
            Selling Price: {formatCurrency(data.priceDetails?.sellingPrice)}
          </Typography>
          <Typography color="success.main">
            Profit: {formatCurrency(data.priceDetails?.profit)}
          </Typography>
          <Typography>
            Cash Paid: {formatCurrency(data.priceDetails?.cashPaid)}
          </Typography>
          <Typography>
            Online Paid: {formatCurrency(data.priceDetails?.onlinePaid)}
          </Typography>
          {data.priceDetails?.chequePaid > 0 && (
            <Typography>
              Cheque Paid: {formatCurrency(data.priceDetails?.chequePaid)}
            </Typography>
          )}
          {data.priceDetails?.remaining > 0 && (
            <Typography color="error">
              Remaining: {formatCurrency(data.priceDetails?.remaining)}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography>
            Purchase Price: {formatCurrency(data.purchasePrice)}
          </Typography>
          {data.creditDetails && (
            <>
              <Typography>
                Paid Amount: {formatCurrency(data.creditDetails.paidAmount)}
              </Typography>
              <Typography color="error">
                Remaining: {formatCurrency(data.creditDetails.remainingAmount)}
              </Typography>
            </>
          )}
        </>
      )}
    </Box>
  </Grid>
);

// Contact Information component
const ContactInformation = ({ data }) => (
  <Grid item xs={12} md={4}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      {data.type === 'sale' ? 'Client Information' : 'Seller Information'}
    </Typography>
    <Box sx={{ mt: 1 }}>
      {data.type === 'sale' ? (
        <>
          <Typography>
            Name: {data.registrationDetails?.client?.fullName}
          </Typography>
          <Typography>
            Phone: {data.registrationDetails?.client?.phoneNumber}
          </Typography>
          <Typography>
            Address: {data.registrationDetails?.client?.address}
          </Typography>
          <Typography>
            CNIC: {data.registrationDetails?.client?.idCardNo}
          </Typography>
        </>
      ) : (
        <>
          <Typography>
            Name: {data.sellerInfo?.name}
          </Typography>
          <Typography>
            Phone: {data.sellerInfo?.contactNo}
          </Typography>
          <Typography>
            Address: {data.sellerInfo?.address}
          </Typography>
          <Typography>
            CNIC: {data.sellerInfo?.cnic}
          </Typography>
        </>
      )}
    </Box>
  </Grid>
);

// Payment History component
const PaymentHistory = ({ payments }) => (
  <Grid item xs={12}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      Payment History
    </Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Mode</TableCell>
            <TableCell>Reference</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments?.map((payment, index) => (
            <TableRow key={index}>
              <TableCell>{formatDateTime(payment.date)}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{payment.paymentMode}</TableCell>
              <TableCell>{payment.reference || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Grid>
);

// Spare Part Product Information
const ProductInformation = ({ data }) => (
  <Grid item xs={12} md={6}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      Product Information
    </Typography>
    <Box sx={{ mt: 1 }}>
      {data.type === 'sale' ? (
        data.products?.map((product, index) => (
          <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography>Product: {product.productName}</Typography>
            <Typography>Category: {product.category}</Typography>
            <Typography>Quantity: {product.quantity}</Typography>
            <Typography>Unit Price: {formatCurrency(product.unitSellingPrice)}</Typography>
            <Typography>Total: {formatCurrency(product.unitSellingPrice * product.quantity)}</Typography>
            <Typography color="success.main">
              Profit: {formatCurrency((product.unitSellingPrice - product.unitPrice) * product.quantity)}
            </Typography>
          </Box>
        ))
      ) : (
        <>
          <Typography>Category: {data.category}</Typography>
          <Typography>Sub-Category: {data.subCategory}</Typography>
          <Typography>Condition: {data.condition}</Typography>
          <Typography>Quantity: {data.quantity}</Typography>
          <Typography>Unit Price: {formatCurrency(data.unitPrice)}</Typography>
          <Typography>Total: {formatCurrency(data.totalPrice)}</Typography>
          <Typography>Location: {data.warehouseLocation}</Typography>
        </>
      )}
    </Box>
  </Grid>
);

// Spare Part Contact Information
const SparePartContactInfo = ({ data }) => (
  <Grid item xs={12} md={6}>
    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
      {data.type === 'sale' ? 'Purchaser Information' : 'Supplier Information'}
    </Typography>
    <Box sx={{ mt: 1 }}>
      {data.type === 'sale' ? (
        <>
          <Typography>Name: {data.purchaserDetails?.name}</Typography>
          <Typography>Contact: {data.purchaserDetails?.contactNo}</Typography>
          <Typography>Address: {data.purchaserDetails?.address}</Typography>
          <Typography>CNIC: {data.purchaserDetails?.cnic}</Typography>
        </>
      ) : (
        <>
          <Typography>Name: {data.supplier?.name}</Typography>
          <Typography>Contact: {data.supplier?.contact}</Typography>
          <Typography>Address: {data.supplier?.address}</Typography>
          <Typography>CNIC: {data.supplier?.cnic}</Typography>
        </>
      )}
    </Box>
  </Grid>
);
// Bike Row Component
const BikeRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(row.createdAt)}</TableCell>
        <TableCell>
          <Chip
            label={row.type === 'sale' ? 'Sale' : 'Purchase'}
            color={row.type === 'sale' ? 'success' : 'primary'}
            variant="outlined"
          />
          {row.creditDetails && (
            <Chip
              label="Credit"
              color="warning"
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </TableCell>
        <TableCell>
          {(row.bikeDetails?.manufacturer || row.manufacturer)} {(row.bikeDetails?.model || row.model)}
        </TableCell>
        <TableCell align="right">
          {formatCurrency(row.type === 'sale' ? row.priceDetails?.sellingPrice : row.purchasePrice)}
        </TableCell>
        {!isMobile && (
          <TableCell>
            {row.type === 'sale'
              ? row.registrationDetails?.client?.fullName
              : row.sellerInfo?.name}
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transaction Details
              </Typography>
              <Grid container spacing={2}>
                <VehicleInformation data={row} />
                <PriceDetails data={row} />
                <ContactInformation data={row} />
                {row.creditDetails && row.creditDetails.payments && (
                  <PaymentHistory payments={row.creditDetails.payments} />
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Spare Part Row Component
const SparePartRow = ({ row }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(row.createdAt || row.purchasedAt)}</TableCell>
        <TableCell>
          <Chip
            label={row.type === 'sale' ? 'Sale' : 'Purchase'}
            color={row.type === 'sale' ? 'success' : 'primary'}
            variant="outlined"
          />
          {row.creditDetails && (
            <Chip
              label="Credit"
              color="warning"
              variant="outlined"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </TableCell>
        <TableCell>{row.productName || row.products?.[0]?.productName}</TableCell>
        <TableCell align="right">
          {row.type === 'sale' 
            ? formatCurrency(row.products?.reduce((sum, p) => sum + (p.unitSellingPrice * p.quantity), 0))
            : formatCurrency(row.totalPrice)}
        </TableCell>
        {!isMobile && (
          <TableCell>
            {row.type === 'sale'
              ? row.purchaserDetails?.name
              : row.supplier?.name}
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Transaction Details
              </Typography>
              <Grid container spacing={2}>
                <ProductInformation data={row} />
                <SparePartContactInfo data={row} />
                {row.creditDetails && row.creditDetails.payments && (
                  <PaymentHistory payments={row.creditDetails.payments} />
                )}
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Expense Row Component
const ExpenseRow = ({ expense }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(expense.expenseDate)}</TableCell>
        <TableCell>{expense.itemDescription}</TableCell>
        <TableCell align="right">{formatCurrency(expense.expenseAmount)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>Expense Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2">
                    ID: {expense.id}
                  </Typography>
                  <Typography variant="body2">
                    Description: {expense.itemDescription}
                  </Typography>
                  <Typography variant="body2">
                    Amount: {formatCurrency(expense.expenseAmount)}
                  </Typography>
                  <Typography variant="body2">
                    Date: {formatDateTime(expense.expenseDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

// Loan Row Component
const LoanRow = ({ loan }) => {
  const [open, setOpen] = useState(false);
  const remainingAmount = loan.totalDue - loan.paidAmount;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{loan.name}</TableCell>
        <TableCell>{formatDateTime(loan.loanDate)}</TableCell>
        <TableCell align="right">{formatCurrency(loan.loanAmount)}</TableCell>
        <TableCell align="right">{formatCurrency(loan.paidAmount)}</TableCell>
        <TableCell align="right">{formatCurrency(remainingAmount)}</TableCell>
        <TableCell>
          <Chip 
            label={loan.status}
            color={loan.status === 'active' ? 'warning' : 'success'}
            variant="outlined"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom>Loan Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    Loan Date: {formatDateTime(loan.loanDate)}
                  </Typography>
                  <Typography variant="body2">
                    Due Date: {formatDateTime(loan.promisedDate)}
                  </Typography>
                  <Typography variant="body2">
                    Total Due: {formatCurrency(loan.totalDue)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Payment History</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Recorded At</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loan.payments?.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell>{formatDateTime(payment.date)}</TableCell>
                          <TableCell align="right">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>{formatDateTime(payment.recordedAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
//Summary Components and Data Processing

// Summary Cards Component for Overall Statistics
const OverallSummaryCards = ({ summaryData }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 2 }}>
      <Grid item xs={12} sm={6} md={2}>
        <StatCard
          title="Total Profit"
          value={formatCurrency(summaryData.overall.totalProfit)}
          icon={TrendingUpIcon}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Expenses"
          value={formatCurrency(summaryData.overall.totalExpenses)}
          icon={ReceiptIcon}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Loans"
          value={formatCurrency(summaryData.overall.totalLoans)}
          icon={CreditCardIcon}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Net Balance"
          value={formatCurrency(summaryData.overall.netBalance)}
          icon={MoneyIcon}
          color="primary"
        />
      </Grid>
    </Grid>
  );
};

// Summary Cards Component for Bikes
const BikesSummaryCards = ({ data }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Transactions"
          value={`${data.totalTransactions.purchases + data.totalTransactions.sales}`}
          subtitle={`${data.totalTransactions.purchases} Purchases, ${data.totalTransactions.sales} Sales`}
          icon={BikeIcon}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.financial.totalSaleAmount)}
          icon={TrendingUpIcon}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Profit Margin"
          value={`${data.financial.profitMargin}%`}
          subtitle={`Avg. Transaction: ${formatCurrency(data.financial.averageTransactionValue)}`}
          icon={TrendingUpIcon}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pending Amount"
          value={formatCurrency(data.paymentStatus.pendingAmount.total)}
          subtitle={`Received: ${formatCurrency(data.paymentStatus.receivedAmount)}`}
          icon={CreditCardIcon}
          color="warning"
        />
      </Grid>
    </Grid>
  );
};

// Summary Cards Component for Spare Parts
const SparePartsSummaryCards = ({ data }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Transactions"
          value={`${data.transactions.purchases.count + data.transactions.sales.count}`}
          subtitle={`${data.transactions.purchases.count} Purchases, ${data.transactions.sales.count} Sales`}
          icon={ToolIcon}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Purchase Value"
          value={formatCurrency(data.financial.purchases.total)}
          subtitle={`Regular: ${data.transactions.purchases.regularCount}, Credit: ${data.transactions.purchases.creditCount}`}
          icon={MoneyIcon}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Sales Value"
          value={formatCurrency(data.financial.sales.total)}
          subtitle={`Regular: ${data.transactions.sales.regularCount}, Credit: ${data.transactions.sales.creditCount}`}
          icon={TrendingUpIcon}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Pending Amount"
          value={formatCurrency(data.creditStatus.totalPendingAmount.total)}
          icon={CreditCardIcon}
          color="warning"
        />
      </Grid>
    </Grid>
  );
};

// Summary Cards Component for Expenses
const ExpensesSummaryCards = ({ expenses }) => {
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.expenseAmount || 0), 0);
  const categoryCounts = expenses.reduce((acc, exp) => {
    acc[exp.itemDescription] = (acc[exp.itemDescription] || 0) + 1;
    return acc;
  }, {});

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={ReceiptIcon}
          color="error"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Total Transactions"
          value={expenses.length}
          icon={ReceiptIcon}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Average Expense"
          value={formatCurrency(totalExpenses / (expenses.length || 1))}
          icon={ReceiptIcon}
        />
      </Grid>
    </Grid>
  );
};

// Summary Cards Component for Loans
const LoansSummaryCards = ({ loans }) => {
  const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
  const totalPaidAmount = loans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0);
  const totalRemaining = loans.reduce((sum, loan) => sum + ((loan.totalDue - loan.paidAmount) || 0), 0);
  const activeLoans = loans.filter(loan => loan.status === 'active').length;

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Loans"
          value={formatCurrency(totalLoanAmount)}
          subtitle={`${loans.length} Total Loans`}
          icon={CreditCardIcon}
          color="primary"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Paid Amount"
          value={formatCurrency(totalPaidAmount)}
          icon={MoneyIcon}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Remaining Amount"
          value={formatCurrency(totalRemaining)}
          icon={CreditCardIcon}
          color="warning"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Loans"
          value={activeLoans}
          subtitle={`${loans.length - activeLoans} Completed`}
          icon={CreditCardIcon}
          color="error"
        />
      </Grid>
    </Grid>
  );
};

// Data Processing Functions
const calculateTotals = (data, type) => {
  switch(type) {
    case 'bikes':
      return {
        totalPurchases: data.filter(item => item.type === 'purchase').length,
        totalSales: data.filter(item => item.type === 'sale').length,
        totalProfit: data
          .filter(item => item.type === 'sale')
          .reduce((sum, item) => sum + parseFloat(item.priceDetails?.profit || 0), 0),
        totalPendingAmount: data.reduce((sum, item) => {
          if (item.creditDetails) {
            return sum + (item.creditDetails.remainingAmount || 0);
          }
          return sum;
        }, 0)
      };
    
    case 'spareParts':
      return {
        totalPurchases: data.filter(item => item.type === 'purchase').length,
        totalSales: data.filter(item => item.type === 'sale').length,
        totalProfit: data
          .filter(item => item.type === 'sale')
          .reduce((sum, sale) => {
            return sum + (sale.products || []).reduce((prodSum, prod) => 
              prodSum + ((prod.unitSellingPrice - prod.unitPrice) * prod.quantity), 0);
          }, 0),
        totalPendingAmount: data.reduce((sum, item) => {
          if (item.creditDetails) {
            return sum + (item.creditDetails.remainingAmount || 0);
          }
          return sum;
        }, 0)
      };

    default:
      return {};
  }
};

// Payment Method Summary calculation
const calculatePaymentTotals = (data) => {
  return data.reduce((totals, item) => {
    if (item.type === 'sale') {
      totals.cash += Number(item.priceDetails?.cashPaid || 0);
      totals.online += Number(item.priceDetails?.onlinePaid || 0);
      totals.cheque += Number(item.priceDetails?.chequePaid || 0);
    }
    
    if (item.creditDetails?.payments) {
      item.creditDetails.payments.forEach(payment => {
        const amount = Number(payment.amount || 0);
        switch (payment.paymentMode?.toLowerCase()) {
          case 'cash':
            totals.cash += amount;
            break;
          case 'online':
            totals.online += amount;
            break;
          case 'cheque':
            totals.cheque += amount;
            break;
          default:
            break;
        }
      });
    }
    
    return totals;
  }, { cash: 0, online: 0, cheque: 0 });
};
// Main Dashboard Component
const FinancialDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State Management
  const [summaryData, setSummaryData] = useState(null);
  const [ledgerData, setLedgerData] = useState({
    bikes: { purchases: [], sales: [], creditPurchases: [], creditSales: [] },
    spareParts: { purchases: [], sales: [], creditPurchases: [], creditSales: [] }
  });
  const [expenses, setExpenses] = useState([]);
  const [loans, setLoans] = useState([]);
  const [activeTab, setActiveTab] = useState('bikes');
  const [transactionType, setTransactionType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryResponse, bikesResponse, sparePartsResponse, expensesResponse, loansResponse] = await Promise.all([
        fetch(`${url}/ledger/summary?startDate=${startDate}&endDate=${endDate}`),
        fetch(`${url}/ledger/bike?startDate=${startDate}&endDate=${endDate}`),
        fetch(`${url}/ledger/sparepart?startDate=${startDate}&endDate=${endDate}`),
        fetch(`${url}/expense/getAllExpenses`),
        fetch(`${url}/localCreditBuy/getAllLoans`)
      ]);

      if (!summaryResponse.ok || !bikesResponse.ok || !sparePartsResponse.ok || 
          !expensesResponse.ok || !loansResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [summaryData, bikesData, sparePartsData, expensesData, loansData] = await Promise.all([
        summaryResponse.json(),
        bikesResponse.json(),
        sparePartsResponse.json(),
        expensesResponse.json(),
        loansResponse.json()
      ]);

      setSummaryData(summaryData.summary);
      setLedgerData({
        bikes: {
          purchases: bikesData.details?.purchases || [],
          sales: bikesData.details?.sales || [],
          creditPurchases: bikesData.details?.creditPurchases || [],
          creditSales: bikesData.details?.creditSales || []
        },
        spareParts: {
          purchases: sparePartsData.details?.purchases || [],
          sales: sparePartsData.details?.sales || [],
          creditPurchases: sparePartsData.details?.creditPurchases || [],
          creditSales: sparePartsData.details?.creditSales || []
        }
      });
      setExpenses(expensesData.expenses || []);
      setLoans(loansData.loans || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter data based on active tab and search term
  const filteredData = useMemo(() => {
    if (activeTab === 'expenses') {
      return expenses.filter(expense =>
        expense.itemDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === 'loans') {
      return loans.filter(loan =>
        loan.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    let combined = [];
    const currentData = ledgerData[activeTab];
    
    if (transactionType === 'all' || transactionType === 'purchases') {
      const purchases = [...(currentData.purchases || []), ...(currentData.creditPurchases || [])]
        .map(p => ({...p, type: 'purchase'}));
      combined = [...combined, ...purchases];
    }
    
    if (transactionType === 'all' || transactionType === 'sales') {
      const sales = [...(currentData.sales || []), ...(currentData.creditSales || [])]
        .map(s => ({...s, type: 'sale'}));
      combined = [...combined, ...sales];
    }

    return combined.filter(item => {
      const searchLower = searchTerm.toLowerCase();
      if (activeTab === 'bikes') {
        return (
          (item.model || '').toLowerCase().includes(searchLower) ||
          (item.manufacturer || '').toLowerCase().includes(searchLower) ||
          (item.chassisNumber || '').toLowerCase().includes(searchLower) ||
          (item.type === 'sale' 
            ? (item.registrationDetails?.client?.fullName || '').toLowerCase().includes(searchLower)
            : (item.sellerInfo?.name || '').toLowerCase().includes(searchLower))
        );
      } else {
        return (
          (item.productName || '').toLowerCase().includes(searchLower) ||
          (item.category || '').toLowerCase().includes(searchLower) ||
          (item.type === 'sale'
            ? (item.purchaserDetails?.name || '').toLowerCase().includes(searchLower)
            : (item.supplier?.name || '').toLowerCase().includes(searchLower))
        );
      }
    });
  }, [ledgerData, activeTab, transactionType, searchTerm, expenses, loans]);

  // Get search placeholder based on active tab
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'bikes':
        return "Search by model, manufacturer, chassis number or client/seller name...";
      case 'spareParts':
        return "Search by product name, category or supplier/purchaser name...";
      case 'expenses':
        return "Search by expense description...";
      case 'loans':
        return "Search by name...";
      default:
        return "Search...";
    }
  };

  // Render appropriate summary cards based on active tab
  const renderSummaryCards = () => {
    if (!summaryData) return null;

    switch (activeTab) {
      case 'bikes':
        return <BikesSummaryCards data={summaryData.bikes} />;
      case 'spareParts':
        return <SparePartsSummaryCards data={summaryData.spareParts} />;
      case 'expenses':
        return <ExpensesSummaryCards expenses={expenses} />;
      case 'loans':
        return <LoansSummaryCards loans={loans} />;
      default:
        return null;
    }
  };

  // Render table content based on active tab
  const renderTableContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              {getTableHeaders()}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={getColSpan()} align="center">
                  <Typography color="textSecondary">No records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => renderRow(row))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Get table headers based on active tab
  const getTableHeaders = () => {
    switch (activeTab) {
      case 'bikes':
        return (
          <>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Vehicle</TableCell>
            <TableCell align="right">Amount</TableCell>
            {!isMobile && <TableCell>Client/Seller</TableCell>}
          </>
        );
      case 'spareParts':
        return (
          <>
            <TableCell>Date</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Product</TableCell>
            <TableCell align="right">Amount</TableCell>
            {!isMobile && <TableCell>Purchaser/Supplier</TableCell>}
          </>
        );
      case 'expenses':
        return (
          <>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell align="right">Amount</TableCell>
          </>
        );
      case 'loans':
        return (
          <>
            <TableCell>Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Loan Amount</TableCell>
            <TableCell align="right">Paid Amount</TableCell>
            <TableCell align="right">Remaining</TableCell>
            <TableCell>Status</TableCell>
          </>
        );
      default:
        return null;
    }
  };

  // Get column span for empty state message
  const getColSpan = () => {
    switch (activeTab) {
      case 'bikes':
        return isMobile ? 5 : 6;
      case 'spareParts':
        return isMobile ? 5 : 6;
      case 'expenses':
        return 4;
      case 'loans':
        return 7;
      default:
        return 1;
    }
  };

  // Render appropriate row component based on active tab
  const renderRow = (row) => {
    switch (activeTab) {
      case 'bikes':
        return <BikeRow key={row.id} row={row} />;
      case 'spareParts':
        return <SparePartRow key={row.id} row={row} />;
      case 'expenses':
        return <ExpenseRow key={row.id} expense={row} />;
      case 'loans':
        return <LoanRow key={row.id} loan={row} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">Financial Dashboard</Typography>
            <Tooltip title="Refresh data">
              <IconButton onClick={fetchAllData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Overall Summary */}
          {summaryData && <OverallSummaryCards summaryData={summaryData} />}

          {/* Main Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => {
              setActiveTab(newValue);
              setTransactionType('all');
              setSearchTerm('');
            }}
            sx={{ mb: 3 }}
          >
            <Tab label="Bikes" value="bikes" />
            <Tab label="Spare Parts" value="spareParts" />
            <Tab label="Expenses" value="expenses" />
            <Tab label="Loans" value="loans" />
          </Tabs>

          {/* Section Summary */}
          {renderSummaryCards()}

          {/* Filters */}
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            placeholder={getSearchPlaceholder()}
          />

          {/* Transaction Type Tabs for Bikes and Spare Parts */}
          {['bikes', 'spareParts'].includes(activeTab) && (
            <Tabs
              value={transactionType}
              onChange={(_, newValue) => setTransactionType(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              <Tab label="All" value="all" />
              <Tab label="Purchases" value="purchases" />
              <Tab label="Sales" value="sales" />
            </Tabs>
          )}

          {/* Main Content */}
          {renderTableContent()}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default FinancialDashboard;