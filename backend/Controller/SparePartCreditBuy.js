import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const SparePartCreditBuysRouter = express.Router();

// Create a new Spare Part Credit Buy
SparePartCreditBuysRouter.post("/", async (req, res) => {
    try {
        const { products, purchaserDetails, addType, clientDetails, trustedPerson, paymentsReceived, promisedDate, paidAmount } = req.body;

        // Validate required fields
        if (!products || !purchaserDetails || !addType || !clientDetails || !trustedPerson || !paymentsReceived || !promisedDate || paidAmount === undefined) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Calculate total and pending balance
        const total = products.reduce((acc, item) => acc + item.unitSellingPrice * item.quantity, 0);
        const pendingBalance = total - paidAmount;

        const newPurchase = {
            products,
            purchaserDetails,
            addType,
            pendingBalance,
            clientDetails,
            trustedPerson,
            createdOn: serverTimestamp(),
            paymentsReceived: paymentsReceived.reverse(), // Stack structure: add newest payment first
            promisedDate,
        };

        const docRef = await addDoc(collection(db, "SparePartCreditBuys"), newPurchase);
        res.status(201).json({ id: docRef.id, ...newPurchase });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read All Spare Part Credit Buys
SparePartCreditBuysRouter.get("/", async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "SparePartCreditBuys"));
        const purchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a Single Spare Part Credit Buy by ID
SparePartCreditBuysRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "SparePartCreditBuys", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Spare Part Credit Buy not found" });
        }
        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

SparePartCreditBuysRouter.put("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { paymentAmount, paymentDate, paymentMode } = req.body;

        console.log(req.params)
        console.log(req.body)

        if (paymentAmount === undefined || !paymentDate || !paymentMode) {
            return res.status(400).json({ message: "Payment amount, date, and mode are required." });
        }

        const docRef = doc(db, "SparePartCreditBuys", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Spare Part Credit Buy not found" });
        }

        const creditBuyData = docSnap.data();

        // Add new payment to `paymentsReceived`
        const newPayment = { paymentAmount, paymentDate, paymentMode };
        const updatedPayments = [newPayment, ...creditBuyData.paymentsReceived];  // Add to the beginning of the array

        // Update the pending balance
        const updatedPendingBalance = Math.max(creditBuyData.pendingBalance - paymentAmount, 0);

        // Create the update object
        const updatedPurchase = {
            paymentsReceived: updatedPayments,
            pendingBalance: updatedPendingBalance,
            updatedAt: new Date(), // Optional timestamp for tracking updates
        };

        await updateDoc(docRef, updatedPurchase);

        res.status(200).json({ message: "Payment added successfully", updatedPurchase });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({ error: error.message });
    }
});



// Delete a Spare Part Credit Buy by ID
SparePartCreditBuysRouter.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "SparePartCreditBuys", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Spare Part Credit Buy not found" });
        }

        await deleteDoc(docRef);
        res.status(200).json({ message: "Spare Part Credit Buy deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default SparePartCreditBuysRouter;
