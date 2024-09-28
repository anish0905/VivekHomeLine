const GalleryModel = require('../models/gallery');
const multer = require('multer');
const asyncHandler = require('express-async-handler');
const path = require('path');
const upload = require("../../modules/fileModule");

// Controller to create Gallery with file upload
exports.createGallery = asyncHandler(async (req, res) => {
  // Upload file middleware
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message);
    } else if (err) {
      return res.status(500).send("An unknown error occurred.");
    }

    // Validate required fields
    const { title } = req.body;

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Create new Gallery document
    const newGallery = new GalleryModel({
      filename: req.file.filename,
      title,
    });

    // Save to database
    try {
      const createdGallery = await newGallery.save();
      res.status(201).json(createdGallery);
    } catch (error) {
      res.status(500).json({ message: 'Error saving to database', error });
    }
  });
});



exports.getGallery = asyncHandler(async (req,res)=>{

    const Gallery = await GalleryModel.find({});
    res.json(Gallery)

})


// Controller to update Gallery document
exports.updateGallery = asyncHandler(async (req, res) => {
  // Handle file upload if provided
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send(err.message);
    } else if (err) {
      return res.status(500).send("An unknown error occurred.");
    }

    // Validate required fields
    const { id } = req.params;
    const { title, description } = req.body; // Ensure description is included in request body if needed

    try {
      // Find the existing document and update fields
      const updatedGallery = await GalleryModel.findByIdAndUpdate(
        id,
        {
          title,
          description,
          filename: req.file ? req.file.filename : undefined // Update file only if a new one is provided
        },
        { new: true, runValidators: true } // Return the updated document and run validation
      );

      if (!updatedGallery) {
        return res.status(404).json({ message: 'Document not found' });
      }

      res.status(200).json(updatedGallery);
    } catch (error) {
      res.status(500).json({ message: 'Error updating document', error });
    }
  });
});
  // Controller to delete Gallery document
exports.deleteGallery = asyncHandler(async (req, res) => {
    // Extract ID from request parameters
    const { id } = req.params;
  
    // Find and delete the Gallery document
    try {
      const Gallery = await GalleryModel.findById(id);
      if (!Gallery) {
        return res.status(404).json({ message: 'Gallery document not found' });
      }
  
      // Delete the document
      await Gallery.deleteOne();
      res.json({ message: 'Gallery document deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting document', error });
    }
  });
  
