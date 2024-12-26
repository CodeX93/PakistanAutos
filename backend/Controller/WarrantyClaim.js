import express from 'express';
import { db } from '../db.js'; // Assuming this is where your Firestore config is imported from
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDocs } from 'firebase/firestore';

const WarrantyClaimRouter = express.Router();

// Validate warranty claim data
const validateWarrantyClaimData = (data) => {
    const requiredFields = ['billCount', 'customerDetails', 'productDetails', 'saleId', 'saleStatus', 'saleTimestamp'];
  
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }
  
    // Additional validation for customerDetails
    const requiredCustomerFields = ['address', 'cnic', 'contactNo', 'name'];
    for (const field of requiredCustomerFields) {
      if (!data.customerDetails[field]) {
        throw new Error(`Customer ${field} is required`);
      }
    }
  
    // Additional validation for productDetails
    const requiredProductFields = ['category', 'condition', 'productName', 'quantity', 'unitPrice', 'unitSellingPrice', 'sellingDate'];
    for (const field of requiredProductFields) {
      if (!data.productDetails[field]) {
        throw new Error(`Product ${field} is required`);
      }
    }
  
    // Validate numeric fields
    if (isNaN(data.productDetails.quantity) || data.productDetails.quantity < 0) {
      throw new Error(`Quantity must be a non-negative number`);
    }
    if (isNaN(data.productDetails.unitPrice) || data.productDetails.unitPrice < 0) {
      throw new Error(`Unit price must be a non-negative number`);
    }
    if (isNaN(data.productDetails.unitSellingPrice) || data.productDetails.unitSellingPrice < 0) {
      throw new Error(`Unit selling price must be a non-negative number`);
    }
  };
  

// Post warranty claim
WarrantyClaimRouter.post('/add', async (req, res) => {
    
  
    try {
      const warrantyClaimData = req.body;
  
      // Validate input
      validateWarrantyClaimData(warrantyClaimData); // Ensure this function is defined
  
      // Prepare document data for WarrantyClaims collection
      const warrantyClaimDoc = {
        billCount: warrantyClaimData.billCount,
        
        customerDetails: warrantyClaimData.customerDetails,
        productDetails: warrantyClaimData.productDetails,
        saleId: warrantyClaimData.saleId,
        saleStatus: warrantyClaimData.saleStatus,
        saleTimestamp: {
          created: warrantyClaimData.saleTimestamp.created,
          updated: warrantyClaimData.saleTimestamp.updated
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
  
      // Add document to WarrantyClaims collection
      const docRef = await addDoc(collection(db, 'WarrantyClaims'), warrantyClaimDoc);
  
      // Return success response
      res.status(201).json({
        message: 'Warranty claim added successfully',
        id: docRef.id
      });
    } catch (error) {
      console.error('Error adding warranty claim:', error);
      res.status(400).json({ error: error.message }); // Return specific error message
    }
  });

  // Fetch all warranty claims
WarrantyClaimRouter.get('/', async (req, res) => {
    try {
      const warrantyClaimsCollection = collection(db, 'WarrantyClaims');
      const snapshot = await getDocs(warrantyClaimsCollection);
  
      // Extract data from the documents
      const warrantyClaims = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      // Return success response with the data
      res.status(200).json({
        message: 'Warranty claims retrieved successfully',
        claims: warrantyClaims,
      });
    } catch (error) {
      console.error('Error fetching warranty claims:', error);
      res.status(500).json({ error: 'Error fetching warranty claims' });
    }
  });

// Update warranty claim
WarrantyClaimRouter.put('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (!id) {
      throw new Error('Claim ID is required.');
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('No update data provided.');
    }

    // Validate specific fields if necessary (e.g., saleStatus)
    if (updateData.saleStatus && !['active', 'inactive'].includes(updateData.saleStatus)) {
      throw new Error('Invalid saleStatus. Allowed values: active, inactive.');
    }

    // Reference the specific document in Firestore
    const claimDocRef = doc(db, 'WarrantyClaims', id);

    // Update the document with the provided data
    await updateDoc(claimDocRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });

    res.status(200).json({
      message: 'Warranty claim updated successfully.',
    });
  } catch (error) {
    console.error('Error updating warranty claim:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default WarrantyClaimRouter;
