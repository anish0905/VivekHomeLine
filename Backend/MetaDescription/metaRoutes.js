const express = require("express");
const router = express.Router();
const metadataController = require("../MetaDescription/metaController");

// Define routes
router.post("/metadata", metadataController.createMetadata);
router.get("/metadata", metadataController.getAllMetadata);
router.put("/metadata/:id", metadataController.updateMetadata);
router.delete("/metadata/:id", metadataController.deleteMetadata);

module.exports = router;
