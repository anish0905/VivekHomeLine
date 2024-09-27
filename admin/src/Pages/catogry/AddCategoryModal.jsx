import React, { useState } from 'react';
import { Button } from '@/components/ui/button'; // Ensure correct path for Button

const AddCategoryModal = ({ isOpen, onClose, onSave }) => {
  const [category, setCategory] = useState('');
  const [subcategories, setSubcategories] = useState([{ name: '', files: '' }]);
  const [categoryImage, setCategoryImage] = useState(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState(null);
  const [subcategoryImagePreviews, setSubcategoryImagePreviews] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('category', category);
    formData.append('categoryImage', categoryImage); // For main category image
  
    subcategories.forEach((subcategory, index) => {
      formData.append(`subcategories[${index}][name]`, subcategory.name);
      formData.append('subcategoryImages', subcategory.files); // For subcategory images
    });
  
    onSave(formData); // Send data to backend
    resetForm();
  };
  

  const resetForm = () => {
    setCategory('');
    setSubcategories([{ name: '', files: '' }]);
    setCategoryImage(null);
    setCategoryImagePreview(null);
    setSubcategoryImagePreviews([]);
    onClose();
  };

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, { name: '', files: '' }]);
    setSubcategoryImagePreviews([...subcategoryImagePreviews, null]); // Reset preview for new subcategory
  };

  const handleSubcategoryChange = (index, key, value) => {
    const updatedSubcategories = [...subcategories];
    updatedSubcategories[index][key] = value;
    setSubcategories(updatedSubcategories);
  };

  const handleRemoveSubcategory = (index) => {
    const updatedSubcategories = subcategories.filter((_, i) => i !== index);
    const updatedPreviews = subcategoryImagePreviews.filter((_, i) => i !== index);
    setSubcategories(updatedSubcategories);
    setSubcategoryImagePreviews(updatedPreviews);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) { // Example: 2MB limit
      alert('File size must be less than 2MB');
      return;
    }
    setCategoryImage(file);
    const reader = new FileReader();
    reader.onload = () => setCategoryImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubcategoryImageChange = (e, index) => {
    const updatedSubcategories = [...subcategories];
    const file = e.target.files[0];
    updatedSubcategories[index].files = file;

    const reader = new FileReader();
    reader.onload = () => {
      const updatedPreviews = [...subcategoryImagePreviews];
      updatedPreviews[index] = reader.result;
      setSubcategoryImagePreviews(updatedPreviews);
    };
    if (file) reader.readAsDataURL(file);

    setSubcategories(updatedSubcategories);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-y-auto"> {/* Added max-height and overflow */}
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleSubmit}>
          {/* Category Name */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category Name</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg  text-black"
              required
              minLength={3}
              maxLength={50}
            />
          </div>

          {/* Category Image */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Category Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border rounded-lg text-black"
              required
            />
            {categoryImagePreview && (
              <img src={categoryImagePreview} alt="Category Preview" className="mt-2 w-full h-auto" />
            )}
          </div>

          {/* Subcategories */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Subcategories</label>
            {subcategories.map((subcategory, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={subcategory.name}
                    onChange={(e) =>
                      handleSubcategoryChange(index, 'name', e.target.value)
                    }
                    placeholder="Subcategory name"
                    className="w-full px-3 py-2 border rounded-lg mr-2 text-black"
                    required
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveSubcategory(index)}
                    className="ml-2 text-red-500"
                  >
                    &times;
                  </Button>
                </div>
                <input
                  type="file"
                  onChange={(e) => handleSubcategoryImageChange(e, index)}
                  className="w-full px-3 py-2 border rounded-lg mt-2 text-slate-800"
                />
                {subcategoryImagePreviews[index] && (
                  <img src={subcategoryImagePreviews[index]} alt={`Subcategory Preview ${index}`} className="mt-2 w-full h-auto" />
                )}
              </div>
            ))}
            <Button type="button" onClick={handleAddSubcategory} className="text-blue-500">
              + Add Subcategory
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <Button type="button" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 text-white">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategoryModal;
