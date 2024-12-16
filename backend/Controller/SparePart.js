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
const isValidSupplier = (supplier) => {
  return supplier && 
         isValidString(supplier.id) && 
         isValidString(supplier.SellerName) && 
         isValidString(supplier.SellerContactNo) && 
         isValidString(supplier.SellerAddress) && 
         isValidString(supplier.SellerCNIC);
};

const isValidProduct = (product) => {
  return product && 
         isValidString(product.productName) && 
         isValidString(product.condition) && 
         isValidString(product.warehouseLocation) && 
         isValidNumber(product.unitPrice) && 
         isValidNumber(product.quantity);
};

// Route to add a spare part
SparePartRouter.post('/addSparePart', async (req, res) => {
  try {
    const { formData, products } = req.body;
    console.log(formData)
    console.log(products)
    // Validate formData
    if (!formData || !isValidString(formData.bikeType) || !isValidString(formData.category) || 
        !isValidString(formData.subCategory) || !isValidSupplier(formData.supplier)) {
      return res.status(400).json({ error: 'Invalid or missing formData fields.' });
    }

    // Validate products
    if (!Array.isArray(products) || products.length === 0 || !products.every(isValidProduct)) {
      return res.status(400).json({ error: 'Invalid or missing products data.' });
    }

    const sparePartDocRef = doc(db, 'SparePart', formData.bikeType);
    const productsCollectionRef = collection(sparePartDocRef, 'products');
    
    const productPromises = products.map(async (product) => {
      const productData = {
        productId: uuidv4(),
        productName: product.productName,
        condition: product.condition,
        warehouseLocation: product.warehouseLocation,
        unitPrice: parseFloat(product.unitPrice),
        quantity: parseInt(product.quantity, 10),
        totalPrice: parseFloat(product.total),
        purchasedAt: new Date().toISOString(),
        category: formData.category,
        subCategory: formData.subCategory,
        supplier: {
          id: formData.supplier.id,
          name: formData.supplier.SellerName,
          contact: formData.supplier.SellerContactNo,
          address: formData.supplier.SellerAddress,
          cnic: formData.supplier.SellerCNIC
        }
      };
      return setDoc(doc(productsCollectionRef, productData.productId), productData);
    });

    await Promise.all(productPromises);

    res.status(200).json({ message: 'Spare part added successfully!' });
  } catch (error) {
    console.error('Error adding spare part:', error);
    res.status(500).json({ error: 'Failed to add spare part.', details: error.message });
  }
});

// Route to get all products from all categories and types
SparePartRouter.get('/', async (req, res) => {
  try {
    const categories = ['Electric Motorbike', 'Non-Electric Motorbike'];
    const allProducts = [];

    for (const category of categories) {
      const productsCollectionRef = collection(db, `SparePart/${category}/products`);
      const productsSnapshot = await getDocs(productsCollectionRef);

      productsSnapshot.forEach(productDoc => {
        const productData = {
          id: productDoc.id,
          ...productDoc.data(),
          bikeType: category,
        };
        allProducts.push(productData);
      });
    }

    if (allProducts.length === 0) {
      return res.status(404).json({ message: 'No products found.' });
    }

    res.status(200).json(allProducts);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: 'Failed to fetch all products.', details: error.message });
  }
});

// Route to get spare part details for Electric and Non-Electric Motorbike
SparePartRouter.get('/spareparts/:bikeType', async (req, res) => {
  const { bikeType } = req.params;

  if (!isValidString(bikeType)) {
    return res.status(400).json({ error: 'Invalid bike type provided.' });
  }

  try {
    const sparePartDocRef = doc(db, `SparePart/${bikeType}`, 'details');
    const sparePartSnapshot = await getDoc(sparePartDocRef);

    if (!sparePartSnapshot.exists()) {
      return res.status(404).json({ error: 'Spare part not found.' });
    }

    const sparePart = { id: sparePartSnapshot.id, ...sparePartSnapshot.data() };
    res.status(200).json(sparePart);
  } catch (error) {
    console.error('Error fetching spare part:', error);
    res.status(500).json({ error: 'Failed to fetch spare part.', details: error.message });
  }
});
SparePartRouter.put('/updateSparePart/:productId', async (req, res) => {
  const { productId } = req.params;
  const { formData, product } = req.body;

  console.log('Received productId:', productId);
  console.log('Received body:', JSON.stringify(req.body, null, 2));

  // Validate productId
  if (!isValidString(productId)) {
    return res.status(400).json({ error: 'Invalid product ID.' });
  }

  // Validate product
  if (!product || !isValidProduct(product)) {
    return res.status(400).json({ error: 'Invalid product data provided.' });
  }

  // Validate formData
  if (!formData || !isValidString(formData.category) || !isValidString(formData.subCategory) || !isValidSupplier(formData.supplier)) {
    return res.status(400).json({ error: 'Invalid or missing formData fields.' });
  }

  try {
    const sparePartDocRef = doc(db, 'SparePart/Electric Motorbike/products', productId);
    const sparePartSnapshot = await getDoc(sparePartDocRef);

    if (!sparePartSnapshot.exists()) {
      return res.status(404).json({ error: 'Spare part not found.' });
    }

    const updatedData = {
      productName: product.productName,
      condition: product.condition,
      warehouseLocation: product.warehouseLocation,
      unitPrice: parseFloat(product.unitPrice),
      quantity: parseInt(product.quantity, 10),
      totalPrice: parseFloat(product.unitPrice) * parseInt(product.quantity, 10),
      category: formData.category,
      subCategory: formData.subCategory,
      supplier: {
        id: formData.supplier.id,
        name: formData.supplier.SellerName,
        contact: formData.supplier.SellerContactNo,
        address: formData.supplier.SellerAddress,
        cnic: formData.supplier.SellerCNIC,
      },
      updatedAt: new Date().toISOString(),
    };

    // Use updateDoc to update only the specified fields
    await updateDoc(sparePartDocRef, updatedData);
    console.log('Update successful');
    res.status(200).json({ message: 'Spare part updated successfully!' });
  } catch (error) {
    console.error('Error updating spare part:', error);
    res.status(500).json({ error: 'Failed to update spare part.', details: error.message });
  }
});


// SparePartRouter.put('/updateSparePart/:productId', async (req, res) => {
//   const { productId } = req.params;
//   const { formData, product } = req.body;

//   console.log('Received productId:', productId);
//   console.log('Received body:', JSON.stringify(req.body, null, 2));

//   if (!isValidString(productId)) {
//     return res.status(400).json({ error: 'Invalid product ID.' });
//   }

//   if (!formData || !product || !isValidProduct(product) || !isValidSupplier(formData.supplier)) {
//     return res.status(400).json({ error: 'Invalid update data provided.' });
//   }

//   try {
//     const sparePartDocRef = doc(db, 'SparePart/Electric Motorbike/products', productId);
//     const sparePartSnapshot = await getDoc(sparePartDocRef);

//     if (!sparePartSnapshot.exists()) {
//       return res.status(404).json({ error: 'Spare part not found.' });
//     }

//     const updatedData = {
//       productName: product.productName,
//       condition: product.condition,
//       warehouseLocation: product.warehouseLocation,
//       unitPrice: parseFloat(product.unitPrice),
//       quantity: parseInt(product.quantity, 10),
//       totalPrice: parseFloat(product.unitPrice) * parseInt(product.quantity, 10),
//       category: formData.category,
//       subCategory: formData.subCategory,
//       supplier: {
//         id: formData.supplier.name.id,
//         name: formData.supplier.name.name,
//         contact: formData.supplier.name.contact,
//         address: formData.supplier.name.address,
//         cnic: formData.supplier.name.cnic,
//       },
//       updatedAt: new Date().toISOString(),
//     };

//     // Use updateDoc to update only the specified fields
//     await updateDoc(sparePartDocRef, updatedData);
//     console.log('Update successful');
//     res.status(200).json({ message: 'Spare part updated successfully!' });
//   } catch (error) {
//     console.error('Error updating spare part:', error);
//     res.status(500).json({ error: 'Failed to update spare part.', details: error.message });
//   }
// });


// Route to delete a spare part
SparePartRouter.delete('/deleteSparePart/:bikeType/:productId', async (req, res) => {
  const { bikeType, productId } = req.params;

  if (!isValidString(bikeType) || !isValidString(productId)) {
    return res.status(400).json({ error: 'Invalid bike type or product ID.' });
  }

  try {
    const sparePartDocRef = doc(db, `SparePart/${bikeType}/products`, productId);
    const sparePartSnapshot = await getDoc(sparePartDocRef);

    if (!sparePartSnapshot.exists()) {
      return res.status(404).json({ error: 'Spare part not found.' });
    }

    await deleteDoc(sparePartDocRef);

    res.status(200).json({ message: 'Spare part deleted successfully!' });
  } catch (error) {
    console.error('Error deleting spare part:', error);
    res.status(500).json({ error: 'Failed to delete spare part.', details: error.message });
  }
});



// Route to decrease product quantity
SparePartRouter.put('/decreaseQuantity/:productId', async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  // Validate inputs
  if (!isValidString(productId)) {
    return res.status(400).json({ error: 'Invalid product ID.' });
  }

  if (!isValidNumber(quantity)) {
    return res.status(400).json({ error: 'Invalid quantity provided.' });
  }

  try {
    // Reference to the product document with the correct path
    const productDocRef = doc(db, 'SparePart', 'Electric Motorbike', 'products', productId);
    const productSnapshot = await getDoc(productDocRef);

    if (!productSnapshot.exists()) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const currentProduct = productSnapshot.data();
    const newQuantity = currentProduct.quantity - parseInt(quantity, 10);

    // Check if we would have negative quantity
    if (newQuantity < 0) {
      return res.status(400).json({
        error: 'Insufficient quantity available.',
        currentQuantity: currentProduct.quantity,
        requestedQuantity: quantity
      });
    }

    if (newQuantity === 0) {
      // If new quantity is zero, delete the document
      await deleteDoc(productDocRef);
      return res.status(200).json({
        message: 'Product quantity reduced to zero, product deleted successfully.',
        productDeleted: true
      });
    }

    // Update the quantity and total price if not zero
    const updatedData = {
      quantity: newQuantity,
      totalPrice: newQuantity * currentProduct.unitPrice,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(productDocRef, updatedData);

    res.status(200).json({
      message: 'Quantity updated successfully!',
      newQuantity,
      previousQuantity: currentProduct.quantity
    });
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({ error: 'Failed to update quantity.', details: error.message });
  }
});


export default SparePartRouter;