import express from 'express';
import { db } from '../db.js'; 
import { collection, addDoc, doc, setDoc,getDocs,query,where,deleteDoc } from 'firebase/firestore';

const BikeInventoryRouter = express.Router();

// POST route to add Inventory
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
  
      if (!manufacturerName || !model || !modelYear || !stockQuantity || !Array.isArray(bikeEntries) || bikeEntries.length === 0) {
        return res.status(400).json({ message: 'Invalid input data' });
      }
  
      const manufacturerRef = doc(db, 'BikeInventory', manufacturerName);
      await setDoc(manufacturerRef, { name: manufacturerName }, { merge: true });
  
      const bikePromises = bikeEntries.map(async (entry) => {
        const {
          chassisNumber,
          registrationNumber = 'NA',
          condition,
          mileage = 0,
          registrationCity = 'NA',
          purchasePrice,
          sellerInfo,
          type,
          cc,
          stroke,
          power,
          range
        } = entry;
  
        if (!chassisNumber || !condition || !purchasePrice || !type) {
          throw new Error('Missing required fields in bike entry');
        }
  
        const bikeTypeCollection = collection(manufacturerRef, type);
        const bikeData = {
          model,
          modelYear,
          stockQuantity: 1,
          purchaseDate,
          chassisNumber,
          registrationNumber,
          condition,
          mileage,
          registrationCity,
          purchasePrice,
          sellerInfo,
          createdAt: new Date()
        };
  
        if (type === 'Electric') {
          bikeData.batteryPower = power || 'NA';
          bikeData.range = range || 'NA';
        } else if (type === 'Non-Electric') {
          bikeData.cc = cc || 'NA';
          bikeData.stroke = stroke || 'NA';
        }
  
        await addDoc(bikeTypeCollection, bikeData);
      });
  
      await Promise.all(bikePromises);
      res.status(200).json({ message: 'Bikes added successfully!' });
    } catch (error) {
      console.error('Error adding bikes:', error);
      res.status(500).json({ message: 'Failed to add bikes', error: error.message });
    }
  });
  
BikeInventoryRouter.get('/getAllInventory', async (req, res) => {
    try {
        // Reference to the BikeInventory collection (top-level for manufacturers)
        const manufacturersRef = collection(db, 'BikeInventory');
        
        // Get all manufacturers
        const manufacturersSnapshot = await getDocs(manufacturersRef);
        const allInventory = [];

        // Loop through each manufacturer
        for (const manufacturerDoc of manufacturersSnapshot.docs) {
            const manufacturerId = manufacturerDoc.id; // Manufacturer name (e.g., 'Suzuki', 'Yamaha')
            
            // Array of bike types
            const bikeTypes = ['Electric', 'Non-Electric'];

            // Loop through each bike type
            for (const bikeType of bikeTypes) {
                // Reference for the bike type subcollection
                const bikesRef = collection(db, 'BikeInventory', manufacturerId, bikeType);
                
                // Fetch all bikes of the current type for the manufacturer
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

        // Check if there is any inventory data to return
        if (allInventory.length === 0) {
            return res.status(200).json({ message: 'No inventory data available' });
        }

        // Return the combined inventory
        return res.status(200).json({ inventory: allInventory });

    } catch (error) {
        console.error('Error fetching all inventory data:', error);
        return res.status(500).json({ message: 'Error fetching inventory', error: error.message });
    }
});





BikeInventoryRouter.get('/getBikeByChassisNumber/:chassisNumber', async (req, res) => {
    const { chassisNumber } = req.params;

    try {
        // Reference to the BikeInventory collection (top-level)
        const manufacturersRef = collection(db, 'BikeInventory');
        
        // Get all manufacturers
        const manufacturersSnapshot = await getDocs(manufacturersRef);
        
        const matchingBikes = [];
        
        // Loop through each manufacturer
        for (const manufacturerDoc of manufacturersSnapshot.docs) {
            const manufacturerId = manufacturerDoc.id; // Manufacturer name (e.g., 'Toyota')

            // Subcollections: 'Electric' and 'Non-Electric'
            const electricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Electric');
            const nonElectricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Non-Electric');

            // Query both Electric and Non-Electric collections for matching chassis number
            const electricQuery = query(electricBikesRef, where('chassisNumber', '==', chassisNumber));
            const nonElectricQuery = query(nonElectricBikesRef, where('chassisNumber', '==', chassisNumber));

            const electricSnapshot = await getDocs(electricQuery);
            const nonElectricSnapshot = await getDocs(nonElectricQuery);

            // Add any matching bikes to the result
            electricSnapshot.forEach(doc => matchingBikes.push({ manufacturer: manufacturerId, type: 'Electric', ...doc.data() }));
            nonElectricSnapshot.forEach(doc => matchingBikes.push({ manufacturer: manufacturerId, type: 'Non-Electric', ...doc.data() }));
        }

        if (matchingBikes.length === 0) {
            return res.status(404).json({ message: 'No bike found with the provided chassis number' });
        }

        return res.status(200).json({ bikes: matchingBikes });
    } catch (error) {
        console.error('Error fetching bike by chassis number:', error);
        return res.status(500).json({ message: 'Error fetching bike', error: error.message });
    }
});

BikeInventoryRouter.delete('/removeBikeFromInventory/:chassisNumber', async (req, res) => {
    const { chassisNumber } = req.params;

    try {
        // Reference to the BikeInventory collection (top-level)
        const manufacturersRef = collection(db, 'BikeInventory');
        
        // Get all manufacturers
        const manufacturersSnapshot = await getDocs(manufacturersRef);
        
        let bikeFound = false;

        // Loop through each manufacturer
        for (const manufacturerDoc of manufacturersSnapshot.docs) {
            const manufacturerId = manufacturerDoc.id; // Manufacturer name (e.g., 'Toyota')

            // Subcollections: 'Electric' and 'Non-Electric'
            const electricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Electric');
            const nonElectricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Non-Electric');

            // Query both Electric and Non-Electric collections for matching chassis number
            const electricQuery = query(electricBikesRef, where('chassisNumber', '==', chassisNumber));
            const nonElectricQuery = query(nonElectricBikesRef, where('chassisNumber', '==', chassisNumber));

            const electricSnapshot = await getDocs(electricQuery);
            const nonElectricSnapshot = await getDocs(nonElectricQuery);

            // Delete any matching bike from the Electric collection
            for (const doc of electricSnapshot.docs) {
                await deleteDoc(doc.ref);
                bikeFound = true;
            }

            // Delete any matching bike from the Non-Electric collection
            for (const doc of nonElectricSnapshot.docs) {
                await deleteDoc(doc.ref);
                bikeFound = true;
            }

            // If a bike is found and deleted, exit the loop
            if (bikeFound) {
                break;
            }
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
        // Reference to the BikeInventory collection (top-level)
        const manufacturersRef = collection(db, 'BikeInventory');
        
        // Get all manufacturers
        const manufacturersSnapshot = await getDocs(manufacturersRef);
        
        let bikeFound = false;

        // Loop through each manufacturer
        for (const manufacturerDoc of manufacturersSnapshot.docs) {
            const manufacturerId = manufacturerDoc.id; // Manufacturer name

            // Subcollections: 'Electric' and 'Non-Electric'
            const electricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Electric');
            const nonElectricBikesRef = collection(db, 'BikeInventory', manufacturerId, 'Non-Electric');

            // Query both Electric and Non-Electric collections for matching chassis number
            const electricQuery = query(electricBikesRef, where('chassisNumber', '==', chassisNumber));
            const nonElectricQuery = query(nonElectricBikesRef, where('chassisNumber', '==', chassisNumber));

            const electricSnapshot = await getDocs(electricQuery);
            const nonElectricSnapshot = await getDocs(nonElectricQuery);

            // Decrease stock quantity for matching electric bikes
            for (const doc of electricSnapshot.docs) {
                const bikeData = doc.data();
                const newStockQuantity = bikeData.stockQuantity - 1;

                if (newStockQuantity <= 0) {
                    await deleteDoc(doc.ref); // Remove document if stock reaches zero
                } else {
                    await setDoc(doc.ref, { stockQuantity: newStockQuantity }, { merge: true }); // Update stock quantity
                }
                bikeFound = true;
            }

            // Decrease stock quantity for matching non-electric bikes
            for (const doc of nonElectricSnapshot.docs) {
                const bikeData = doc.data();
                const newStockQuantity = bikeData.stockQuantity - 1;

                if (newStockQuantity <= 0) {
                    await deleteDoc(doc.ref); // Remove document if stock reaches zero
                } else {
                    await setDoc(doc.ref, { stockQuantity: newStockQuantity }, { merge: true }); // Update stock quantity
                }
                bikeFound = true;
            }

            // If a bike is found and processed, exit the loop
            if (bikeFound) {
                break;
            }
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
