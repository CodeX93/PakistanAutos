import express from 'express';
import { db } from '../db.js';
import { collection, addDoc, doc, setDoc, getDocs, query, where, deleteDoc } from 'firebase/firestore';

const BikeInventoryRouter = express.Router();

BikeInventoryRouter.post('/addBikeToInventory', async (req, res) => {
  try {
    const { Inventory } = req.body;
    const {
      manufacturer: manufacturerName,
      model,
      modelYear,
      stockQuantity,
      bikeEntries,
      purchaseDate
    } = Inventory;

    // Validate base input data
    if (!manufacturerName || !model || !modelYear || !stockQuantity || !Array.isArray(bikeEntries) || bikeEntries.length === 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Create or update manufacturer reference
    const manufacturerRef = doc(db, 'BikeInventory', manufacturerName);
    await setDoc(manufacturerRef, { name: manufacturerName }, { merge: true });

    const bikePromises = bikeEntries.map(async (entry) => {
      const {
        motorNo,
        frameNo,
        engineNo,
        chassisNumber,
        registrationNumber,
        condition,
        mileage = 0,
        registrationCity,
        purchasePrice,
        sellerInfo,
        type,
        cc,
        stroke,
        power,
        batteryDetails,
        range,
        warranty
      } = entry;

      // Validate required fields for all bikes
      if (!condition || !purchasePrice || !type) {
        throw new Error('Missing required fields in bike entry');
      }

      // Create base bike data object
      const bikeData = {
        model,
        modelYear,
        stockQuantity: 1,
        purchaseDate,
        registrationNumber,
        condition,
        mileage,
        registrationCity,
        purchasePrice,
        sellerInfo,
        warranty,
        createdAt: new Date()
      };

      // Handle Electric bikes
      if (type === 'Electric') {
        // Validate Electric bike fields
        if (!motorNo || !frameNo) {
          throw new Error('Motor Number and Frame Number are required for electric bikes');
        }
        if (!batteryDetails?.capacity || !batteryDetails?.quantity ||
            !batteryDetails?.volts || !batteryDetails?.amperes || !power || !range) {
          throw new Error('Missing required electric bike fields');
        }

        // Add Electric bike specific data
        bikeData.motorNo = motorNo;
        bikeData.frameNo = frameNo;
        bikeData.power = power;
        bikeData.range = range;
        bikeData.batteryDetails = {
          capacity: batteryDetails.capacity,
          quantity: batteryDetails.quantity,
          volts: batteryDetails.volts,
          amperes: batteryDetails.amperes
        };
      } 
      // Handle Non-Electric bikes
      else if (type === 'Non-Electric') {
        // Validate Non-Electric bike fields
        if (!engineNo || !chassisNumber) {
          throw new Error('Engine Number and Chassis Number are required for non-electric bikes');
        }
        if (!cc || !stroke) {
          throw new Error('Missing required non-electric bike fields');
        }

        // Add Non-Electric bike specific data
        bikeData.engineNo = engineNo;
        bikeData.chassisNumber = chassisNumber;
        bikeData.cc = cc;
        bikeData.stroke = stroke;
      } 
      else {
        throw new Error('Invalid bike type');
      }

      // Add bike to collection
      const bikeTypeCollection = collection(manufacturerRef, type);
      await addDoc(bikeTypeCollection, bikeData);
    });

    // Wait for all bikes to be added
    await Promise.all(bikePromises);
    res.status(200).json({ message: 'Bikes added successfully!' });

  } catch (error) {
    console.error('Error adding bikes:', error);
    res.status(500).json({ 
      message: 'Failed to add bikes', 
      error: error.message 
    });
  }
});

BikeInventoryRouter.get('/getAllInventory', async (req, res) => {
  try {
    const manufacturersRef = collection(db, 'BikeInventory');
    const manufacturersSnapshot = await getDocs(manufacturersRef);
    const allInventory = [];

    for (const manufacturerDoc of manufacturersSnapshot.docs) {
      const manufacturerId = manufacturerDoc.id;
      const bikeTypes = ['Electric', 'Non-Electric'];

      for (const bikeType of bikeTypes) {
        const bikesRef = collection(db, 'BikeInventory', manufacturerId, bikeType);
        const bikesSnapshot = await getDocs(bikesRef);
        
        bikesSnapshot.forEach((doc) => {
          allInventory.push({
            manufacturer: manufacturerId,
            type: bikeType,
            id: doc.id,
            ...doc.data(),
          });
        });
      }
    }

    if (allInventory.length === 0) {
      return res.status(200).json({ message: 'No inventory data available' });
    }

    return res.status(200).json({ inventory: allInventory });
  } catch (error) {
    console.error('Error fetching all inventory data:', error);
    return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
});

BikeInventoryRouter.get('/getBikeByChassisNumber/:searchNumber', async (req, res) => {
  const { searchNumber } = req.params;

  try {
    const manufacturersRef = collection(db, 'BikeInventory');
    const manufacturersSnapshot = await getDocs(manufacturersRef);
    const matchingBikes = [];

    for (const manufacturerDoc of manufacturersSnapshot.docs) {
      const manufacturerId = manufacturerDoc.id;
      
      // Get references to both collections
      const electricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Electric');
      const nonElectricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Non-Electric');

      // Create queries for Electric bikes (motorNo and frameNo)
      const electricMotorQuery = query(electricBikesRef, where('motorNo', '==', searchNumber));
      const electricFrameQuery = query(electricBikesRef, where('frameNo', '==', searchNumber));

      // Create queries for Non-Electric bikes (engineNo and chassisNumber)
      const nonElectricEngineQuery = query(nonElectricBikesRef, where('engineNo', '==', searchNumber));
      const nonElectricChassisQuery = query(nonElectricBikesRef, where('chassisNumber', '==', searchNumber));

      // Execute all queries in parallel
      const [
        electricMotorSnapshot,
        electricFrameSnapshot,
        nonElectricEngineSnapshot,
        nonElectricChassisSnapshot
      ] = await Promise.all([
        getDocs(electricMotorQuery),
        getDocs(electricFrameQuery),
        getDocs(nonElectricEngineQuery),
        getDocs(nonElectricChassisQuery)
      ]);

      // Process Electric bike results
      electricMotorSnapshot.forEach(doc => matchingBikes.push({
        manufacturer: manufacturerId,
        type: 'Electric',
        id: doc.id,
        searchMatchedOn: 'motorNo',
        ...doc.data()
      }));

      electricFrameSnapshot.forEach(doc => matchingBikes.push({
        manufacturer: manufacturerId,
        type: 'Electric',
        id: doc.id,
        searchMatchedOn: 'frameNo',
        ...doc.data()
      }));

      // Process Non-Electric bike results
      nonElectricEngineSnapshot.forEach(doc => matchingBikes.push({
        manufacturer: manufacturerId,
        type: 'Non-Electric',
        id: doc.id,
        searchMatchedOn: 'engineNo',
        ...doc.data()
      }));

      nonElectricChassisSnapshot.forEach(doc => matchingBikes.push({
        manufacturer: manufacturerId,
        type: 'Non-Electric',
        id: doc.id,
        searchMatchedOn: 'chassisNumber',
        ...doc.data()
      }));
    }

    if (matchingBikes.length === 0) {
      return res.status(404).json({ 
        message: 'No bike found with the provided identification number'
      });
    }

    return res.status(200).json({ bikes: matchingBikes });
  } catch (error) {
    console.error('Error fetching bike:', error);
    return res.status(500).json({ 
      message: 'Error fetching bike', 
      error: error.message 
    });
  }
});

BikeInventoryRouter.delete('/removeBikeFromInventory/:chassisNumber', async (req, res) => {
  const { chassisNumber } = req.params;

  try {
    const manufacturersRef = collection(db, 'BikeInventory');
    const manufacturersSnapshot = await getDocs(manufacturersRef);
    let bikeFound = false;

    for (const manufacturerDoc of manufacturersSnapshot.docs) {
      const manufacturerId = manufacturerDoc.id;

      const electricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Electric');
      const nonElectricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Non-Electric');

      const electricQuery = query(electricBikesRef, where('chassisNumber', '==', chassisNumber));
      const nonElectricQuery = query(nonElectricBikesRef, where('chassisNumber', '==', chassisNumber));

      const [electricSnapshot, nonElectricSnapshot] = await Promise.all([
        getDocs(electricQuery),
        getDocs(nonElectricQuery)
      ]);

      for (const doc of electricSnapshot.docs) {
        await deleteDoc(doc.ref);
        bikeFound = true;
      }

      for (const doc of nonElectricSnapshot.docs) {
        await deleteDoc(doc.ref);
        bikeFound = true;
      }

      if (bikeFound) break;
    }

    if (!bikeFound) {
      return res.status(404).json({ message: 'No bike found with the provided chassis number' });
    }

    return res.status(200).json({ message: 'Bike deleted successfully' });
  } catch (error) {
    console.error('Error deleting bike by chassis number:', error);
    return res.status(500).json({ message: 'Error deleting bike', error: error.message });
  }
});

BikeInventoryRouter.put('/decreaseStockByChassisNumber/:chassisNumber', async (req, res) => {
  const { chassisNumber } = req.params;

  try {
    const manufacturersRef = collection(db, 'BikeInventory');
    const manufacturersSnapshot = await getDocs(manufacturersRef);
    let bikeFound = false;

    for (const manufacturerDoc of manufacturersSnapshot.docs) {
      const manufacturerId = manufacturerDoc.id;

      const electricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Electric');
      const nonElectricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Non-Electric');

      const electricQuery = query(electricBikesRef, where('chassisNumber', '==', chassisNumber));
      const nonElectricQuery = query(nonElectricBikesRef, where('chassisNumber', '==', chassisNumber));

      const [electricSnapshot, nonElectricSnapshot] = await Promise.all([
        getDocs(electricQuery),
        getDocs(nonElectricQuery)
      ]);

      for (const doc of [...electricSnapshot.docs, ...nonElectricSnapshot.docs]) {
        const bikeData = doc.data();
        const newStockQuantity = bikeData.stockQuantity - 1;

        if (newStockQuantity <= 0) {
          await deleteDoc(doc.ref);
        } else {
          await setDoc(doc.ref, { stockQuantity: newStockQuantity }, { merge: true });
        }
        bikeFound = true;
      }

      if (bikeFound) break;
    }

    if (!bikeFound) {
      return res.status(404).json({ message: 'No bike found with the provided chassis number' });
    }

    return res.status(200).json({ message: 'Stock quantity decreased successfully' });
  } catch (error) {
    console.error('Error decreasing stock quantity by chassis number:', error);
    return res.status(500).json({ message: 'Error decreasing stock quantity', error: error.message });
  }
});

export default BikeInventoryRouter;