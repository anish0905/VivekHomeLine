import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaPlus, FaTrash } from "react-icons/fa";

const UpdateCategoryModal = ({ isOpen, onClose, onSave, category }) => {
  const URI = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState({
    category: "",
    image: null,
    subcategories: [],
    previewUrl: null,
    subcategoryImages: [],
    subcategoryPreviewUrls: [],
  });

  useEffect(() => {
    if (category) {
      setFormData({
        category: category.category || "",
        image: null,
        subcategories: category.subcategories.map(sub => sub.name) || [],
        previewUrl: category.image ? `${URI}/${category.image}` : null,
        subcategoryImages: category.subcategories.map(sub => sub.image) || [],
        subcategoryPreviewUrls: category.subcategories.map(sub => `${URI}/${sub.image}`) || [],
      });
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files[0]) {
      const file = files[0];
      const previewUrl = URL.createObjectURL(file);
      setFormData({
        ...formData,
        image: file,
        previewUrl: previewUrl,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubcategoryChange = (index, value) => {
    const updatedSubcategories = [...formData.subcategories];
    updatedSubcategories[index] = value;
    setFormData({ ...formData, subcategories: updatedSubcategories });
  };

  const handleSubcategoryImageChange = (index, e) => {
    const file = e.target.files[0];
    const updatedImages = [...formData.subcategoryImages];
    const updatedPreviewUrls = [...formData.subcategoryPreviewUrls];

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updatedImages[index] = file;
      updatedPreviewUrls[index] = previewUrl; // Store preview URL
    }

    setFormData({
      ...formData,
      subcategoryImages: updatedImages,
      subcategoryPreviewUrls: updatedPreviewUrls,
    });
  };

  const handleAddSubcategory = () => {
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, ""],
      subcategoryImages: [...formData.subcategoryImages, null],
      subcategoryPreviewUrls: [...formData.subcategoryPreviewUrls, null], // Initialize preview URL for new subcategory
    });
  };

  const handleRemoveSubcategory = (index) => {
    const updatedSubcategories = [...formData.subcategories];
    const updatedImages = [...formData.subcategoryImages];
    const updatedPreviewUrls = [...formData.subcategoryPreviewUrls];
    
    updatedSubcategories.splice(index, 1);
    updatedImages.splice(index, 1);
    updatedPreviewUrls.splice(index, 1);

    setFormData({
      ...formData,
      subcategories: updatedSubcategories,
      subcategoryImages: updatedImages,
      subcategoryPreviewUrls: updatedPreviewUrls,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const data = new FormData();
    data.append('category', formData.category); // Use formData.category for the category name
    if (formData.image) {
      data.append('categoryImage', formData.image); // Append category image if provided
    }

    formData.subcategories.forEach((subcategory, index) => {
      data.append(`subcategories[${index}][name]`, subcategory); // Append subcategory name
      if (formData.subcategoryImages[index]) {
        data.append(`subcategoryImages`, formData.subcategoryImages[index]); // Append subcategory image if provided
      }
    });

    try {
      const response = await fetch(`${URI}api/categories/${category._id}`, {
        method: "PUT",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      const result = await response.json();
      onSave(result); // Call onSave with updated data
      onClose(); // Close the modal after saving
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Category</DialogTitle>
          <DialogDescription>
            Modify the category details and save the changes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="category">Category Name</Label>
            <Input
              type="text"
              name="category"
              id="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Enter category name"
            />
          </div>

          <div>
            <Label htmlFor="image">Upload Category Image</Label>
            <Input
              type="file"
              name="image"
              id="image"
              onChange={handleChange}
              accept="image/*"
            />
          </div>

          {formData.previewUrl && (
            <div className="mt-4">
              <img
                src={formData.previewUrl}
                alt="Selected category"
                className="h-40 w-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            <Label htmlFor="subcategory">Subcategories</Label>
            {formData.subcategories.map((sub, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="text"
                  value={sub}
                  onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                  placeholder="Enter subcategory"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSubcategoryImageChange(index, e)}
                />
                {formData.subcategoryPreviewUrls[index] && (
                  <img
                    src={formData.subcategoryPreviewUrls[index]}
                    alt={`Preview of ${sub}`}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                )}
                <Button variant="destructive" onClick={() => handleRemoveSubcategory(index)}>
                  <FaTrash />
                </Button>
              </div>
            ))}
            <Button variant="primary" onClick={handleAddSubcategory}>
              <FaPlus /> Add Subcategory
            </Button>
          </div>
          <DialogFooter>
            <Button variant="primary" type="submit">
              <FaPlus /> Save Changes
            </Button>
            <Button variant="destructive" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateCategoryModal;
