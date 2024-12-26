import express from 'express';
import { db } from '../db.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

const SparePartRouter = express.Router();

// Validation helper functions
const isValidString = (str) => typeof str === 'string' && str.trim().length > 0;
const isValidNumber = (num) => !isNaN(parseFloat(num)) && isFinite(num) && parseFloat(num) > 0;

const isValidFormData = (formData) => {
  return formData && 
         isValidString(formData.bikeType) &&
         isValidString(formData.categoryId) &&
         isValidString(formData.subCategoryId) &&
         isValidString(formData.supplierId);
};

const isValidProduct = (product) => {
  return product && 
         isValidString(product.productName) && 
         isValidString(product.condition) && 
         isValidString(product.warehouseLocation) && 
         isValidNumber(product.unitPrice) && 
         isValidNumber(product.quantity) &&
         isValidNumber(product.total) &&
         typeof product.warranty === 'string';
};

// Add spare parts
SparePartRouter.post('/addSparePart', async (req, res) => {
  try {
    const { formData, products } = req.body;
    

    // Form data validation
    if (!formData) {
      return res.status(400).json({
        error: 'Form data is required',
        received: formData
      });
    }

    // Individual field validation
    const requiredFields = ['bikeType', 'categoryId', 'subCategoryId', 'supplierId'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missingFields,
        received: formData
      });
    }

    // Products validation
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        error: 'Products must be a non-empty array',
        received: products
      });
    }

    // Validate individual products
    const productValidationErrors = products.map((product, index) => {
      const errors = [];
      if (!product.productName?.trim()) errors.push('Product name is required');
      if (!product.condition?.trim()) errors.push('Condition is required');
      if (!product.warehouseLocation?.trim()) errors.push('Warehouse location is required');
      if (!product.unitPrice || isNaN(product.unitPrice) || product.unitPrice <= 0) {
        errors.push('Valid unit price is required');
      }
      if (!product.quantity || isNaN(product.quantity) || product.quantity <= 0) {
        errors.push('Valid quantity is required');
      }
      if (!product.total || isNaN(product.total) || product.total <= 0) {
        errors.push('Valid total is required');
      }
      return errors.length > 0 ? { index, errors } : null;
    }).filter(error => error !== null);

    if (productValidationErrors.length > 0) {
      return res.status(400).json({
        error: 'Invalid product data',
        details: productValidationErrors
      });
    }

    try {
      // Get referenced documents
      const [categoryDoc, subCategoryDoc, supplierDoc] = await Promise.all([
        getDoc(doc(db, 'categories', formData.categoryId)),
        getDoc(doc(db, 'subCategories', formData.subCategoryId)),
        getDoc(doc(db, 'sparePartSellers', formData.supplierId))
      ]);

      // Validate references
      if (!categoryDoc.exists()) {
        return res.status(404).json({ 
          error: 'Category not found',
          categoryId: formData.categoryId 
        });
      }
      if (!subCategoryDoc.exists()) {
        return res.status(404).json({ 
          error: 'Subcategory not found',
          subCategoryId: formData.subCategoryId 
        });
      }
      if (!supplierDoc.exists()) {
        return res.status(404).json({ 
          error: 'Supplier not found',
          supplierId: formData.supplierId,
          collection: 'sparePartSellers'
        });
      }

      const sparePartDocRef = doc(db, 'SparePart', formData.bikeType);
      const productsCollectionRef = collection(sparePartDocRef, 'products');

      // Save products
      const productPromises = products.map(async (product) => {
        const productId = uuidv4();
        const productData = {
          productId,
          productName: product.productName.trim(),
          condition: product.condition,
          warehouseLocation: product.warehouseLocation.trim(),
          unitPrice: parseFloat(product.unitPrice),
          quantity: parseInt(product.quantity),
          totalPrice: parseFloat(product.total),
          warranty: product.warranty || '',
          purchasedAt: new Date().toISOString(),
          bikeType: formData.bikeType,
          category: {
            id: formData.categoryId,
            name: categoryDoc.data().name
          },
          subCategory: {
            id: formData.subCategoryId,
            name: subCategoryDoc.data().name
          },
          supplier: {
            id: formData.supplierId,
            name: supplierDoc.data().SellerName,
            contact: supplierDoc.data().SellerContactNo,
            address: supplierDoc.data().SellerAddress,
            cnic: supplierDoc.data().SellerCNIC
          }
        };

        return setDoc(doc(productsCollectionRef, productId), productData);
      });

      await Promise.all(productPromises);

      // Update summary
      const totalProducts = (await getDocs(productsCollectionRef)).size;
      await setDoc(sparePartDocRef, {
        lastUpdated: new Date().toISOString(),
        totalProducts
      }, { merge: true });

      res.status(200).json({
        message: 'Spare parts added successfully',
        count: products.length
      });

    } catch (error) {
      console.error('Database operation error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error adding spare parts:', error);
    res.status(500).json({
      error: 'Failed to add spare parts',
      details: error.message
    });
  }
});

// Get all spare parts
SparePartRouter.get('/', async (req, res) => {
  try {
    const bikeTypes = ['Electric Motorbike', 'Non-Electric Motorbike'];
    const allProducts = [];

    for (const bikeType of bikeTypes) {
      const productsCollectionRef = collection(db, `SparePart/${bikeType}/products`);
      const querySnapshot = await getDocs(productsCollectionRef);

      querySnapshot.forEach(doc => {
        allProducts.push({
          id: doc.id,
          ...doc.data(),
          bikeType
        });
      });
    }

    if (allProducts.length === 0) {
      return res.status(404).json({ message: 'No spare parts found' });
    }

    res.status(200).json(allProducts);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    res.status(500).json({
      error: 'Failed to fetch spare parts',
      details: error.message
    });
  }
});

// Get spare parts by bike type
SparePartRouter.get('/spareparts/:bikeType', async (req, res) => {
  const { bikeType } = req.params;

  if (!isValidString(bikeType)) {
    return res.status(400).json({ error: 'Invalid bike type provided' });
  }

  try {
    const productsCollectionRef = collection(db, `SparePart/${bikeType}/products`);
    const querySnapshot = await getDocs(productsCollectionRef);

    const products = [];
    querySnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (products.length === 0) {
      return res.status(404).json({ message: `No spare parts found for ${bikeType}` });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching spare parts:', error);
    res.status(500).json({
      error: 'Failed to fetch spare parts',
      details: error.message
    });
  }
});

// Update spare part
SparePartRouter.put('/updateSparePart/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { formData, product } = req.body;

    if (!isValidString(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    if (!isValidFormData(formData) || !isValidProduct(product)) {
      return res.status(400).json({ error: 'Invalid update data provided' });
    }

    // Fetch referenced documents
    const [categoryDoc, subCategoryDoc, supplierDoc] = await Promise.all([
      getDoc(doc(db, 'categories', formData.categoryId)),
      getDoc(doc(db, 'subCategories', formData.subCategoryId)),
      getDoc(doc(db, 'sparePartSellers', formData.supplierId))
    ]);

    if (!categoryDoc.exists() || !subCategoryDoc.exists() || !supplierDoc.exists()) {
      return res.status(404).json({ error: 'One or more referenced items not found' });
    }

    const productRef = doc(db, `SparePart/${formData.bikeType}/products`, productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedData = {
      productName: product.productName.trim(),
      condition: product.condition,
      warehouseLocation: product.warehouseLocation.trim(),
      unitPrice: parseFloat(product.unitPrice),
      quantity: parseInt(product.quantity),
      totalPrice: parseFloat(product.total),
      warranty: product.warranty,
      updatedAt: new Date().toISOString(),
      category: {
        id: formData.categoryId,
        name: categoryDoc.data().name
      },
      subCategory: {
        id: formData.subCategoryId,
        name: subCategoryDoc.data().name
      },
      supplier: {
        id: formData.supplierId,
        name: supplierDoc.data().SellerName,
        contact: supplierDoc.data().SellerContactNo,
        address: supplierDoc.data().SellerAddress,
        cnic: supplierDoc.data().SellerCNIC
      }
    };

    await updateDoc(productRef, updatedData);

    res.status(200).json({
      message: 'Spare part updated successfully',
      updatedProduct: { id: productId, ...updatedData }
    });
  } catch (error) {
    console.error('Error updating spare part:', error);
    res.status(500).json({
      error: 'Failed to update spare part',
      details: error.message
    });
  }
});

// Delete spare part
SparePartRouter.delete('/deleteSparePart/:bikeType/:productId', async (req, res) => {
  const { bikeType, productId } = req.params;

  if (!isValidString(bikeType) || !isValidString(productId)) {
    return res.status(400).json({ error: 'Invalid bike type or product ID' });
  }

  try {
    const productRef = doc(db, `SparePart/${bikeType}/products`, productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await deleteDoc(productRef);

    // Update summary
    const sparePartRef = doc(db, 'SparePart', bikeType);
    const productsCollectionRef = collection(sparePartRef, 'products');
    await setDoc(sparePartRef, {
      lastUpdated: new Date().toISOString(),
      totalProducts: (await getDocs(productsCollectionRef)).size
    }, { merge: true });

    res.status(200).json({ message: 'Spare part deleted successfully' });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    res.status(500).json({
      error: 'Failed to delete spare part',
      details: error.message
    });
  }
});

// Decrease product quantity
SparePartRouter.put('/decreaseQuantity/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (!isValidString(productId) || !isValidNumber(quantity)) {
    return res.status(400).json({ error: 'Invalid product ID or quantity' });
  }

  try {
    const productRef = doc(db, 'SparePart/Electric Motorbike/products', productId);
    const productDoc = await getDoc(productRef);

    if (!productDoc.exists()) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const currentProduct = productDoc.data();
    const newQuantity = currentProduct.quantity - parseInt(quantity);

    if (newQuantity < 0) {
      return res.status(400).json({
        error: 'Insufficient quantity',
        available: currentProduct.quantity,
        requested: quantity
      });
    }

    if (newQuantity === 0) {
      await deleteDoc(productRef);
      return res.status(200).json({
        message: 'Product removed (quantity reached zero)',
        productDeleted: true
      });
    }

    await updateDoc(productRef, {
      quantity: newQuantity,
      totalPrice: newQuantity * currentProduct.unitPrice,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      message: 'Quantity updated successfully',
      previousQuantity: currentProduct.quantity,
      newQuantity
    });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({
      error: 'Failed to update quantity',
      details: error.message
    });
  }
});

export default SparePartRouter;