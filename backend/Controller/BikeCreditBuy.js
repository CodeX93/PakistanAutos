import express from 'express';
import { db } from '../db.js'; // Assuming Firebase is initialized here
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const BikeCreditBuyRouter=express.Router();


BikeCreditBuyRouter.post("/", async (req, res) => {
    try {
        const {
            agent,
            bikeDetails,
            priceDetails,
            registrationDetails,
            paymentsReceived,
            clientDetails,
            trustedPerson,
            pendingBalance,
            promisedDate
        } = req.body;

        // Add the new BikeCreditSale document to Firestore
        const docRef = await addDoc(collection(db, "BikeCreditSales"), {
            agent,
            bikeDetails,
            priceDetails,
            registrationDetails,
            paymentsReceived,
            clientDetails,
            trustedPerson,
            pendingBalance,
            createdOn: serverTimestamp(),
            addType: "Bike",
            promisedDate
        });

        res.status(201).json({ message: "BikeCreditSale created successfully", id: docRef.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

BikeCreditBuyRouter.get("/", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "BikeCreditSales"));
        const bikeSales = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(bikeSales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

BikeCreditBuyRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "BikeCreditSales", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "BikeCreditSale not found" });
        }

        res.status(200).json({ id: docSnap.id, ...docSnap.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

BikeCreditBuyRouter.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { paymentAmount, paymentDate, paymentMode, agent, bikeDetails, priceDetails, registrationDetails, clientDetails, trustedPerson, promisedDate } = req.body;

        if (paymentAmount === undefined || !paymentDate || !paymentMode) {
            return res.status(400).json({ message: "Payment amount, date, and mode are required." });
        }

        const docRef = doc(db, "BikeCreditSales", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "BikeCreditSale not found" });
        }

        const creditSaleData = docSnap.data();

        // Prepare new payment and updated payments array
        const newPayment = { paymentAmount, paymentDate, paymentMode };
        const updatedPayments = [newPayment, ...creditSaleData.paymentsReceived];

        // Update the pending balance
        const updatedPendingBalance = Math.max(creditSaleData.pendingBalance - paymentAmount, 0);

        // Prepare updated data
        const updatedData = {
            paymentsReceived: updatedPayments,
            pendingBalance: updatedPendingBalance,
            agent: agent || creditSaleData.agent,
            bikeDetails: bikeDetails || creditSaleData.bikeDetails,
            priceDetails: priceDetails || creditSaleData.priceDetails,
            registrationDetails: registrationDetails || creditSaleData.registrationDetails,
            clientDetails: clientDetails || creditSaleData.clientDetails,
            trustedPerson: trustedPerson || creditSaleData.trustedPerson,
            promisedDate: promisedDate || creditSaleData.promisedDate,
            updatedAt: serverTimestamp()
        };

        // Update document
        await updateDoc(docRef, updatedData);

        res.status(200).json({ message: "BikeCreditSale updated successfully", updatedData });
    } catch (error) {
        console.error("Error updating BikeCreditSale:", error);
        res.status(500).json({ error: error.message });
    }
});


BikeCreditBuyRouter.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "BikeCreditSales", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "BikeCreditSale not found" });
        }

        await deleteDoc(docRef);
        res.status(200).json({ message: "BikeCreditSale deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default BikeCreditBuyRouter;