const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  filename: {
    type: String,

  },
  title: {
    type: String,
 
  },
  description: {
    type: String,
  
  }
});

const Gallery = mongoose.model('gallery', gallerySchema);

module.exports = Gallery;
