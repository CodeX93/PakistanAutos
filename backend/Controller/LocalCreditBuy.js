import express from 'express';
import { db } from '../db.js';
import { collection, addDoc, doc, setDoc, getDocs, query, where, deleteDoc, updateDoc,getDoc } from 'firebase/firestore';

const LocalCreditBuyRouter = express.Router();

// PUT route to add payment to a loan
LocalCreditBuyRouter.put('/addPayment/:loanId', async (req, res) => {
    const { loanId } = req.params;
    const { payment } = req.body;
  
    try {
      const {
        amount,
        date,
        paymentMode // New field
      } = payment;
  
      if (!amount || !date || !paymentMode) {
        return res.status(400).json({ message: 'Invalid payment data' });
      }
  
      const loanRef = doc(db, 'LocalCreditBuys', loanId);
      const loanDoc = await getDoc(loanRef);
  
      if (!loanDoc.exists()) {
        return res.status(404).json({ message: 'Loan not found' });
      }
  
      const loanData = loanDoc.data();
      const newPaidAmount = loanData.paidAmount + parseFloat(amount);
  
      if (newPaidAmount > loanData.totalDue) {
        return res.status(400).json({ message: 'Payment amount exceeds remaining balance' });
      }
  
      const newPayment = {
        amount: parseFloat(amount),
        date,
        paymentMode, // Added payment mode
        recordedAt: new Date()
      };
  
      await updateDoc(loanRef, {
        paidAmount: newPaidAmount,
        payments: [...loanData.payments, newPayment],
        status: newPaidAmount >= loanData.totalDue ? 'completed' : 'active'
      });
  
      return res.status(200).json({ message: 'Payment added successfully' });
    } catch (error) {
      console.error('Error adding payment:', error);
      return res.status(500).json({ message: 'Error adding payment', error: error.message });
    }
  });

// GET route to fetch all loans
LocalCreditBuyRouter.get('/getAllLoans', async (req, res) => {
  try {
    const loansRef = collection(db, 'LocalCreditBuys');
    const loansSnapshot = await getDocs(loansRef);
    const loans = [];

    loansSnapshot.forEach((doc) => {
      loans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    if (loans.length === 0) {
      return res.status(200).json({ message: 'No loans found', loans: [] });
    }

    return res.status(200).json({ loans });
  } catch (error) {
    console.error('Error fetching loans:', error);
    return res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
});

// GET route to fetch loan by ID
LocalCreditBuyRouter.get('/getLoan/:loanId', async (req, res) => {
  const { loanId } = req.params;

  try {
    const loanRef = doc(db, 'Loans', loanId);
    const loanDoc = await getDocs(loanRef);

    if (!loanDoc.exists()) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    return res.status(200).json({ 
      loan: {
        id: loanDoc.id,
        ...loanDoc.data()
      }
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    return res.status(500).json({ message: 'Error fetching loan', error: error.message });
  }
});

// PUT route to add payment to a loan
LocalCreditBuyRouter.put('/addPayment/:loanId', async (req, res) => {
    const { loanId } = req.params;
    const { payment } = req.body;
  
    try {
      const {
        amount,
        date
      } = payment;
  
      if (!amount || !date) {
        return res.status(400).json({ message: 'Invalid payment data' });
      }
  
      const loanRef = doc(db, 'LocalCreditBuys', loanId); // Changed from 'Loans' to 'LocalCreditBuys'
      const loanDoc = await getDoc(loanRef); // Changed from getDocs to getDoc
  
      if (!loanDoc.exists()) {
        return res.status(404).json({ message: 'Loan not found' });
      }
  
      const loanData = loanDoc.data();
      const newPaidAmount = loanData.paidAmount + parseFloat(amount);
  
      if (newPaidAmount > loanData.totalDue) {
        return res.status(400).json({ message: 'Payment amount exceeds remaining balance' });
      }
  
      const newPayment = {
        amount: parseFloat(amount),
        date,
        recordedAt: new Date()
      };
  
      // Update loan document
      await updateDoc(loanRef, {
        paidAmount: newPaidAmount,
        payments: [...loanData.payments, newPayment],
        status: newPaidAmount >= loanData.totalDue ? 'completed' : 'active'
      });
  
      return res.status(200).json({ message: 'Payment added successfully' });
    } catch (error) {
      console.error('Error adding payment:', error);
      return res.status(500).json({ message: 'Error adding payment', error: error.message });
    }
  });

// PUT route to update loan details
LocalCreditBuyRouter.put('/updateLoan/:loanId', async (req, res) => {
  const { loanId } = req.params;
  const { loan } = req.body;

  try {
    const loanRef = doc(db, 'Loans', loanId);
    const loanDoc = await getDocs(loanRef);

    if (!loanDoc.exists()) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    const updatedData = {
      ...loan,
      updatedAt: new Date()
    };

    await updateDoc(loanRef, updatedData);

    return res.status(200).json({ message: 'Loan updated successfully' });
  } catch (error) {
    console.error('Error updating loan:', error);
    return res.status(500).json({ message: 'Error updating loan', error: error.message });
  }
});

// DELETE route to delete a loan
LocalCreditBuyRouter.delete('/deleteLoan/:loanId', async (req, res) => {
  const { loanId } = req.params;

  try {
    const loanRef = doc(db, 'Loans', loanId);
    const loanDoc = await getDocs(loanRef);

    if (!loanDoc.exists()) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    await deleteDoc(loanRef);

    return res.status(200).json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    return res.status(500).json({ message: 'Error deleting loan', error: error.message });
  }
});

// GET route to search loans by name
LocalCreditBuyRouter.get('/searchLoans', async (req, res) => {
  const { name } = req.query;

  try {
    const loansRef = collection(db, 'LocalCreditBuys');
    let loansQuery;

    if (name) {
      // Create case-insensitive search query
      const nameQuery = name.toLowerCase();
      loansQuery = query(loansRef, where('name', '>=', nameQuery), where('name', '<=', nameQuery + '\uf8ff'));
    } else {
      loansQuery = loansRef;
    }

    const loansSnapshot = await getDocs(loansQuery);
    const loans = [];

    loansSnapshot.forEach((doc) => {
      loans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return res.status(200).json({ loans });
  } catch (error) {
    console.error('Error searching loans:', error);
    return res.status(500).json({ message: 'Error searching loans', error: error.message });
  }
});

export default LocalCreditBuyRouter;