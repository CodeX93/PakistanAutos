import express from "express";
import { db } from "../db.js";
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
} from "firebase/firestore";

const ExpenseRouter = express.Router();

// Add Expense
ExpenseRouter.post("/add", async (req, res) => {
  try {
    const {itemDescription, expenseDate, expenseAmount } = req.body;
    
    if (!itemDescription || !expenseAmount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = {
      itemDescription,
      expenseAmount: Number(expenseAmount),
      expenseDate: expenseDate || new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "expenses"), expense);
    res.status(201).json({ id: docRef.id, ...expense });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

ExpenseRouter.post("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "expenses"),
    );

    const snapshot = await getDocs(q);
    const expenses = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(exp => new Date(exp.expenseDate) >= today);
    
    const total = expenses.reduce((sum, exp) => sum + exp.expenseAmount, 0);
    res.status(200).json({ expenses, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Weekly Expenses
ExpenseRouter.post("/weekly", async (req, res) => {
  try {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "expenses"),
    );

    const snapshot = await getDocs(q);
    const expenses = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(exp => new Date(exp.expenseDate) >= weekStart);
    
    const total = expenses.reduce((sum, exp) => sum + exp.expenseAmount, 0);
    res.status(200).json({ expenses, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Monthly Expenses
ExpenseRouter.post("/monthly", async (req, res) => {
  try {
    const monthStart = new Date();
    monthStart.setDate(monthStart.getDate() - 30);
    monthStart.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "expenses"),
    );

    const snapshot = await getDocs(q);
    const expenses = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(exp => new Date(exp.expenseDate) >= monthStart);
    
    const total = expenses.reduce((sum, exp) => sum + exp.expenseAmount, 0);
    res.status(200).json({ expenses, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Expense
ExpenseRouter.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {itemDescription, expenseDate, expenseAmount } = req.body;

    const docRef = doc(db, "expenses", id);
    const expenseDoc = await getDoc(docRef);

    if (!expenseDoc.exists()) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const updates = {
      ...(itemDescription && { itemDescription }),
      ...(expenseDate && { expenseDate }),
      ...(expenseAmount && { expenseAmount: Number(expenseAmount) })
    };

    await updateDoc(docRef, updates);
    res.status(200).json({ id, ...expenseDoc.data(), ...updates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Expense
ExpenseRouter.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = doc(db, "expenses", id);
    const expenseDoc = await getDoc(docRef);

    if (!expenseDoc.exists() ) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Get All Expenses
ExpenseRouter.get("/getAllExpenses", async (req, res) => {
  try {
    // Create a query to get all documents from the expenses collection
    const q = query(collection(db, "expenses"));
    const snapshot = await getDocs(q);

    // Map through the documents and format the data
    const expenses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      expenseAmount: Number(doc.data().expenseAmount)  // Ensure amount is a number
    }));

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.expenseAmount, 0);

    // Return both the expenses array and the total
    res.status(200).json({
      expenses: expenses,
      total: totalExpenses,
      count: expenses.length
    });

  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      message: "Failed to fetch expenses",
      error: error.message
    });
  }
});

export default ExpenseRouter;