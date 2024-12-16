import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const SparePartSellerRouter = express.Router();

// Function to validate input
const validateInput = (data) => {
  const { SellerName, SellerContactNo, SellerAddress, SellerCNIC } = data;
  if (!SellerName || !SellerContactNo || !SellerAddress || !SellerCNIC) {
    return false;
  }
  return true;
};

// Add a SparePartSeller
SparePartSellerRouter.post('/add', async (req, res) => {
  try {
    const sparePartSellerData = req.body;

    // Validate input
    if (!validateInput(sparePartSellerData)) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for existing seller with the same CNIC
    const sparePartSellersCollectionRef = collection(db, 'sparePartSellers');
    const querySnapshot = await getDocs(sparePartSellersCollectionRef);
    const existingSeller = querySnapshot.docs.find(doc => doc.data().SellerCNIC === sparePartSellerData.SellerCNIC);
    if (existingSeller) {
      return res.status(400).json({ error: 'A SparePartSeller with this CNIC already exists' });
    }

    const docRef=await addDoc(sparePartSellersCollectionRef, sparePartSellerData);
        // Fetch the newly added seller's data to include the ID
        const newSellerSnapshot = await getDoc(docRef);
        const newSeller = { id: newSellerSnapshot.id, ...newSellerSnapshot.data() };
    
        // Respond with the new seller data
    res.status(201).json(newSeller);
    res.status(201).json({ message: 'SparePartSeller added successfully' });
  } catch (error) {
    console.error('Error adding SparePartSeller:', error);
    res.status(500).json({ error: 'Error adding SparePartSeller' });
  }
});

// Update a SparePartSeller
SparePartSellerRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sparePartSellerData = req.body;

    // Validate input
    if (!validateInput(sparePartSellerData)) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the SparePartSeller exists
    const sparePartSellerRef = doc(db, 'sparePartSellers', id);
    const sparePartSellerSnapshot = await getDoc(sparePartSellerRef);
    if (!sparePartSellerSnapshot.exists()) {
      return res.status(404).json({ error: 'SparePartSeller not found' });
    }

    // Check for existing seller with the same CNIC (excluding current seller)
    const sparePartSellersCollectionRef = collection(db, 'sparePartSellers');
    const querySnapshot = await getDocs(sparePartSellersCollectionRef);
    const existingSeller = querySnapshot.docs.find(doc => 
      doc.data().SellerCNIC === sparePartSellerData.SellerCNIC && doc.id !== id
    );
    if (existingSeller) {
      return res.status(400).json({ error: 'A SparePartSeller with this CNIC already exists' });
    }

    // Update document in Firestore
    await updateDoc(sparePartSellerRef, sparePartSellerData);

    // Fetch and respond with the updated seller data
    const updatedSellerSnapshot = await getDoc(sparePartSellerRef);
    const updatedSeller = { id: updatedSellerSnapshot.id, ...updatedSellerSnapshot.data() };
    
    res.status(200).json(updatedSeller); // Send only one response with updated data
  } catch (error) {
    console.error('Error updating SparePartSeller:', error);
    res.status(500).json({ error: 'Error updating SparePartSeller' });
  }
});


// Delete a SparePartSeller
SparePartSellerRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the SparePartSeller exists
    const sparePartSellerRef = doc(db, 'sparePartSellers', id);
    const sparePartSellerSnapshot = await getDoc(sparePartSellerRef);
    
    if (!sparePartSellerSnapshot.exists()) {
      return res.status(404).json({ error: 'SparePartSeller not found' });
    }

    // Delete the document
    await deleteDoc(sparePartSellerRef);

    // Respond with success message
    return res.status(200).json({ message: 'SparePartSeller deleted successfully' });
  } catch (error) {
    console.error('Error deleting SparePartSeller:', error);
    return res.status(500).json({ error: 'Error deleting SparePartSeller' });
  }
});


// Fetch all SparePartSellers
SparePartSellerRouter.get('/', async (req, res) => {
  try {
    const sparePartSellersCollectionRef = collection(db, 'sparePartSellers');
    const querySnapshot = await getDocs(sparePartSellersCollectionRef);
    const sparePartSellers = [];
    
    querySnapshot.forEach((doc) => {
      sparePartSellers.push({ id: doc.id, ...doc.data() }); // Include documentId in the result
    });

    res.status(200).json(sparePartSellers);
  } catch (error) {
    console.error('Error fetching SparePartSellers:', error);
    res.status(500).json({ error: 'Error fetching SparePartSellers' });
  }
});

export default SparePartSellerRouter;
