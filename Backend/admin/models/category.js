const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: { 
    type: String, 
    required: true,
    unique: true
  },
  // Category image, if needed
  image: { 
    type: String 
  },
  // Subcategories will now store both name and image for each subcategory
  subcategories: [{ 
    name: { 
      type: String 
    },
    image: { 
      type: String 
    }
  }]
});

// Middleware to convert category and subcategory names to lowercase before saving
categorySchema.pre('save', function (next) {
  this.category = this.category.toLowerCase();
  this.subcategories = this.subcategories.map(subcategory => ({
    ...subcategory,
    name: subcategory.name.toLowerCase()
  }));
  next();
});

module.exports = mongoose.model('Category', categorySchema);
