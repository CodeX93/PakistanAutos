import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const BikeSellerRouter = express.Router();

// Function to validate input
const validateInput = (data) => {
  
  const { SellerName, SellerContactNo, SellerAddress, SellerCNIC } = data;
  if (!SellerName || !SellerContactNo || !SellerAddress || !SellerCNIC) {
    return false;
  }
  return true;
};

// Add a BikeSeller
// BikeSellerRouter.post('/add', async (req, res) => {
//   try {
//     const bikeSellerData = req.body;

//     // Validate input
//     if (!validateInput(bikeSellerData)) {
//       return res.status(400).json({ error: 'All fields are required' });
//     }

//     // Check for existing seller with the same CNIC
//     const bikeSellersCollectionRef = collection(db, 'bikeSellers');
//     const querySnapshot = await getDocs(bikeSellersCollectionRef);
//     const existingSeller = querySnapshot.docs.find(doc => doc.data().SellerCNIC === bikeSellerData.SellerCNIC);
//     if (existingSeller) {
//       return res.status(400).json({ error: 'A BikeSeller with this CNIC already exists' });
//     }

//     await addDoc(bikeSellersCollectionRef, bikeSellerData);
//     res.status(201).json({ message: 'BikeSeller added successfully' });
//   } catch (error) {
//     console.error('Error adding BikeSeller:', error);
//     res.status(500).json({ error: 'Error adding BikeSeller' });
//   }
// });

BikeSellerRouter.post('/add', async (req, res) => {
  try {
    const bikeSellerData = req.body;

    // Validate input
    if (!validateInput(bikeSellerData)) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check for existing seller with the same CNIC
    const bikeSellersCollectionRef = collection(db, 'bikeSellers');
    const querySnapshot = await getDocs(bikeSellersCollectionRef);
    const existingSeller = querySnapshot.docs.find(doc => doc.data().SellerCNIC === bikeSellerData.SellerCNIC);
    if (existingSeller) {
      return res.status(400).json({ error: 'A BikeSeller with this CNIC already exists' });
    }

    // Add the new seller to the database
    const docRef = await addDoc(bikeSellersCollectionRef, bikeSellerData);

    // Fetch the newly added seller's data to include the ID
    const newSellerSnapshot = await getDoc(docRef);
    const newSeller = { id: newSellerSnapshot.id, ...newSellerSnapshot.data() };

    // Respond with the new seller data
    res.status(201).json(newSeller);
  } catch (error) {
    console.error('Error adding BikeSeller:', error);
    res.status(500).json({ error: 'Error adding BikeSeller' });
  }
});

// Update a BikeSeller
BikeSellerRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bikeSellerData = req.body;

    // Validate input
    if (!validateInput(bikeSellerData)) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the BikeSeller exists
    const bikeSellerRef = doc(db, 'bikeSellers', id);
    const bikeSellerSnapshot = await getDoc(bikeSellerRef);
    if (!bikeSellerSnapshot.exists()) {
      return res.status(404).json({ error: 'BikeSeller not found' });
    }

    // Check for existing seller with the same CNIC (excluding current seller)
    const bikeSellersCollectionRef = collection(db, 'bikeSellers');
    const querySnapshot = await getDocs(bikeSellersCollectionRef);
    const existingSeller = querySnapshot.docs.find(doc => 
      doc.data().SellerCNIC === bikeSellerData.SellerCNIC && doc.id !== id
    );
    if (existingSeller) {
      return res.status(400).json({ error: 'A BikeSeller with this CNIC already exists' });
    }

    // Update the seller data
    await updateDoc(bikeSellerRef, bikeSellerData);

    // Fetch the updated seller data
    const updatedSellerSnapshot = await getDoc(bikeSellerRef);
    const updatedSeller = { id: updatedSellerSnapshot.id, ...updatedSellerSnapshot.data() };

    // Respond with the updated seller data
    res.status(200).json(updatedSeller);
  } catch (error) {
    console.error('Error updating BikeSeller:', error);
    res.status(500).json({ error: 'Error updating BikeSeller' });
  }
});


// Delete a BikeSeller
BikeSellerRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the BikeSeller exists
    const bikeSellerRef = doc(db, 'bikeSellers', id);
    const bikeSellerSnapshot = await getDoc(bikeSellerRef);
    if (!bikeSellerSnapshot.exists()) {
      return res.status(404).json({ error: 'BikeSeller not found' });
    }

    await deleteDoc(bikeSellerRef);
    res.status(200).json({ message: 'BikeSeller deleted successfully' });
  } catch (error) {
    console.error('Error deleting BikeSeller:', error);
    res.status(500).json({ error: 'Error deleting BikeSeller' });
  }
});

// Fetch all BikeSellers
BikeSellerRouter.get('/', async (req, res) => {
  try {
    const bikeSellersCollectionRef = collection(db, 'bikeSellers');
    const querySnapshot = await getDocs(bikeSellersCollectionRef);
    const bikeSellers = [];
    
    querySnapshot.forEach((doc) => {
      bikeSellers.push({ id: doc.id, ...doc.data() }); // Include documentId in the result
    });

    res.status(200).json(bikeSellers);
  } catch (error) {
    console.error('Error fetching BikeSellers:', error);
    res.status(500).json({ error: 'Error fetching BikeSellers' });
  }
});

export default BikeSellerRouter;
