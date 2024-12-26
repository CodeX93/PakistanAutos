import express from 'express';
import axios from 'axios';

const LedgerRouter = express.Router();

// ============= Utility Functions =============

const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !isNaN(start) && !isNaN(end) && start <= end;
};

const makeRequest = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const validateRequest = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      error: true,
      message: {
        error: 'Missing parameters',
        details: 'Please provide both startDate and endDate.'
      }
    };
  }

  if (!validateDates(startDate, endDate)) {
    return {
      error: true,
      message: {
        error: 'Invalid date format',
        details: 'Please provide valid dates with startDate not greater than endDate.'
      }
    };
  }

  return { error: false };
};

// ============= Date Processing Functions =============

const filterByDateRange = (items = [], start, end, dateField) => {
  return items.filter(item => {
    try {
      const date = dateField === 'createdAt' || dateField === 'createdOn'
        ? new Date(item[dateField].seconds * 1000)
        : new Date(item[dateField]);
      return date >= start && date <= end;
    } catch (error) {
      console.error('Date filtering error:', error);
      return false;
    }
  });
};

// ============= Bike Calculation Functions =============

const calculateBikePurchaseAmount = (purchases = []) => {
  return purchases.reduce((sum, item) => {
    return sum + (Number(item.purchasePrice) || 0);
  }, 0);
};

const calculateBikeSaleAmount = (sales = []) => {
  return sales.reduce((sum, sale) => {
    return sum + (Number(sale.priceDetails?.sellingPrice) || 0);
  }, 0);
};

const calculateBikeProfit = (sales = []) => {
  return sales.reduce((sum, sale) => {
    return sum + (Number(sale.priceDetails?.profit) || 0);
  }, 0);
};

// ============= Spare Parts Functions =============

const filterPurchases = (purchases = [], start, end) => {
  return purchases.filter(purchase => {
    try {
      const purchaseDate = new Date(purchase.purchasedAt);
      return purchaseDate >= start && purchaseDate <= end;
    } catch (error) {
      return false;
    }
  });
};

const filterSales = (sales = [], start, end) => {
  return sales.filter(sale => {
    try {
      const saleDate = new Date(sale.createdAt.seconds * 1000);
      return saleDate >= start && saleDate <= end;
    } catch (error) {
      return false;
    }
  }).map(sale => enrichSaleData(sale));
};

const filterCreditPurchases = (creditPurchases = [], start, end) => {
  return creditPurchases.filter(purchase => {
    try {
      const purchaseDate = new Date(purchase.createdOn.seconds * 1000);
      return purchaseDate >= start && purchaseDate <= end;
    } catch (error) {
      return false;
    }
  });
};

const filterCreditSales = (creditSales = [], start, end) => {
  return creditSales.filter(sale => {
    try {
      const saleDate = new Date(sale.createdOn.seconds * 1000);
      return saleDate >= start && saleDate <= end;
    } catch (error) {
      return false;
    }
  });
};

// ============= Data Enrichment Functions =============

const enrichProductData = (product = {}) => {
  return {
    ...product,
    sellingDate: new Date(product.sellingDate).toISOString(),
    profit: calculateProfit(product),
    totalSellingPrice: calculateTotalSellingPrice(product),
    totalCost: calculateTotalCost(product)
  };
};

const enrichSaleData = (sale = {}) => {
  return {
    ...sale,
    products: (sale.products || []).map(product => enrichProductData(product))
  };
};

// ============= Financial Calculations =============

const calculateProfit = (product = {}) => {
  return ((Number(product.unitSellingPrice) || 0) - (Number(product.unitPrice) || 0)) * 
         (Number(product.quantity) || 0);
};

const calculateTotalSellingPrice = (product = {}) => {
  return (Number(product.unitSellingPrice) || 0) * (Number(product.quantity) || 0);
};

const calculateTotalCost = (product = {}) => {
  return (Number(product.unitPrice) || 0) * (Number(product.quantity) || 0);
};

const calculateSparePartTotalPurchaseAmount = (purchases = []) => {
  return purchases.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
};

const calculateSparePartCreditPurchaseAmount = (creditPurchases = []) => {
  return creditPurchases.reduce((sum, purchase) => {
    return sum + (purchase.products || []).reduce((prodSum, prod) => 
      prodSum + (Number(prod.total) || 0), 0);
  }, 0);
};

const calculateSparePartTotalSaleAmount = (sales = []) => {
  return sales.reduce((sum, sale) => {
    return sum + (sale.products || []).reduce((prodSum, prod) => 
      prodSum + calculateTotalSellingPrice(prod), 0);
  }, 0);
};

const calculateSparePartCreditSaleAmount = (creditSales = []) => {
  return creditSales.reduce((sum, sale) => 
    sum + (Number(sale.priceDetails?.totalAmount) || 0), 0);
};

const calculatePendingAmount = (creditPurchases = [], creditSales = []) => {
  const purchasePending = creditPurchases.reduce((sum, purchase) => 
    sum + (Number(purchase.pendingBalance) || 0), 0);
  const salesPending = creditSales.reduce((sum, sale) => 
    sum + (Number(sale.pendingBalance) || 0), 0);
  return { purchasePending, salesPending, total: purchasePending + salesPending };
};

const calculateReceivedAmount = (items = []) => {
  return items.reduce((sum, item) => {
    return sum + ((item.paymentsReceived || []).reduce((pSum, payment) => 
      pSum + (Number(payment.paymentAmount) || 0), 0));
  }, 0);
};

// ============= Statistical Functions =============

const countByType = (items = [], type) => {
  return items.filter(item => {
    const itemType = item.type || item.bikeDetails?.type;
    return itemType === type;
  }).length;
};

const calculateCategoryStats = (purchases = [], sales = []) => {
  const stats = {};
  [...purchases, ...sales].forEach(item => {
    const category = item.category?.name || 'Uncategorized';
    if (!stats[category]) {
      stats[category] = { count: 0, value: 0 };
    }
    stats[category].count++;
    stats[category].value += Number(item.totalPrice) || 0;
  });
  return stats;
};

const calculateConditionStats = (purchases = [], sales = []) => {
  const stats = {};
  [...purchases, ...sales].forEach(item => {
    const condition = item.condition || 'Unknown';
    if (!stats[condition]) {
      stats[condition] = { count: 0, value: 0 };
    }
    stats[condition].count++;
    stats[condition].value += Number(item.totalPrice) || 0;
  });
  return stats;
};

const analyzePaymentMethods = (creditSales = []) => {
  const methods = {};
  creditSales.forEach(sale => {
    (sale.paymentsReceived || []).forEach(payment => {
      const method = payment.paymentMode || 'Unknown';
      if (!methods[method]) {
        methods[method] = { count: 0, amount: 0 };
      }
      methods[method].count++;
      methods[method].amount += Number(payment.paymentAmount) || 0;
    });
  });
  return methods;
};
// Add these to the existing financial calculations section

// ============= Expense and Loan Calculations =============

const filterExpenses = (expenses = [], start, end) => {
  return expenses.filter(expense => {
    try {
      const expenseDate = new Date(expense.expenseDate);
      return expenseDate >= start && expenseDate <= end;
    } catch (error) {
      return false;
    }
  });
};

const filterLoans = (loans = [], start, end) => {
  return loans.filter(loan => {
    try {
      const loanDate = new Date(loan.loanDate);
      return loanDate >= start && loanDate <= end;
    } catch (error) {
      return false;
    }
  });
};

const calculateExpenseSummary = (expenses = []) => {
  const total = expenses.reduce((sum, expense) => sum + (Number(expense.expenseAmount) || 0), 0);
  
  // Group expenses by description
  const byCategory = expenses.reduce((acc, expense) => {
    const category = expense.itemDescription || 'Other';
    if (!acc[category]) {
      acc[category] = { count: 0, total: 0 };
    }
    acc[category].count++;
    acc[category].total += Number(expense.expenseAmount) || 0;
    return acc;
  }, {});

  return {
    totalExpenses: total,
    expenseCount: expenses.length,
    byCategory
  };
};

const calculateLoanSummary = (loans = []) => {
  const summary = {
    totalLoans: loans.reduce((sum, loan) => sum + (Number(loan.loanAmount) || 0), 0),
    totalPaid: loans.reduce((sum, loan) => sum + (Number(loan.paidAmount) || 0), 0),
    activeLoans: loans.filter(loan => loan.status === 'active').length,
    totalDue: loans.reduce((sum, loan) => sum + (Number(loan.totalDue) || 0), 0),
    byStatus: {
      active: 0,
      completed: 0
    }
  };

  // Calculate remaining amount
  summary.remainingAmount = summary.totalDue - summary.totalPaid;

  // Count by status
  loans.forEach(loan => {
    if (loan.status) {
      summary.byStatus[loan.status] = (summary.byStatus[loan.status] || 0) + 1;
    }
  });

  return summary;
};

// ============= Summary Calculations =============

const calculateBikeDetailedSummary = (purchases = [], sales = [], creditPurchases = [], creditSales = []) => {
  const summary = {
    totalTransactions: {
      purchases: purchases.length + creditPurchases.length,
      sales: sales.length + creditSales.length
    },
    financial: {
      totalPurchaseAmount: calculateBikePurchaseAmount(purchases) + 
                          calculateBikePurchaseAmount(creditPurchases),
      totalSaleAmount: calculateBikeSaleAmount(sales) + 
                      calculateBikeSaleAmount(creditSales),
      totalProfit: calculateBikeProfit(sales) + 
                  calculateBikeProfit(creditSales)
    },
    byType: {
      electric: countByType([...purchases, ...creditPurchases, ...sales, ...creditSales], 'Electric'),
      nonElectric: countByType([...purchases, ...creditPurchases, ...sales, ...creditSales], 'Non-Electric')
    },
    paymentStatus: {
      pendingAmount: calculatePendingAmount(creditPurchases, creditSales),
      receivedAmount: calculateReceivedAmount(creditSales) + calculateReceivedAmount(creditPurchases)
    }
  };

  if (summary.financial.totalSaleAmount > 0) {
    summary.financial.profitMargin = 
      ((summary.financial.totalProfit / summary.financial.totalSaleAmount) * 100).toFixed(2);
    summary.financial.averageTransactionValue = 
      (summary.financial.totalSaleAmount / summary.totalTransactions.sales).toFixed(2);
  } else {
    summary.financial.profitMargin = "0.00";
    summary.financial.averageTransactionValue = "0.00";
  }

  return summary;
};

const calculateSparePartSummary = (purchases = [], sales = [], creditPurchases = [], creditSales = []) => {
  return {
    transactions: {
      purchases: {
        count: purchases.length + creditPurchases.length,
        regularCount: purchases.length,
        creditCount: creditPurchases.length
      },
      sales: {
        count: sales.length + creditSales.length,
        regularCount: sales.length,
        creditCount: creditSales.length
      }
    },
    financial: {
      purchases: {
        total: calculateSparePartTotalPurchaseAmount(purchases) + 
               calculateSparePartCreditPurchaseAmount(creditPurchases),
        regular: calculateSparePartTotalPurchaseAmount(purchases),
        credit: calculateSparePartCreditPurchaseAmount(creditPurchases)
      },
      sales: {
        total: calculateSparePartTotalSaleAmount(sales) + 
               calculateSparePartCreditSaleAmount(creditSales),
        regular: calculateSparePartTotalSaleAmount(sales),
        credit: calculateSparePartCreditSaleAmount(creditSales)
      }
    },
    inventory: {
      byCategory: calculateCategoryStats(purchases, sales),
      byCondition: calculateConditionStats(purchases, sales)
    },
    creditStatus: {
      totalPendingAmount: calculatePendingAmount(creditPurchases, creditSales),
      paymentMethods: analyzePaymentMethods(creditSales)
    }
  };
};

// ============= Route Handlers =============

LedgerRouter.get('/bike', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const validation = validateRequest(startDate, endDate);
    if (validation.error) {
      return res.status(400).json(validation.message);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [purchaseResponse, saleResponse, creditPurchaseResponse, creditSaleResponse] = 
      await Promise.all([
        makeRequest('http://localhost:8942/bikeinventory/getAllInventory'),
        makeRequest('http://localhost:8942/bikeSaleinventory/getAllBikes'),
        makeRequest('http://localhost:8942/bikePurchaseCredit'),
        makeRequest('http://localhost:8942/BikeCreditBuy')
      ]).catch(error => {
        console.error('API request failed:', error);
        return [null, null, null, null];
      });

    const purchases = purchaseResponse?.inventory || [];
    const sales = saleResponse || [];
    const creditPurchases = creditPurchaseResponse || [];
    const creditSales = creditSaleResponse || [];

    const filteredData = {
      purchases: filterByDateRange(purchases, start, end, 'purchaseDate'),
      sales: filterByDateRange(sales, start, end, 'createdAt'),
      creditPurchases: filterByDateRange(creditPurchases, start, end, 'createdOn'),
      creditSales: filterByDateRange(creditSales, start, end, 'createdOn')
    };

    const summary = calculateBikeDetailedSummary(
      filteredData.purchases,
      filteredData.sales,
      filteredData.creditPurchases,
      filteredData.creditSales
    );

    res.json({ summary, details: filteredData });

  } catch (error) {
    handleError(error, res);
  }
});

LedgerRouter.get('/sparepart', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const validation = validateRequest(startDate, endDate);
    if (validation.error) {
      return res.status(400).json(validation.message);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [purchaseResponse, saleResponse, creditPurchaseResponse, creditSaleResponse] = 
      await Promise.all([
        makeRequest('http://localhost:8942/sparepart/'),
        makeRequest('http://localhost:8942/SparePartSaleinventory/'),
        makeRequest('http://localhost:8942/sparepartCredit/'),
        makeRequest('http://localhost:8942/SparePartCreditBuy/')
      ]).catch(error => {
        console.error('API request failed:', error);
        return [null, null, null, null];
      });

    const purchases = purchaseResponse || [];
    const sales = saleResponse || [];
    const creditPurchases = creditPurchaseResponse || [];
    const creditSales = creditSaleResponse || [];

    const filteredData = {
      purchases: filterPurchases(purchases, start, end),
      sales: filterSales(sales, start, end),
      creditPurchases: filterCreditPurchases(creditPurchases, start, end),
      creditSales: filterCreditSales(creditSales, start, end)
    };

    const summary = calculateSparePartSummary(
      filteredData.purchases,
      filteredData.sales,
      filteredData.creditPurchases,
      filteredData.creditSales
    );

    res.json({
      summary,
      details: filteredData
    });

  } catch (error) {
    handleError(error, res);
  }
});


/**
 * Get Expense Summary
 */
LedgerRouter.get('/expense', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const validation = validateRequest(startDate, endDate);
    if (validation.error) {
      return res.status(400).json(validation.message);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch expenses
    const expenseResponse = await makeRequest('http://localhost:8942/expense/getAllExpenses')
      .catch(error => {
        console.error('Failed to fetch expenses:', error);
        return null;
      });

    const expenses = expenseResponse?.expenses || [];
    const filteredExpenses = filterExpenses(expenses, start, end);
    const summary = calculateExpenseSummary(filteredExpenses);

    res.json({
      summary,
      details: {
        expenses: filteredExpenses
      }
    });

  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Get Loan Summary
 */
LedgerRouter.get('/loan', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const validation = validateRequest(startDate, endDate);
    if (validation.error) {
      return res.status(400).json(validation.message);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch loans
    const loanResponse = await makeRequest('http://localhost:8942/localCreditBuy/getAllLoans')
      .catch(error => {
        console.error('Failed to fetch loans:', error);
        return null;
      });

    const loans = loanResponse?.loans || [];
    const filteredLoans = filterLoans(loans, start, end);
    const summary = calculateLoanSummary(filteredLoans);

    res.json({
      summary,
      details: {
        loans: filteredLoans
      }
    });

  } catch (error) {
    handleError(error, res);
  }
});

/**
 * Get Combined Summary
 */
LedgerRouter.get('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const validation = validateRequest(startDate, endDate);
    if (validation.error) {
      return res.status(400).json(validation.message);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch all data
    const [bikeData, sparePartData, expenseData, loanData] = await Promise.all([
      makeRequest(`http://localhost:8942/ledger/bike?startDate=${startDate}&endDate=${endDate}`),
      makeRequest(`http://localhost:8942/ledger/sparepart?startDate=${startDate}&endDate=${endDate}`),
      makeRequest('http://localhost:8942/expense/getAllExpenses'),
      makeRequest('http://localhost:8942/localCreditBuy/getAllLoans')
    ]).catch(error => {
      console.error('API request failed:', error);
      return [null, null, null, null];
    });

    // Process expenses and loans
    const filteredExpenses = filterExpenses(expenseData?.expenses || [], start, end);
    const filteredLoans = filterLoans(loanData?.loans || [], start, end);

    // Calculate summaries
    const expenseSummary = calculateExpenseSummary(filteredExpenses);
    const loanSummary = calculateLoanSummary(filteredLoans);

    // Combine all summaries
    const combinedSummary = {
      bikes: bikeData?.summary || {},
      spareParts: sparePartData?.summary || {},
      expenses: expenseSummary,
      loans: loanSummary,
      overall: {
        totalProfit: (bikeData?.summary?.financial?.totalProfit || 0) + 
                    (sparePartData?.summary?.financial?.sales?.total || 0),
        totalExpenses: expenseSummary.totalExpenses,
        totalLoans: loanSummary.totalLoans,
        netBalance: ((bikeData?.summary?.financial?.totalProfit || 0) + 
                    (sparePartData?.summary?.financial?.sales?.total || 0)) - 
                    expenseSummary.totalExpenses
      }
    };

    res.json({
      summary: combinedSummary,
      details: {
        expenses: filteredExpenses,
        loans: filteredLoans
      }
    });

  } catch (error) {
    handleError(error, res);
  }
});

// ============= Error Handler =============

const handleError = (error, res) => {
  console.error('Error in ledger operation:', error);
  
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      error: 'Service unavailable',
      details: 'Unable to connect to the database service.'
    });
  }
  
  if (error.code === 'ERR_BAD_REQUEST') {
    return res.status(400).json({
      error: 'Bad request',
      details: 'The request was malformed or contained invalid parameters.'
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    details: 'An unexpected error occurred while processing your request.'
  });
};

// Calculate performance statistics for spare parts
const calculateProductPerformance = (sales = []) => {
  const performance = {};
  
  sales.forEach(sale => {
    (sale.products || []).forEach(product => {
      const productName = product.productName || 'Unknown Product';
      
      if (!performance[productName]) {
        performance[productName] = {
          totalSold: 0,
          revenue: 0,
          profit: 0
        };
      }
      
      performance[productName].totalSold += Number(product.quantity) || 0;
      performance[productName].revenue += calculateTotalSellingPrice(product);
      performance[productName].profit += calculateProfit(product);
    });
  });
  
  return performance;
};

export default LedgerRouter;