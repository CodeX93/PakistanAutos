import express from 'express';
import { db } from '../db.js';
import { collection, addDoc, doc, getDocs, updateDoc, deleteDoc, getDoc, query, where } from 'firebase/firestore';

const SubCategoryRouter = express.Router();

// Helper function to check if category exists
const categoryExists = async (categoryId) => {
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    const categoryDoc = await getDoc(categoryRef);
    return categoryDoc.exists();
  } catch (error) {
    console.error('Error checking category existence:', error);
    return false;
  }
};

// Helper function to check if sub-category name is unique within a category
const isNameUniqueInCategory = async (name, categoryId, excludeId = null) => {
  try {
    const subCategoriesRef = collection(db, 'subCategories');
    const q = query(subCategoriesRef, 
      where('categoryId', '==', categoryId),
      where('name', '==', name.trim())
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return true;
    
    // If we're updating, exclude the current sub-category from the uniqueness check
    if (excludeId) {
      const docs = querySnapshot.docs.filter(doc => doc.id !== excludeId);
      return docs.length === 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking sub-category name uniqueness:', error);
    throw error;
  }
};

// Add a sub-category
SubCategoryRouter.post('/add', async (req, res) => {
  try {
    const { categoryId, name } = req.body;

    // Validate input
    if (!categoryId || !name) {
      return res.status(400).json({ error: 'Category ID and name are required' });
    }

    // Check if category exists
    if (!(await categoryExists(categoryId))) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check for unique name within the category
    const isUnique = await isNameUniqueInCategory(name, categoryId);
    if (!isUnique) {
      return res.status(400).json({ 
        error: 'Sub-category name must be unique within the selected category' 
      });
    }

    const subCategory = {
      categoryId,
      name: name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'subCategories'), subCategory);
    res.status(201).json({ message: 'Sub-category added successfully' });
  } catch (error) {
    console.error('Error adding sub-category:', error);
    res.status(500).json({ error: 'Error adding sub-category' });
  }
});

// Update a sub-category
SubCategoryRouter.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, name } = req.body;

    // Validate input
    if (!categoryId || !name) {
      return res.status(400).json({ error: 'Category ID and name are required' });
    }

    // Check if sub-category exists
    const subCategoryRef = doc(db, 'subCategories', id);
    const subCategoryDoc = await getDoc(subCategoryRef);
    if (!subCategoryDoc.exists()) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    // Check if category exists
    if (!(await categoryExists(categoryId))) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check for unique name within the category (excluding current sub-category)
    const isUnique = await isNameUniqueInCategory(name, categoryId, id);
    if (!isUnique) {
      return res.status(400).json({ 
        error: 'Sub-category name must be unique within the selected category' 
      });
    }

    await updateDoc(subCategoryRef, {
      categoryId,
      name: name.trim(),
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({ message: 'Sub-category updated successfully' });
  } catch (error) {
    console.error('Error updating sub-category:', error);
    res.status(500).json({ error: 'Error updating sub-category' });
  }
});

// Delete a sub-category
SubCategoryRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if sub-category exists
    const subCategoryRef = doc(db, 'subCategories', id);
    const subCategoryDoc = await getDoc(subCategoryRef);
    if (!subCategoryDoc.exists()) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    // Optional: Check if sub-category is being used by any spare parts
    // const sparePartsRef = collection(db, 'spareParts');
    // const q = query(sparePartsRef, where('subCategoryId', '==', id));
    // const sparePartsSnapshot = await getDocs(q);
    // if (!sparePartsSnapshot.empty) {
    //   return res.status(400).json({ 
    //     error: 'Cannot delete sub-category that is being used by spare parts' 
    //   });
    // }

    await deleteDoc(subCategoryRef);
    res.status(200).json({ message: 'Sub-category deleted successfully' });
  } catch (error) {
    console.error('Error deleting sub-category:', error);
    res.status(500).json({ error: 'Error deleting sub-category' });
  }
});

// Fetch all sub-categories
SubCategoryRouter.get('/', async (req, res) => {
  try {
    const subCategoriesRef = collection(db, 'subCategories');
    const querySnapshot = await getDocs(subCategoriesRef);
    const subCategories = [];
    
    querySnapshot.forEach((doc) => {
      subCategories.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });

    // Sort by category and then by name
    subCategories.sort((a, b) => {
      if (a.categoryId === b.categoryId) {
        return a.name.localeCompare(b.name);
      }
      return a.categoryId.localeCompare(b.categoryId);
    });

    res.status(200).json(subCategories);
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    res.status(500).json({ error: 'Error fetching sub-categories' });
  }
});

// Fetch sub-categories by category ID
SubCategoryRouter.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category exists
    if (!(await categoryExists(categoryId))) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const subCategoriesRef = collection(db, 'subCategories');
    const q = query(subCategoriesRef, where('categoryId', '==', categoryId));
    const querySnapshot = await getDocs(q);
    const subCategories = [];

    querySnapshot.forEach((doc) => {
      subCategories.push({ 
        id: doc.id, 
        ...doc.data() 
      });
    });

    // Sort by name
    subCategories.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json(subCategories);
  } catch (error) {
    console.error('Error fetching sub-categories:', error);
    res.status(500).json({ error: 'Error fetching sub-categories' });
  }
});

// Fetch a single sub-category by ID
SubCategoryRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subCategoryRef = doc(db, 'subCategories', id);
    const subCategoryDoc = await getDoc(subCategoryRef);

    if (!subCategoryDoc.exists()) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    res.status(200).json({ 
      id: subCategoryDoc.id, 
      ...subCategoryDoc.data() 
    });
  } catch (error) {
    console.error('Error fetching sub-category:', error);
    res.status(500).json({ error: 'Error fetching sub-category' });
  }
});

export default SubCategoryRouter;