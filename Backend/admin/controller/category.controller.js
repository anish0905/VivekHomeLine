const Category = require('../models/category');

// POST: Create a new category with images and subcategories
exports.createCategory = async (req, res) => {
  try {
    const { category, subcategories } = req.body;
    const categoryImage = req.files['categoryImage'] ? req.files['categoryImage'][0].path : null;
    const subcategoryImages = req.files['subcategoryImages'] || [];

    // Ensure subcategories are strings, even if passed as objects
    const subcategoriesWithImages = subcategories.map((subcategory, index) => ({
      name: typeof subcategory === 'string' ? subcategory : subcategory.name, // Handle object case
      image: subcategoryImages[index] ? subcategoryImages[index].path : null // Assign the correct subcategory image if available
    }));

    const newCategory = new Category({
      category,
      image: categoryImage, // Save category image if available
      subcategories: subcategoriesWithImages
    });

    await newCategory.save();

    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error });
  }
};





// GET: Retrieve all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving categories', error });
  }
};

// GET: Retrieve a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving category', error });
  }
};

// PUT: Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const { category, subcategories } = req.body;

    // Get the category image if provided, otherwise keep it unchanged
    const categoryImage = req.files['categoryImage'] ? req.files['categoryImage'][0].path : undefined; 

    // Get subcategory images if provided
    const subcategoryImages = req.files['subcategoryImages'] || []; 

    // Ensure subcategories are strings, even if passed as objects
    const subcategoriesWithImages = subcategories.map((subcategory, index) => ({
      name: typeof subcategory === 'string' ? subcategory : subcategory.name, // Handle object case
      image: subcategoryImages[index] ? subcategoryImages[index].path : undefined // Assign the correct subcategory image if available
    }));

    // Prepare the updated data object
    const updatedData = {
      category,
      ...(categoryImage && { image: categoryImage }), // Include category image only if provided
      subcategories: subcategoriesWithImages // Updated subcategories with images
    };

    // Update the category by ID
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    // Check if the category was found and updated
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Send the response with updated category details
    return res.status(200).json({
      message: 'Category updated successfully',
      category: updatedCategory, // This will include the updated category details
    });
    
  } catch (error) {
    // Log the actual error to understand the issue
    console.log('Error while updating category:', error);

    // Respond with error
    return res.status(500).json({ message: 'Error updating category', error });
  }
};



// DELETE: Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deletedCategory) return res.status(404).json({ message: 'Category not found' });

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error });
  }
};





// POST: Add a subcategory to a specific category
exports.addSubcategory = async (req, res) => {
  try {
    const { subcategory } = req.body;
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check if the subcategory already exists
    const lowerCaseSubcategory = subcategory.toLowerCase();
    if (category.subcategories.includes(lowerCaseSubcategory)) {
      return res.status(400).json({ message: 'Subcategory already exists' });
    }

    // Add the new subcategory to the array
    category.subcategories.push(lowerCaseSubcategory);

    // Save the updated category
    await category.save();

    res.status(200).json({ message: 'Subcategory added successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error adding subcategory', error });
  }
};



// PUT: Update a subcategory in a specific category
exports.updateSubcategory = async (req, res) => {
  try {
    const { subcategory, newSubcategory } = req.body;
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Convert subcategories to lowercase
    const lowerCaseSubcategory = subcategory.toLowerCase();
    const lowerCaseNewSubcategory = newSubcategory.toLowerCase();

    // Find the index of the subcategory to update
    const subcategoryIndex = category.subcategories.indexOf(lowerCaseSubcategory);
    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Update the subcategory
    category.subcategories[subcategoryIndex] = lowerCaseNewSubcategory;

    // Save the updated category
    await category.save();

    res.status(200).json({ message: 'Subcategory updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error updating subcategory', error });
  }
};



// DELETE: Delete a subcategory from a specific category
exports.deleteSubcategory = async (req, res) => {
  try {
    const { subcategory } = req.body;
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Convert the subcategory to lowercase
    const lowerCaseSubcategory = subcategory.toLowerCase();

    // Check if the subcategory exists
    const subcategoryIndex = category.subcategories.indexOf(lowerCaseSubcategory);
    if (subcategoryIndex === -1) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    // Remove the subcategory from the array
    category.subcategories.splice(subcategoryIndex, 1);

    // Save the updated category
    await category.save();

    res.status(200).json({ message: 'Subcategory deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting subcategory', error });
  }
};


exports.getSubcategories = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    // Find the category by ID
    
    const category = await Category.findById(categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.status(200).json(category.subcategories
    );
   
    
  } catch (error) {
      res.status(500).json({ message: 'Error retrieving subcategories', error });
  }
}
