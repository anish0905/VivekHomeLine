
const express = require('express');
const router = express.Router();
const aboutController = require('../controllers/gallery');
router.route('/gallery').post(aboutController.createGallery).get(aboutController.getGallery)
// Route to update an existing About document
router.put('/gallery/:id', aboutController.updateGallery);

// Route to delete an About document
router.delete('/gallery/:id', aboutController.deleteGallery);

module.exports = router ;