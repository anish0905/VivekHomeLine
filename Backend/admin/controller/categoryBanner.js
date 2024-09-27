const CategoryBanner = require('../models/categoryBanner');
const multer = require('../../modules/fileModule'); // Import multer configuration

// Create a new category banner
exports.createCategoryBanner = async (req, res) => {
    try {
        const { categoryName } = req.body;

        // Ensure a category name is provided
        if (!categoryName) {
            return res.status(400).send({ message: 'Category name is required.' });
        }

        // Assuming you're storing the image path
        const bannerImagePath = req.file.path; // Get the path of the uploaded file

        // Create a new category banner instance with the data from the request body
        const categoryBanner = new CategoryBanner({
            category: categoryName, // Map categoryName to category
            image: bannerImagePath // Store the image path
        });

        // Save the new category banner to the database
        await categoryBanner.save();

        res.status(201).send(categoryBanner);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

// Get all category banners
exports.getAllCategoryBanners = async (req, res) => {
    try {
        const banners = await CategoryBanner.find();
        res.status(200).send(banners);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Delete a category banner by ID
exports.deleteCategoryBanner = async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the request parameters

        // Find and delete the category banner
        const deletedBanner = await CategoryBanner.findByIdAndDelete(id);

        if (!deletedBanner) {
            return res.status(404).send({ message: 'Category banner not found.' });
        }

        res.status(200).send({ message: 'Category banner deleted successfully.' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};