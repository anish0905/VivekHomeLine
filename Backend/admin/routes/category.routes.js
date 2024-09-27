const express = require('express');
const router = express.Router();
const categoryController = require('../controller/category.controller');
const upload = require('../../middleware/multerConfig');

// Create a new category
// Modify Multer to handle category image and subcategory images
router.post('/', upload.fields([{ name: 'categoryImage', maxCount: 1 }, { name: 'subcategoryImages', maxCount: 10 }]), categoryController.createCategory);


// Get all categories
router.get('/', categoryController.getCategories);

// Get a single category by ID
router.get('/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/:id', upload.fields([{ name: 'categoryImage', maxCount: 1 }, { name: 'subcategoryImages', maxCount: 10 }]), categoryController.updateCategory);

// Delete a category by ID
router.delete('/:id', categoryController.deleteCategory);

// Subcategory routes
router.post('/:id/subcategories', categoryController.addSubcategory); // Add a subcategory
router.put('/:id/subcategories', categoryController.updateSubcategory); // Update a subcategory
router.delete('/:id/subcategories', categoryController.deleteSubcategory); // Delete a subcategory
router.get('/:id', categoryController.getSubcategories); //



module.exports = router;
