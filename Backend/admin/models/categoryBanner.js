const mongoose = require('mongoose');

const categoryBannerSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,  // Optional: Add required if this field must not be empty
    },
    image: {
        type: String,
        required: true
    }
});

// Create a model from the schema
const CategoryBanner = mongoose.model('CategoryBanner', categoryBannerSchema);

module.exports = CategoryBanner;
