import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, setDoc, query, where } from 'firebase/firestore';

const BikeSaleInventoryRouter = express.Router();
// Helper function to remove undefined fields
const removeUndefinedFields = (obj) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
    );
  };

// Create a Sale Bike Inventory
BikeSaleInventoryRouter.post("/", async (req, res) => {
    try {
        const { agent, bikeDetails, priceDetails, registrationDetails } = req.body;

        if (!agent || !bikeDetails || !priceDetails || !registrationDetails) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const { manufacturer, type, chassisNumber } = bikeDetails;

        if (!manufacturer || !type || !chassisNumber) {
            return res.status(400).json({ message: "Manufacturer, Type, and Chassis Number are required." });
        }

        const bikeTypeCollection = collection(db, "BikeInventory", manufacturer, type);
        const bikeQuery = query(bikeTypeCollection, where("chassisNumber", "==", chassisNumber));
        const bikeSnapshot = await getDocs(bikeQuery);

        if (bikeSnapshot.empty) {
            return res.status(404).json({ message: "Bike not found in inventory." });
        }

        // Remove the bike from inventory
        const batchDeletes = bikeSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(batchDeletes);

        // Add bike to SaleBikeInventory
        const newSale = {
            agent,
            bikeDetails,
            priceDetails,
            registrationDetails,
            createdAt: new Date(),
        };

        const saleRef = await addDoc(collection(db, "SaleBikeInventory"), newSale);
        res.status(201).json({ id: saleRef.id, ...newSale });

    } catch (error) {
        console.error("Error adding bike to sale inventory:", error);
        res.status(500).json({ error: error.message });
    }
});

BikeSaleInventoryRouter.post("/revertSale/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      console.log(`Reverting sale for ID: ${id}`);
  
      // Fetch the sold bike data
      const docRef = doc(db, "SaleBikeInventory", id);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        return res.status(404).json({ message: "Sold bike not found" });
      }
  
      const soldBike = docSnap.data();  
      const {
        bikeDetails: {
          manufacturer,
          chassisNumber,
          type,
          model,
          modelYear = "N/A", 
          registrationNumber = 'N/A',
          condition,
          mileage = 0,
          registrationCity = 'N/A',
          purchasePrice,
        },
      } = soldBike;
  
      const bikeData = removeUndefinedFields({
        model,
        modelYear,
        stockQuantity: 1,
        chassisNumber,
        registrationNumber,
        condition,
        mileage,
        registrationCity,
        purchasePrice,
        createdAt: new Date(),
      });
  
      const bikeTypeCollection = collection(db, "BikeInventory", manufacturer, type);
      await addDoc(bikeTypeCollection, bikeData);
  
      await deleteDoc(docRef);
  
      res.status(200).json({ message: "Bike reverted to inventory successfully" });
    } catch (error) {
      console.error("Error reverting sold bike:", error);
      res.status(500).json({ message: "Error reverting sold bike", error: error.message });
    }
  });
  
  
  

// Read All Sale Bike Inventory
BikeSaleInventoryRouter.get("/getAllBikes", async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "SaleBikeInventory"));
        const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a Single Sale Bike Inventory by ID
BikeSaleInventoryRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "SaleBikeInventory", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Sale not found" });
        }
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a Sale Bike Inventory by ID
BikeSaleInventoryRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { agent, bikeDetails, priceDetails, registrationDetails } = req.body;

        // Validate incoming data (you may want to expand this validation)
        if (!agent || !bikeDetails || !priceDetails || !registrationDetails) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const docRef = doc(db, "SaleBikeInventory", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Sale not found" });
        }

        await updateDoc(docRef, {
            agent,
            bikeDetails,
            priceDetails,
            registrationDetails,
            updatedAt: new Date(), // Optionally, add a timestamp
        });

        res.status(200).json({ message: "Sale updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a Sale Bike Inventory by ID
BikeSaleInventoryRouter.delete("/deleteBike/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "SaleBikeInventory", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Sale not found" });
        }

        await deleteDoc(docRef);
        res.status(200).json({ message: "Sale deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



export default BikeSaleInventoryRouter;
