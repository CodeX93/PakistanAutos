import express from 'express';
import { db } from '../db.js';
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const BikeCreditPurchaseRouter = express.Router();

// Create a new credit purchase
BikeCreditPurchaseRouter.post("/", async (req, res) => {
    try {
        const {
            bikeDetails,
            seller,
            priceDetails,
            paymentsReceived,
            trustedPerson,
            promisedDate
        } = req.body;

        // Calculate total paid amount from payments received
        const totalPaid = paymentsReceived.reduce((sum, payment) => 
            sum + (Number(payment.paymentAmount) || 0), 0);

        // Calculate pending balance
        const calculatedPendingBalance = Number(priceDetails.purchasePrice) - totalPaid;

        // Add the new BikeCreditPurchase document to Firestore
        const docRef = await addDoc(collection(db, "BikeCreditPurchases"), {
            bikeDetails,
            seller,
            priceDetails: {
                ...priceDetails,
                totalPaid,
            },
            paymentsReceived,
            trustedPerson,
            pendingBalance: calculatedPendingBalance,
            promisedDate,
            createdOn: serverTimestamp(),
            status: calculatedPendingBalance > 0 ? 'active' : 'completed',
            addType: "Bike"
        });

        res.status(201).json({ 
            message: "Bike credit purchase created successfully", 
            id: docRef.id 
        });
    } catch (error) {
        console.error("Error creating bike credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all credit purchases
BikeCreditPurchaseRouter.get("/", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "BikeCreditPurchases"));
        const bikePurchases = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(bikePurchases);
    } catch (error) {
        console.error("Error fetching bike credit purchases:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific credit purchase by ID
BikeCreditPurchaseRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "BikeCreditPurchases", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Bike credit purchase not found" });
        }

        res.status(200).json({ 
            id: docSnap.id, 
            ...docSnap.data() 
        });
    } catch (error) {
        console.error("Error fetching bike credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update a credit purchase with new payment
BikeCreditPurchaseRouter.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { 
            paymentAmount, 
            paymentDate, 
            paymentMode, 
            seller, 
            bikeDetails, 
            priceDetails,
            trustedPerson, 
            promisedDate 
        } = req.body;

        // Validate required payment fields
        if (paymentAmount === undefined || !paymentDate || !paymentMode) {
            return res.status(400).json({ 
                message: "Payment amount, date, and mode are required." 
            });
        }

        const docRef = doc(db, "BikeCreditPurchases", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ 
                message: "Bike credit purchase not found" 
            });
        }

        const creditPurchaseData = docSnap.data();

        // Prepare new payment and update payments array
        const newPayment = { paymentAmount, paymentDate, paymentMode };
        const updatedPayments = [newPayment, ...creditPurchaseData.paymentsReceived];

        // Calculate new pending balance
        const updatedPendingBalance = Math.max(creditPurchaseData.pendingBalance - paymentAmount, 0);

        // Update status if balance is zero
        const status = updatedPendingBalance === 0 ? 'completed' : 'active';

        // Prepare updated data
        const updatedData = {
            paymentsReceived: updatedPayments,
            pendingBalance: updatedPendingBalance,
            status,
            seller: seller || creditPurchaseData.seller,
            bikeDetails: bikeDetails || creditPurchaseData.bikeDetails,
            priceDetails: priceDetails || creditPurchaseData.priceDetails,
            trustedPerson: trustedPerson || creditPurchaseData.trustedPerson,
            promisedDate: promisedDate || creditPurchaseData.promisedDate,
            lastUpdated: serverTimestamp()
        };

        // Update document
        await updateDoc(docRef, updatedData);

        res.status(200).json({ 
            message: "Bike credit purchase updated successfully", 
            updatedData 
        });
    } catch (error) {
        console.error("Error updating bike credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a credit purchase
BikeCreditPurchaseRouter.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "BikeCreditPurchases", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ 
                message: "Bike credit purchase not found" 
            });
        }

        await deleteDoc(docRef);
        res.status(200).json({ 
            message: "Bike credit purchase deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting bike credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get credit purchases by seller
BikeCreditPurchaseRouter.get("/seller/:sellerId", async (req, res) => {
    const { sellerId } = req.params;
    try {
        const querySnapshot = await getDocs(collection(db, "BikeCreditPurchases"));
        const bikePurchases = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(purchase => purchase.seller.id === sellerId);

        if (bikePurchases.length === 0) {
            return res.status(404).json({ 
                message: "No credit purchases found for this seller" 
            });
        }

        res.status(200).json(bikePurchases);
    } catch (error) {
        console.error("Error fetching seller's credit purchases:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get active credit purchases (with pending balance)
BikeCreditPurchaseRouter.get("/status/active", async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, "BikeCreditPurchases"));
        const activePurchases = querySnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            .filter(purchase => purchase.status === 'active' && purchase.pendingBalance > 0);

        res.status(200).json(activePurchases);
    } catch (error) {
        console.error("Error fetching active credit purchases:", error);
        res.status(500).json({ error: error.message });
    }
});

export default BikeCreditPurchaseRouter;