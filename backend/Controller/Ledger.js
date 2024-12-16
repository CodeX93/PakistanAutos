import express from 'express';
import axios from 'axios';

const LedgerRouter = express.Router();

// Utility function to validate dates
const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !isNaN(start) && !isNaN(end) && start <= end;
};

// Utility function to handle API requests with retries
const makeRequest = async (url, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
};

LedgerRouter.get('/bike', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate required parameters
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing parameters',
        details: 'Please provide both startDate and endDate.'
      });
    }

    // Validate date format and range
    if (!validateDates(startDate, endDate)) {
      return res.status(400).json({
        error: 'Invalid date format',
        details: 'Please provide valid dates with startDate not greater than endDate.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch data with retry mechanism
    const [purchaseResponse, saleResponse] = await Promise.all([
      makeRequest('http://localhost:8942/bikeinventory/getAllInventory'),
      makeRequest('http://localhost:8942/bikeSaleinventory/')
    ]);

    const purchases = purchaseResponse.inventory || [];
    const sales = saleResponse || [];

    // Filter purchases
    const filteredPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchaseDate);
      return purchaseDate >= start && purchaseDate <= end;
    });

    // Filter sales
    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt.seconds * 1000);
      return saleDate >= start && saleDate <= end;
    });

    // Calculate summary statistics
    const summary = {
      totalPurchases: filteredPurchases.length,
      totalSales: filteredSales.length,
      totalPurchaseAmount: filteredPurchases.reduce((sum, item) => sum + (item.purchasePrice || 0), 0),
      totalSaleAmount: filteredSales.reduce((sum, item) => sum + (item.priceDetails?.sellingPrice || 0), 0),
      totalProfit: filteredSales.reduce((sum, item) => sum + (item.priceDetails?.profit || 0), 0)
    };

    res.json({
      purchases: filteredPurchases,
      sales: filteredSales,
      summary
    });

  } catch (error) {
    console.error('Error fetching bike ledger data:', error);
    
    // Handle specific error types
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
  }
});

// Similar improvements for spare parts endpoint...
LedgerRouter.get('/sparepart', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing parameters',
        details: 'Please provide both startDate and endDate.'
      });
    }

    if (!validateDates(startDate, endDate)) {
      return res.status(400).json({
        error: 'Invalid date format',
        details: 'Please provide valid dates with startDate not greater than endDate.'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [purchaseResponse, saleResponse] = await Promise.all([
      makeRequest('http://localhost:8942/sparepart/'),
      makeRequest('http://localhost:8942/SparePartSaleinventory/')
    ]);

    const purchases = purchaseResponse || [];
    const sales = saleResponse || [];

    const filteredPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchasedAt);
      return purchaseDate >= start && purchaseDate <= end;
    });

    const filteredSales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt.seconds * 1000);
      return saleDate >= start && saleDate <= end;
    }).map(sale => ({
      ...sale,
      products: sale.products.map(product => ({
        ...product,
        sellingDate: new Date(product.sellingDate).toISOString(),
        profit: (product.unitSellingPrice - product.unitPrice) * product.quantity,
        totalSellingPrice: product.unitSellingPrice * product.quantity,
        totalCost: product.unitPrice * product.quantity
      }))
    }));

    const summary = {
      totalPurchases: filteredPurchases.length,
      totalSales: filteredSales.length,
      totalPurchaseAmount: filteredPurchases.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
      totalSaleAmount: filteredSales.reduce((sum, sale) => 
        sum + sale.products.reduce((prodSum, prod) => 
          prodSum + (prod.unitSellingPrice * prod.quantity), 0), 0),
      totalProfit: filteredSales.reduce((sum, sale) => 
        sum + sale.products.reduce((prodSum, prod) => 
          prodSum + ((prod.unitSellingPrice - prod.unitPrice) * prod.quantity), 0), 0)
    };

    res.json({
      purchases: filteredPurchases,
      sales: filteredSales,
      summary
    });

  } catch (error) {
    console.error('Error fetching spare parts ledger data:', error);
    
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
  }
});

export default LedgerRouter;