import express from 'express';
import { db } from '../db.js';
import { getFirestore, runTransaction } from 'firebase/firestore';
import { 
  collection, 
  addDoc, 
  doc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  query, 
  where,
  serverTimestamp,
  increment 
} from 'firebase/firestore';

const SaleSparePartRouter = express.Router();

// Validation helpers
const validateSaleSparePartData = (data) => {
  if (!data) throw new Error('Sale data is required');

  // Check required main fields
  const mainFields = ['purchaserDetails', 'products'];
  mainFields.forEach(field => {
    if (!data[field]) throw new Error(`${field} is required`);
  });

  // Validate purchaser details
  const purchaserFields = ['name', 'contactNo', 'cnic', 'address'];
  purchaserFields.forEach(field => {
    if (!data.purchaserDetails[field]) {
      throw new Error(`Purchaser ${field} is required`);
    }
    if (typeof data.purchaserDetails[field] !== 'string' || 
        !data.purchaserDetails[field].trim()) {
      throw new Error(`Invalid purchaser ${field}`);
    }
  });

  // Validate products array
  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error('At least one product is required');
  }

  // Validate each product
  data.products.forEach((product, index) => {
    const productFields = [
      'productName',
      'category',
      'condition',
      'quantity',
      'unitPrice',
      'unitSellingPrice',
      'sellingDate'
    ];

    productFields.forEach(field => {
      if (!product[field]) {
        throw new Error(`Product ${index + 1}: ${field} is required`);
      }
    });

    // Validate numeric fields
    const numericFields = ['quantity', 'unitPrice', 'unitSellingPrice'];
    numericFields.forEach(field => {
      const value = parseFloat(product[field]);
      if (isNaN(value) || value < 0) {
        throw new Error(`Product ${index + 1}: ${field} must be a valid non-negative number`);
      }
    });

    // Validate dates
    if (!isValidDate(product.sellingDate)) {
      throw new Error(`Product ${index + 1}: Invalid selling date`);
    }
  });
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

// Get next bill number using transaction
const getNextBillCount = async () => {
  const MYDB = getFirestore();
  const billCounterRef = doc(MYDB, 'BillCounter', 'counter');

  try {
    const newBillCount = await runTransaction(MYDB, async (transaction) => {
      const counterDoc = await transaction.get(billCounterRef);

      if (!counterDoc.exists()) {
        transaction.set(billCounterRef, { billCount: 1 });
        return 1;
      }

      const currentCount = counterDoc.data().billCount;
      const nextCount = currentCount + 1;
      transaction.update(billCounterRef, { billCount: increment(1) });
      return nextCount;
    });

    return newBillCount;
  } catch (error) {
    console.error('Error getting next bill count:', error);
    throw new Error('Failed to generate bill number');
  }
};

// Add new sale
SaleSparePartRouter.post('/add', async (req, res) => {
  try {
    const saleData = req.body;
    

    // Validate input
    validateSaleSparePartData(saleData);

    // Get next bill number
    const billCount = await getNextBillCount();

    // Prepare sale document
    const saleDocument = {
      billCount,
      purchaserDetails: {
        name: saleData.purchaserDetails.name.trim(),
        contactNo: saleData.purchaserDetails.contactNo.trim(),
        cnic: saleData.purchaserDetails.cnic.trim(),
        address: saleData.purchaserDetails.address.trim()
      },
      products: saleData.products.map(product => ({
        ...product,
        productName: product.productName.trim(),
        category: product.category.trim(),
        condition: product.condition.trim(),
        quantity: parseInt(product.quantity),
        unitPrice: parseFloat(product.unitPrice),
        unitSellingPrice: parseFloat(product.unitSellingPrice),
        totalAmount: parseInt(product.quantity) * parseFloat(product.unitSellingPrice)
      })),
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalBillAmount: saleData.products.reduce((total, product) => 
        total + (parseInt(product.quantity) * parseFloat(product.unitSellingPrice)), 0)
    };

    // Save to database
    const docRef = await addDoc(collection(db, 'SaleSparePartInventory'), saleDocument);

    

    res.status(201).json({
      message: 'Sale record created successfully',
      id: docRef.id,
      billNumber: billCount
    });

  } catch (error) {
    console.error('Error creating sale record:', error);
    res.status(500).json({
      error: 'Failed to create sale record',
      details: error.message
    });
  }
});

// Get all sales
SaleSparePartRouter.get('/', async (req, res) => {
  try {
    const salesRef = collection(db, 'SaleSparePartInventory');
    const q = query(salesRef, where('status', '!=', 'deleted'));
    const querySnapshot = await getDocs(q);

    const sales = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({
      error: 'Failed to fetch sales records',
      details: error.message
    });
  }
});

// Get sale by ID
SaleSparePartRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleDoc = await getDoc(saleRef);

    if (!saleDoc.exists()) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    const data = saleDoc.data();
    if (data.status === 'deleted') {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    res.status(200).json({
      id: saleDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate()
    });

  } catch (error) {
    console.error('Error fetching sale record:', error);
    res.status(500).json({
      error: 'Failed to fetch sale record',
      details: error.message
    });
  }
});

// Update sale
SaleSparePartRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input
    validateSaleSparePartData(updateData);

    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleDoc = await getDoc(saleRef);

    if (!saleDoc.exists()) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    const updatedData = {
      purchaserDetails: {
        name: updateData.purchaserDetails.name.trim(),
        contactNo: updateData.purchaserDetails.contactNo.trim(),
        cnic: updateData.purchaserDetails.cnic.trim(),
        address: updateData.purchaserDetails.address.trim()
      },
      products: updateData.products.map(product => ({
        ...product,
        productName: product.productName.trim(),
        category: product.category.trim(),
        condition: product.condition.trim(),
        quantity: parseInt(product.quantity),
        unitPrice: parseFloat(product.unitPrice),
        unitSellingPrice: parseFloat(product.unitSellingPrice),
        totalAmount: parseInt(product.quantity) * parseFloat(product.unitSellingPrice)
      })),
      updatedAt: serverTimestamp(),
      totalBillAmount: updateData.products.reduce((total, product) => 
        total + (parseInt(product.quantity) * parseFloat(product.unitSellingPrice)), 0)
    };

    await updateDoc(saleRef, updatedData);

    res.status(200).json({
      message: 'Sale record updated successfully',
      id
    });

  } catch (error) {
    console.error('Error updating sale record:', error);
    res.status(500).json({
      error: 'Failed to update sale record',
      details: error.message
    });
  }
});

// Update status
SaleSparePartRouter.patch('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'completed', 'cancelled', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleDoc = await getDoc(saleRef);

    if (!saleDoc.exists()) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    await updateDoc(saleRef, {
      status,
      updatedAt: serverTimestamp()
    });

    res.status(200).json({
      message: 'Status updated successfully',
      id,
      newStatus: status
    });

  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      error: 'Failed to update status',
      details: error.message
    });
  }
});

// Delete (soft)
SaleSparePartRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleDoc = await getDoc(saleRef);

    if (!saleDoc.exists()) {
      return res.status(404).json({ error: 'Sale record not found' });
    }

    await updateDoc(saleRef, {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });

    res.status(200).json({
      message: 'Sale record deleted successfully',
      id
    });

  } catch (error) {
    console.error('Error deleting sale record:', error);
    res.status(500).json({
      error: 'Failed to delete sale record',
      details: error.message
    });
  }
});

// Revert sale
SaleSparePartRouter.post('/revert/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await runTransaction(db, async (transaction) => {
      const saleRef = doc(db, 'SaleSparePartInventory', id);
      const saleDoc = await transaction.get(saleRef);

      if (!saleDoc.exists()) {
        throw new Error('Sale record not found');
      }

      const saleData = saleDoc.data();

      // Process each product
      for (const product of saleData.products) {
        const { productName, category, quantity } = product;

        if (!productName || !category || !quantity || quantity <= 0) {
          console.error('Invalid product data:', product);
          continue;
        }

        

        // Find product in inventory
        const inventoryRef = collection(db, 'SparePartInventory');
        const productQuery = query(
          inventoryRef,
          where('productName', '==', productName.trim()),
          where('category', '==', category.trim())
        );

        const productSnapshot = await getDocs(productQuery);

        if (productSnapshot.empty) {
          // Create new inventory entry
          const newProductRef = doc(inventoryRef);
          transaction.set(newProductRef, {
            ...product,
            quantity,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          // Update existing inventory
          productSnapshot.docs.forEach(doc => {
            transaction.update(doc.ref, {
              quantity: increment(quantity),
              updatedAt: serverTimestamp()
            });
          });
        }
      }

      // Delete the sale record
      transaction.delete(saleRef);
    });

    res.status(200).json({
      message: 'Sale reverted successfully',
      id
    });

  } catch (error) {
    console.error('Error reverting sale:', error);
    res.status(500).json({
      error: 'Failed to revert sale',
      details: error.message
    });
  }
});

export default SaleSparePartRouter;