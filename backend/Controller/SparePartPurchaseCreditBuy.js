import express from 'express';
import { db } from '../db.js';
import { 
    collection, 
    addDoc, 
    doc, 
    getDocs, 
    query,
    where,
    updateDoc, 
    deleteDoc, 
    getDoc, 
    serverTimestamp,
    orderBy
} from 'firebase/firestore';

const SparepartCreditPurchaseRouter = express.Router();

// Create a new spare part credit purchase
SparepartCreditPurchaseRouter.post("/", async (req, res) => {
    try {
        const {
            formData,
            products,
            supplier,
            paymentsReceived,
            trustedPerson,
            promisedDate
        } = req.body;

        // Validate required fields
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: "Products array is required and cannot be empty" });
        }

        if (!supplier) {
            return res.status(400).json({ message: "Supplier information is required" });
        }

        // Calculate totals for all products
        const totalAmount = products.reduce((sum, product) => sum + (product.total || 0), 0);
        
        // Calculate total paid amount from payments received
        const totalPaid = paymentsReceived.reduce((sum, payment) => 
            sum + (Number(payment.paymentAmount) || 0), 0);

        // Calculate pending balance
        const calculatedPendingBalance = totalAmount - totalPaid;

        const purchasesRef = collection(db, "SparePartCreditPurchases");
        const docRef = await addDoc(purchasesRef, {
            formData: {
                ...formData,
                totalAmount,
                createdDate: new Date().toISOString()
            },
            products: products.map(product => ({
                ...product,
                unitPrice: Number(product.unitPrice),
                quantity: Number(product.quantity),
                total: Number(product.total)
            })),
            supplier,
            priceDetails: {
                totalAmount,
                totalPaid,
                lastPaymentDate: paymentsReceived.length > 0 ? paymentsReceived[0].paymentDate : null
            },
            paymentsReceived,
            trustedPerson,
            pendingBalance: calculatedPendingBalance,
            promisedDate,
            createdOn: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            status: calculatedPendingBalance > 0 ? 'active' : 'completed',
            addType: "SparePart"
        });

        // Fetch the newly created document to return complete data
        const newDocSnap = await getDoc(docRef);

        res.status(201).json({ 
            message: "Spare part credit purchase created successfully", 
            id: docRef.id,
            data: { id: docRef.id, ...newDocSnap.data() }
        });
    } catch (error) {
        console.error("Error creating spare part credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all credit purchases with optional filtering
SparepartCreditPurchaseRouter.get("/", async (req, res) => {
    try {
        const { status, startDate, endDate, sort = 'desc' } = req.query;
        let purchasesRef = collection(db, "SparePartCreditPurchases");
        
        // Build query based on filters
        let q = purchasesRef;
        
        if (status) {
            q = query(q, where("status", "==", status));
        }
        
        if (startDate && endDate) {
            q = query(q, 
                where("createdOn", ">=", new Date(startDate)),
                where("createdOn", "<=", new Date(endDate))
            );
        }

        // Add sorting
        q = query(q, orderBy("createdOn", sort));

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return res.status(200).json([]);
        }

        const purchases = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(purchases);
    } catch (error) {
        console.error("Error fetching spare part credit purchases:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get a specific credit purchase by ID
SparepartCreditPurchaseRouter.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const purchaseRef = doc(db, "SparePartCreditPurchases", id);
        const docSnap = await getDoc(purchaseRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ message: "Spare part credit purchase not found" });
        }

        res.status(200).json({ 
            id: docSnap.id, 
            ...docSnap.data() 
        });
    } catch (error) {
        console.error("Error fetching spare part credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Update a credit purchase with new payment
SparepartCreditPurchaseRouter.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const { 
            paymentAmount, 
            paymentDate, 
            paymentMode,
            formData,
            products,
            supplier,
            trustedPerson,
            promisedDate,
            remarks
        } = req.body;

        // Validate required payment fields
        if (paymentAmount === undefined || !paymentDate || !paymentMode) {
            return res.status(400).json({ 
                message: "Payment amount, date, and mode are required." 
            });
        }

        const docRef = doc(db, "SparePartCreditPurchases", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ 
                message: "Spare part credit purchase not found" 
            });
        }

        const creditPurchaseData = docSnap.data();

        // Prepare new payment with remarks
        const newPayment = { 
            paymentAmount: Number(paymentAmount), 
            paymentDate, 
            paymentMode,
            remarks: remarks || ''
        };
        const updatedPayments = [newPayment, ...creditPurchaseData.paymentsReceived];

        // Calculate new pending balance
        const updatedPendingBalance = Math.max(
            creditPurchaseData.priceDetails.totalAmount - 
            (creditPurchaseData.priceDetails.totalPaid + Number(paymentAmount)), 
            0
        );

        // Update status if balance is zero
        const status = updatedPendingBalance === 0 ? 'completed' : 'active';

        // Prepare updated data
        const updatedData = {
            paymentsReceived: updatedPayments,
            pendingBalance: updatedPendingBalance,
            status,
            formData: formData || creditPurchaseData.formData,
            products: products || creditPurchaseData.products,
            supplier: supplier || creditPurchaseData.supplier,
            priceDetails: {
                ...creditPurchaseData.priceDetails,
                totalPaid: creditPurchaseData.priceDetails.totalPaid + Number(paymentAmount),
                lastPaymentDate: paymentDate
            },
            trustedPerson: trustedPerson || creditPurchaseData.trustedPerson,
            promisedDate: promisedDate || creditPurchaseData.promisedDate,
            lastUpdated: serverTimestamp()
        };

        // Update document
        await updateDoc(docRef, updatedData);

        // Fetch updated document
        const updatedDocSnap = await getDoc(docRef);

        res.status(200).json({ 
            message: "Spare part credit purchase updated successfully", 
            data: {
                id: docRef.id,
                ...updatedDocSnap.data()
            }
        });
    } catch (error) {
        console.error("Error updating spare part credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a credit purchase
SparepartCreditPurchaseRouter.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const docRef = doc(db, "SparePartCreditPurchases", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.status(404).json({ 
                message: "Spare part credit purchase not found" 
            });
        }

        // Store document data before deletion for response
        const deletedData = docSnap.data();

        await deleteDoc(docRef);
        res.status(200).json({ 
            message: "Spare part credit purchase deleted successfully",
            deletedData: {
                id,
                ...deletedData
            }
        });
    } catch (error) {
        console.error("Error deleting spare part credit purchase:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get credit purchases by supplier
SparepartCreditPurchaseRouter.get("/supplier/:supplierId", async (req, res) => {
    const { supplierId } = req.params;
    const { status } = req.query;
    
    try {
        let purchasesRef = collection(db, "SparePartCreditPurchases");
        let q = query(purchasesRef, where("supplier.id", "==", supplierId));
        
        if (status) {
            q = query(q, where("status", "==", status));
        }

        q = query(q, orderBy("createdOn", "desc"));
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(404).json({ 
                message: "No credit purchases found for this supplier" 
            });
        }

        const purchases = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate supplier statistics
        const totalPurchases = purchases.length;
        const totalAmount = purchases.reduce((sum, p) => sum + p.priceDetails.totalAmount, 0);
        const totalPaid = purchases.reduce((sum, p) => sum + p.priceDetails.totalPaid, 0);
        const totalPending = purchases.reduce((sum, p) => sum + p.pendingBalance, 0);

        res.status(200).json({
            purchases,
            statistics: {
                totalPurchases,
                totalAmount,
                totalPaid,
                totalPending
            }
        });
    } catch (error) {
        console.error("Error fetching supplier's credit purchases:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get active credit purchases (with pending balance)
SparepartCreditPurchaseRouter.get("/status/active", async (req, res) => {
    try {
        const purchasesRef = collection(db, "SparePartCreditPurchases");
        const q = query(
            purchasesRef, 
            where("status", "==", "active"),
            where("pendingBalance", ">", 0),
            orderBy("pendingBalance", "desc")
        );
        
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return res.status(200).json({
                purchases: [],
                statistics: {
                    totalActivePurchases: 0,
                    totalPendingAmount: 0
                }
            });
        }

        const activePurchases = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Calculate statistics for active purchases
        const statistics = {
            totalActivePurchases: activePurchases.length,
            totalPendingAmount: activePurchases.reduce((sum, purchase) => 
                sum + purchase.pendingBalance, 0
            )
        };

        res.status(200).json({
            purchases: activePurchases,
            statistics
        });
    } catch (error) {
        console.error("Error fetching active credit purchases:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get purchases statistics
SparepartCreditPurchaseRouter.get("/statistics/summary", async (req, res) => {
    try {
        const purchasesRef = collection(db, "SparePartCreditPurchases");
        const querySnapshot = await getDocs(purchasesRef);

        if (querySnapshot.empty) {
            return res.status(200).json({
                totalPurchases: 0,
                totalAmount: 0,
                totalPaid: 0,
                totalPending: 0,
                activePurchases: 0,
                completedPurchases: 0
            });
        }

        const purchases = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        const statistics = {
            totalPurchases: purchases.length,
            totalAmount: purchases.reduce((sum, p) => sum + p.priceDetails.totalAmount, 0),
            totalPaid: purchases.reduce((sum, p) => sum + p.priceDetails.totalPaid, 0),
            totalPending: purchases.reduce((sum, p) => sum + p.pendingBalance, 0),
            activePurchases: purchases.filter(p => p.status === 'active').length,
            completedPurchases: purchases.filter(p => p.status === 'completed').length
        };

        res.status(200).json(statistics);
    } catch (error) {
        console.error("Error fetching purchase statistics:", error);
        res.status(500).json({ error: error.message });
    }
});

export default SparepartCreditPurchaseRouter;