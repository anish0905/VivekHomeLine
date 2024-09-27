const express = require('express');
const router = express.Router();
const categoryController = require('../controller/categoryBanner');
const upload = require('../../modules/fileModule'); // Import multer configuration

// Route to create a category banner
router.post('/category-banner', upload.single('image'), categoryController.createCategoryBanner);
router.get('/category-banners', categoryController.getAllCategoryBanners);

// Route to delete a category banner by ID
router.delete('/category-banner/:id', categoryController.deleteCategoryBanner);


module.exports = router;
