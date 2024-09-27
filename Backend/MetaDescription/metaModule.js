const mongoose = require("mongoose");

const metadataSchema = new mongoose.Schema({
 
    title: { type: String, required: true },
    description: { type: String, required: true },
    keywords: { type: [String] }, // Ensure it's an array of strings
    author: { type: String },

  createdAt: {
    type: Date,
    default: Date.now, // Timestamp when the metadata is created
  },
});

// Create the Metadata model using the schema
const Metadata = mongoose.model("Metadata", metadataSchema);

module.exports = Metadata;
