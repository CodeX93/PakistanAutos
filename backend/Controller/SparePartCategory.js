import express from 'express';
import { db } from '../db.js';
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

const CategoryRouter = express.Router();

// Check if category name is unique
const isNameUnique = async (name) => {
  const categoriesCollectionRef = collection(db, 'categories');
  const q = query(categoriesCollectionRef, where('name', '==', name));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty; // True if the category name does not exist
};

// Add a category
CategoryRouter.post('/add', async (req, res) => {
  try {
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check for unique name (case-insensitive)
    const isUnique = await isNameUnique(name.trim());
    if (!isUnique) {
      return res.status(400).json({ error: 'Category name must be unique' });
    }

    await addDoc(collection(db, 'categories'), { 
      name: name.trim(),
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({ message: 'Category added successfully' });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Error adding category' });
  }
});

// Update a category
CategoryRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if the category exists
    const categoryRef = doc(db, 'categories', id);
    const categorySnapshot = await getDoc(categoryRef);
    
    if (!categorySnapshot.exists()) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // If the name is being changed, check for uniqueness
    const currentName = categorySnapshot.data().name;
    if (currentName.toLowerCase() !== name.trim().toLowerCase()) {
      const isUnique = await isNameUnique(name.trim());
      if (!isUnique) {
        return res.status(400).json({ error: 'Category name must be unique' });
      }
    }

    await updateDoc(categoryRef, { 
      name: name.trim(),
      updatedAt: new Date().toISOString()
    });
    
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error updating category' });
  }
});

// Delete a category
CategoryRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the category exists
    const categoryRef = doc(db, 'categories', id);
    const categorySnapshot = await getDoc(categoryRef);
    
    if (!categorySnapshot.exists()) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category is being used by any spare parts (you may want to add this check)
    // const sparePartsRef = collection(db, 'spareParts');
    // const q = query(sparePartsRef, where('categoryId', '==', id));
    // const sparePartsSnapshot = await getDocs(q);
    // if (!sparePartsSnapshot.empty) {
    //   return res.status(400).json({ error: 'Cannot delete category that is being used by spare parts' });
    // }

    await deleteDoc(categoryRef);
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error deleting category' });
  }
});

// Fetch all categories
CategoryRouter.get('/', async (req, res) => {
  try {
    const categoriesCollectionRef = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesCollectionRef);
    const categories = [];
    
    querySnapshot.forEach((doc) => {
      categories.push({ 
        id: doc.id, 
        ...doc.data()
      });
    });

    // Sort categories alphabetically by name
    categories.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
});

// Fetch a category by ID
CategoryRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categoryRef = doc(db, 'categories', id);
    const categorySnapshot = await getDoc(categoryRef);

    if (!categorySnapshot.exists()) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ 
      id: categorySnapshot.id, 
      ...categorySnapshot.data() 
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Error fetching category' });
  }
});

export default CategoryRouter;