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



// Validate sale spare part data (including multiple products)
const validateSaleSparePartData = (data) => {
  const requiredFields = ['purchaserDetails', 'products'];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`${field} is required`);
    }
  }
  const requiredPurchaserFields = ['name', 'contactNo', 'cnic', 'address'];
  for (const field of requiredPurchaserFields) {
    if (!data.purchaserDetails[field]) {
      throw new Error(`Purchaser ${field} is required`);
    }
  }

  if (!Array.isArray(data.products) || data.products.length === 0) {
    throw new Error('At least one product must be added to the cart');
  }

  data.products.forEach((product, index) => {
    const requiredProductFields = [
      'productName',
      'category',
      'condition',
      'quantity',
      'unitPrice',
      'unitSellingPrice',
      'sellingDate'
    ];

    for (const field of requiredProductFields) {
      if (!product[field]) {
        throw new Error(`Product ${index + 1}: ${field} is required`);
      }
    }

    // Validate numeric fields
    if (isNaN(product.quantity) || product.quantity < 0) {
      throw new Error(`Product ${index + 1}: Quantity must be a non-negative number`);
    }
    if (isNaN(product.unitPrice) || product.unitPrice < 0) {
      throw new Error(`Product ${index + 1}: Unit price must be a non-negative number`);
    }
    if (isNaN(product.unitSellingPrice) || product.unitSellingPrice < 0) {
      throw new Error(`Product ${index + 1}: Unit selling price must be a non-negative number`);
    }
  });
};
const getNextBillCount = async () => {
  const MYDB = getFirestore();
  const billCounterRef = doc(MYDB, 'BillCounter', 'counter');

  try {
    const newBillCount = await runTransaction(MYDB, async (transaction) => {
      const billCounterDoc = await transaction.get(billCounterRef);

      if (!billCounterDoc.exists()) {
        // If document doesn't exist, create it with billCount set to 1
        transaction.set(billCounterRef, { billCount: 1 });
        return 1;
      } else {
        // Increment the billCount by 1
        const currentBillCount = billCounterDoc.data().billCount;
        const newBillCount = currentBillCount + 1;
        transaction.update(billCounterRef, { billCount: increment(1) });
        return newBillCount;
      }
    });

    return newBillCount;
  } catch (error) {
    console.error('Error getting next bill count:', error);
    throw new Error('Failed to get bill count');
  }
};

// Add sale spare part with incremented bill count
SaleSparePartRouter.post('/add', async (req, res) => {
  try {
    const saleData = req.body;
    
    // Validate input
    try {
      validateSaleSparePartData(saleData);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Get the next billCount from the BillCounter collection
    const nextBillCount = await getNextBillCount();

    // Prepare sale document data with products array and incremented billCount
    const saleDocData = {
      purchaserDetails: saleData.purchaserDetails,
      products: saleData.products, // All products saved in an array
      status: 'active',
      billCount: nextBillCount, // Assign the incremented billCount
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add the sale document to SaleSparePartInventory collection
    const docRef = await addDoc(collection(db, 'SaleSparePartInventory'), saleDocData);

    // Return response with the new document ID
    res.status(201).json({ 
      message: 'Sale spare parts added successfully',
      id: docRef.id 
    });
  } catch (error) {
    console.error('Error adding sale spare parts:', error);
    res.status(500).json({ error: 'Error adding sale spare parts' });
  }
});



// Update a sale spare part
SaleSparePartRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate input
    try {
      validateSaleSparePartData(updateData);
    } catch (validationError) {
      return res.status(400).json({ error: validationError.message });
    }

    // Check if the record exists
    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleSnapshot = await getDoc(saleRef);
    if (!saleSnapshot.exists()) {
      return res.status(404).json({ error: 'Sale spare part record not found' });
    }

    const updatedData = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    await updateDoc(saleRef, updatedData);
    res.status(200).json({ message: 'Sale spare part updated successfully' });
  } catch (error) {
    console.error('Error updating sale spare part:', error);
    res.status(500).json({ error: 'Error updating sale spare part' });
  }
});



// Delete a sale spare part (soft delete)
SaleSparePartRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the record exists
    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleSnapshot = await getDoc(saleRef);
    if (!saleSnapshot.exists()) {
      return res.status(404).json({ error: 'Sale spare part record not found' });
    }

    // Perform soft delete by updating status
    await updateDoc(saleRef, {
      status: 'deleted',
      updatedAt: serverTimestamp()
    });

    res.status(200).json({ message: 'Sale spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting sale spare part:', error);
    res.status(500).json({ error: 'Error deleting sale spare part' });
  }
});

// Fetch all sale spare parts
SaleSparePartRouter.get('/', async (req, res) => {
  try {
    const salesCollectionRef = collection(db, 'SaleSparePartInventory');
    const q = query(salesCollectionRef, where('status', '!=', 'deleted'));
    const querySnapshot = await getDocs(q);
    const sales = [];
    
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error('Error fetching sale spare parts:', error);
    res.status(500).json({ error: 'Error fetching sale spare parts' });
  }
});

// Fetch a sale spare part by ID
SaleSparePartRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleSnapshot = await getDoc(saleRef);

    if (!saleSnapshot.exists()) {
      return res.status(404).json({ error: 'Sale spare part record not found' });
    }

    if (saleSnapshot.data().status === 'deleted') {
      return res.status(404).json({ error: 'Sale spare part record not found' });
    }

    res.status(200).json({ id: saleSnapshot.id, ...saleSnapshot.data() });
  } catch (error) {
    console.error('Error fetching sale spare part:', error);
    res.status(500).json({ error: 'Error fetching sale spare part' });
  }
});

// Search sale spare parts by date range
SaleSparePartRouter.get('/search/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const salesCollectionRef = collection(db, 'SaleSparePartInventory');
    const q = query(
      salesCollectionRef,
      where('sellingDate', '>=', startDate),
      where('sellingDate', '<=', endDate),
      where('status', '!=', 'deleted')
    );
    
    const querySnapshot = await getDocs(q);
    const sales = [];
    
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error('Error searching sale spare parts:', error);
    res.status(500).json({ error: 'Error searching sale spare parts' });
  }
});

// Search sale spare parts by category
SaleSparePartRouter.get('/search/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const salesCollectionRef = collection(db, 'SaleSparePartInventory');
    const q = query(
      salesCollectionRef,
      where('category', '==', category),
      where('status', '!=', 'deleted')
    );
    
    const querySnapshot = await getDocs(q);
    const sales = [];
    
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(sales);
  } catch (error) {
    console.error('Error searching sale spare parts by category:', error);
    res.status(500).json({ error: 'Error searching sale spare parts by category' });
  }
});

// Update sale spare part status
SaleSparePartRouter.patch('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'completed', 'cancelled', 'deleted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const saleRef = doc(db, 'SaleSparePartInventory', id);
    const saleSnapshot = await getDoc(saleRef);

    if (!saleSnapshot.exists()) {
      return res.status(404).json({ error: 'Sale spare part record not found' });
    }

    await updateDoc(saleRef, {
      status,
      updatedAt: serverTimestamp()
    });

    res.status(200).json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating sale spare part status:', error);
    res.status(500).json({ error: 'Error updating sale spare part status' });
  }
});


SaleSparePartRouter.post('/revert/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Start Firestore transaction
    await runTransaction(db, async (transaction) => {
      const saleRef = doc(db, 'SaleSparePartInventory', id);
      const saleSnap = await transaction.get(saleRef);

      if (!saleSnap.exists()) {
        throw new Error('Sale record not found.');
      }

      const saleData = saleSnap.data();

      for (const product of saleData.products) {
        const { productName, category, quantity } = product;

        if (!productName || !category || !quantity || quantity <= 0) {
          console.error(`Invalid product data: ${JSON.stringify(product)}`);
          continue;
        }

        console.log(`Processing Product: ${productName}, Category: ${category}, Quantity: ${quantity}`);

        const inventoryRef = collection(db, 'SparePartInventory');
        const productQuery = query(
          inventoryRef,
          where('productName', '==', productName.trim()),
          where('category', '==', category.trim())
        );

        const productSnapshot = await getDocs(productQuery);

        if (productSnapshot.empty) {
          console.log(`Product ${productName} not found. Adding new entry.`);
          const newDocRef = doc(inventoryRef);
          transaction.set(newDocRef, {
            ...product,
            quantity,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          productSnapshot.docs.forEach((doc) => {
            console.log(`Updating product ${productName} with new quantity.`);
            transaction.update(doc.ref, {
              quantity: increment(quantity),
              updatedAt: serverTimestamp(),
            });
          });
        }
      }

      console.log('Deleting Sale Record:', id);
      transaction.delete(saleRef);
    });

    res.status(200).json({ message: 'Sale reverted and inventory updated successfully' });
  } catch (error) {
    console.error('Error reverting sale:', error);
    res.status(500).json({ error: 'Failed to revert sale' });
  }
});






export default SaleSparePartRouter;