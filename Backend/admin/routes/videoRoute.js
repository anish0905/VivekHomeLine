// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const videoController = require("../controller/videoController"); // Adjust path if necessary
const upload = require("../../middleware/multerMiddleware"); // Adjust path if necessary

// Route to create a new video
router.post(
    '/create',
    upload.fields([{ name: 'video', maxCount: 1 }]), // Upload middleware
    videoController.createVideo
);

// Route to get all videos
router.get('/videoes', videoController.getVideos);

// Route to get a video by ID
router.get('/:id', videoController.getVideo);

// Route to update a video by ID
router.put(
    '/:id',
    upload.fields([{ name: 'video', maxCount: 1 }]), // Optional: If you want to allow video file updates
    videoController.updateVideo
);

// Route to delete a video by ID
router.delete('/:id', videoController.deleteVideoById);

module.exports = router;
