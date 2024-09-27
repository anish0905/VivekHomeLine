
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  video: {
    type: String,
    required: true,
  },

});

module.exports = mongoose.model('video', videoSchema);