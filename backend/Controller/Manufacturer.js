import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

const ManufacturerRouter = express.Router();

// Check if manufacturer name is unique
const isNameUnique = async (name) => {
  const manufacturersCollectionRef = collection(db, 'manufacturers');
  const q = query(manufacturersCollectionRef, where('name', '==', name));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // True if the manufacturer name does not exist
};

// Add a manufacturer
ManufacturerRouter.post('/add', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const isUnique = await isNameUnique(name);
    if (!isUnique) {
      return res.status(400).json({ error: 'Manufacturer name must be unique' });
    }

    await addDoc(collection(db, 'manufacturers'), { name });
    res.status(201).json({ message: 'Manufacturer added successfully' });
  } catch (error) {
    console.error('Error adding manufacturer:', error);
    res.status(500).json({ error: 'Error adding manufacturer' });
  }
});

// Update a manufacturer
ManufacturerRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if the manufacturer exists
    const manufacturerRef = doc(db, 'manufacturers', id);
    const manufacturerSnapshot = await getDoc(manufacturerRef);
    if (!manufacturerSnapshot.exists()) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }

    const isUnique = await isNameUnique(name);
    if (!isUnique) {
      return res.status(400).json({ error: 'Manufacturer name must be unique' });
    }

    await updateDoc(manufacturerRef, { name });
    res.status(200).json({ message: 'Manufacturer updated successfully' });
  } catch (error) {
    console.error('Error updating manufacturer:', error);
    res.status(500).json({ error: 'Error updating manufacturer' });
  }
});

// Delete a manufacturer
ManufacturerRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the manufacturer exists
    const manufacturerRef = doc(db, 'manufacturers', id);
    const manufacturerSnapshot = await getDoc(manufacturerRef);
    if (!manufacturerSnapshot.exists()) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }

    await deleteDoc(manufacturerRef);
    res.status(200).json({ message: 'Manufacturer deleted successfully' });
  } catch (error) {
    console.error('Error deleting manufacturer:', error);
    res.status(500).json({ error: 'Error deleting manufacturer' });
  }
});

// Fetch all manufacturers
ManufacturerRouter.get('/', async (req, res) => {
  try {
    const manufacturersCollectionRef = collection(db, 'manufacturers');
    const querySnapshot = await getDocs(manufacturersCollectionRef);
    const manufacturers = [];
    
    querySnapshot.forEach((doc) => {
      manufacturers.push({ id: doc.id, ...doc.data() }); // Include documentId in the result
    });

    res.status(200).json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    res.status(500).json({ error: 'Error fetching manufacturers' });
  }
});
// Fetch a manufacturer by ID
ManufacturerRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const manufacturerRef = doc(db, 'manufacturers', id);
    const manufacturerSnapshot = await getDoc(manufacturerRef);

    if (!manufacturerSnapshot.exists()) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }

    res.status(200).json({ id: manufacturerSnapshot.id, ...manufacturerSnapshot.data() });
  } catch (error) {
    console.error('Error fetching manufacturer:', error);
    res.status(500).json({ error: 'Error fetching manufacturer' });
  }
});


export default ManufacturerRouter;
