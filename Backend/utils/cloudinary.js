const cloudinary = require("cloudinary").v2; // Import Cloudinary
const fs = require("fs"); // Import fs module

// Configure Cloudinary with your credentials
cloudinary.config({ 
  cloud_name: 'dpxo55dbc', 
  api_key: '698239919572654', 
  api_secret: 'qF5DmPwkKSsfOGcNMfy53Wv752c' 
});

// Function to upload a file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Automatically detect resource type
        });
        
        // Delete the local file after upload
        fs.unlinkSync(localFilePath); 
        return response; // Return the response containing the uploaded file details

    } catch (error) {
        console.error("Error uploading to Cloudinary:", error); // Log the error
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Clean up local file on error
        }
        return null; // Return null if upload failed
    }
};

module.exports = uploadOnCloudinary; // Export the function
