import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  getDoc,
  collectionGroup,

} from 'firebase/firestore';

const BikeModelRouter = express.Router();

// Check if manufacturer exists
const isManufacturerExists = async (manufacturerId) => {
  const manufacturerRef = doc(db, 'manufacturers', manufacturerId);
  const manufacturerSnapshot = await getDoc(manufacturerRef);
  return manufacturerSnapshot.exists(); // Returns true if the manufacturer exists
};

// Check if model name is unique within a manufacturer and type
const isModelNameUnique = async (manufacturerId, type, modelName) => {
  const modelsCollectionRef = collection(db, `bikeModels/${manufacturerId}/${type}`);
  const q = query(modelsCollectionRef, where('modelName', '==', modelName));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // True if the model name does not exist under this manufacturer and type
};


// Add a bike model
BikeModelRouter.post('/add', async (req, res) => {
  console.log("Incoming data:", req.body); // Log the request body to check if all fields are present

  try {
    const { type, manufacturerId, manufacturerName, modelName, manufacturerYear, engine, power, range } = req.body;

    // Validate input
    if (!type || !manufacturerId || !manufacturerName || !modelName || !manufacturerYear) {
      return res.status(400).json({ error: 'All required fields (type, manufacturerId, manufacturerName, modelName, manufacturerYear) must be provided.' });
    }

    // Check if the manufacturer exists
    const manufacturerExists = await isManufacturerExists(manufacturerId);
    if (!manufacturerExists) {
      // Add the manufacturer if it doesn't exist, using the actual name provided in the request
      await setDoc(doc(db, 'manufacturers', manufacturerId), { manufacturerName });
    }

    // Check if the model name is unique within the manufacturer and type
    const modelNameUnique = await isModelNameUnique(manufacturerId, type, modelName);
    if (!modelNameUnique) {
      return res.status(400).json({ error: "Model name must be unique for this manufacturer and type." });
    }

    // Now add the model under the manufacturer and type
    const modelsCollectionRef = collection(db, `bikeModels/${manufacturerId}/${type}`);
    const bikeModelRef = await addDoc(modelsCollectionRef, {
      type,
      manufacturerName,
      modelName,
      manufacturerYear,
      engine: engine || null,
      power: power || null,
      range: type === 'Electric' ? range : null,
    });

    const modelId = bikeModelRef.id; // Get the generated document ID
    await setDoc(bikeModelRef, { modelId }, { merge: true }); // Add modelId field to the document

    res.status(201).json({ message: 'Bike model added successfully.', documentId: bikeModelRef.id });
  } catch (error) {
    console.error("Error adding bike model: ", error);
    res.status(500).json({ error: 'Error adding bike model.' });
  }
});


// Helper function to remove undefined values from an object
function removeUndefinedFields(data) {
  return Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined));
}

// Update a bike model
BikeModelRouter.put('/update/:manufacturerId/:type/:modelId', async (req, res) => {
  try {
    const { manufacturerId, type, modelId } = req.params;
    const { manufacturerName, modelName, manufacturerYear, engine, power, range } = req.body;

    // Validate required fields
    if (!modelName || !manufacturerYear) {
      return res.status(400).json({ error: 'Model name and manufacturer year are required fields.' });
    }

    // Verify that the manufacturer ID and model ID exist before updating
    const bikeModelDoc = doc(db, `bikeModels/${manufacturerId}/${type}`, modelId);
    const bikeModelSnapshot = await getDoc(bikeModelDoc);

    if (!bikeModelSnapshot.exists()) {
      return res.status(404).json({ error: 'Bike model not found for the provided manufacturer and type.' });
    }

    // Check if the model name is unique within the manufacturer and type
    const modelNameUnique = await isModelNameUnique(manufacturerId, type, modelName);
    if (!modelNameUnique && modelName !== bikeModelSnapshot.data().modelName) {
      return res.status(400).json({ error: 'Model name must be unique for this manufacturer and type.' });
    }

    // Prepare update data with optional fields and filter out undefined values
    const updateData = removeUndefinedFields({
      manufacturerName: manufacturerName || bikeModelSnapshot.data().manufacturerName,
      modelName,
      manufacturerYear,
      engine: engine ? { ...engine } : bikeModelSnapshot.data().engine || null,
      power: power ? { ...power } : bikeModelSnapshot.data().power || null,
      range: type === 'Electric' ? range : null,
    });

    // Attempt to update the document
    await updateDoc(bikeModelDoc, updateData);
    res.status(200).json({ message: 'Bike model updated successfully.' });
  } catch (error) {
    console.error("Error updating bike model:", error);
    res.status(500).json({ error: 'Error updating bike model. Check the server logs for more details.' });
  }
});



// Fetch all bike models
BikeModelRouter.get('/models', async (req, res) => {
  try {
    let allBikeModels = [];
    
    // Try fetching Electric bikes using collectionGroup
    const electricGroup = collectionGroup(db, 'Electric');
    const electricSnapshot = await getDocs(electricGroup);
    console.log('Electric models found:', electricSnapshot.size);
    
    for (const doc of electricSnapshot.docs) {
      const parentPath = doc.ref.parent.parent;
      console.log('Electric doc parent path:', parentPath.id);
      
      allBikeModels.push({
        parentId: parentPath.id,
        type: 'Electric',
        id: doc.id,
        ...doc.data()
      });
    }
    
    // Try fetching Non-Electric bikes using collectionGroup
    const nonElectricGroup = collectionGroup(db, 'Non-Electric');
    const nonElectricSnapshot = await getDocs(nonElectricGroup);
    console.log('Non-Electric models found:', nonElectricSnapshot.size);
    
    for (const doc of nonElectricSnapshot.docs) {
      const parentPath = doc.ref.parent.parent;
      console.log('Non-Electric doc parent path:', parentPath.id);
      
      allBikeModels.push({
        parentId: parentPath.id,
        type: 'Non-Electric',
        id: doc.id,
        ...doc.data()
      });
    }

    // If no data found
    if (allBikeModels.length === 0) {
      console.log('No bike models found in the database');
      return res.status(404).json({ message: 'No bike models found' });
    }

    console.log('Total models found:', allBikeModels.length);
    res.status(200).json(allBikeModels);
    
  } catch (error) {
    console.error("Error fetching bike models:", error);
    res.status(500).json({ error: 'Failed to fetch bike models', details: error.message });
  }
});


// Fetch all bike models for a specific manufacturer and type
BikeModelRouter.get('/:manufacturerId/:type/models', async (req, res) => {
  try {
    const { manufacturerId, type } = req.params;
    const modelsCollectionRef = collection(db, `bikeModels/${manufacturerId}/${type}`);
    const querySnapshot = await getDocs(modelsCollectionRef);
    let bikeModels = [];
    
    querySnapshot.forEach((doc) => {
      bikeModels.push({ documentId: doc.id, ...doc.data() }); // Include documentId in the result
    });
    
    res.status(200).json(bikeModels);
  } catch (error) {
    console.error("Error fetching bike models:", error);
    res.status(500).json({ error: 'Error fetching bike models.' });
  }
});

export default BikeModelRouter;
