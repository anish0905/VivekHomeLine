const uploadOnCloudinary = require("../../utils/cloudinary.js"); // Correctly import the upload function
const Video = require("../models/video.js");
const fs = require('fs');
const path = require('path');

// Create a video
exports.createVideo = async (req, res) => {
    try {
        let videoLocalPath = null;
        if (req.files && req.files.video && req.files.video.length > 0) {
            videoLocalPath = req.files.video[0].path;
        }

        if (!videoLocalPath) {
            return res.status(400).send("Video file is required");
        }

        const video = await uploadOnCloudinary(videoLocalPath);

        if (!video) {
            return res.status(500).json({ message: 'Failed to upload video' });
        }

        const newVideo = new Video({
            title: req.body.title, // Assuming title is sent in the request body
            video: video.url,
        });

        await newVideo.save();

        res.status(201).json({
            message: 'Video created successfully!',
            video: newVideo,
        });
    } catch (err) {
        console.error(err); // Log any errors
        res.status(500).json({ message: 'Error creating video', error: err.message });
    }
};

// Get all videos
exports.getVideos = async (req, res) => {
    try {
        const videos = await Video.find({});
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting videos' });
    }
};

// Get a video by ID
exports.getVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const video = await Video.findById(videoId);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        res.json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error getting video' });
    }
};

// Update a video by ID
exports.updateVideo = async (req, res) => {
    try {
        const videoId = req.params.id;
        const updateData = req.body;

        // If you're updating the video file as well
        if (req.files && req.files.video && req.files.video.length > 0) {
            const videoLocalPath = req.files.video[0].path;
            const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
            updateData.video = uploadedVideo.url;
        }

        const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, { new: true });

        if (!updatedVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json({
            message: 'Video updated successfully!',
            video: updatedVideo,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating video' });
    }
};

// Delete a video by ID
exports.deleteVideoById = async (req, res) => {
    try {
        const { id } = req.params; // Get the video ID from the request parameters

        // Find the video by ID
        const video = await Video.findById(id);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Optionally, if you're using Cloudinary, delete the video from Cloudinary as well
        // await deleteFromCloudinary(video.video); // Uncomment this line if you have a delete function

        // Delete the video from the database
        await Video.findByIdAndDelete(id);

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (err) {
        console.error(err); // Log any errors
        res.status(500).json({ message: 'Error deleting video', error: err.message });
    }
};