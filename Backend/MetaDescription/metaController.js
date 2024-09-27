const Metadata = require('../MetaDescription/metaModule');

// Create new metadata
exports.createMetadata = async (req, res) => {
    try {
        const newMetadata = new Metadata({
            title: req.body.title,
            description: req.body.description,
            keywords: req.body.keywords, // This will now be an array
            author: req.body.author,
        });

        await newMetadata.save();
        return res.status(201).json({ message: "Metadata created successfully" });
    } catch (error) {
        return res.status(400).json({ message: 'Error creating metadata', error: error.message });
    }
};

// Get all metadata
exports.getAllMetadata = async (req, res) => {
    try {
        const metadataList = await Metadata.find();
        return res.status(200).json({ data: metadataList });
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving metadata", error: error.message });
    }
};

// Update metadata by ID
exports.updateMetadata = async (req, res) => {
    try {
        const updatedMetadata = await Metadata.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedMetadata) {
            return res.status(404).json({ message: 'Metadata not found' });
        }

        return res.status(200).json({ message: 'Metadata updated successfully', data: updatedMetadata });

    } catch (error) {
        return res.status(400).json({ message: 'Error updating metadata', error: error.message });
    }
};

// Delete metadata by ID
exports.deleteMetadata = async (req, res) => {
    try {
        const deletedMetadata = await Metadata.findByIdAndDelete(req.params.id);
        
        if (!deletedMetadata) {
            return res.status(404).json({ message: 'Metadata not found' });
        }
        
        return res.status(200).json({ message: 'Metadata deleted successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Error deleting metadata', error: error.message });
    }
};
