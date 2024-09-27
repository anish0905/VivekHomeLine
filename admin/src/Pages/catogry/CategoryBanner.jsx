import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryBanner = () => {
  const [categories, setCategories] = useState([]); // State to hold categories fetched from the API
  const [selectedCategory, setSelectedCategory] = useState(''); // State to hold the selected category
  const [subcategories, setSubcategories] = useState([]); // State to hold subcategories for the selected category
  const [selectedSubcategory, setSelectedSubcategory] = useState(''); // State for selected subcategory
  const [image, setImage] = useState(null); // State to hold the uploaded image
  const [message, setMessage] = useState(''); // State to display success/failure messages
  const [banners, setBanners] = useState([]); // State to hold existing category banners
  const URI = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch categories from the API
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${URI}api/admin/navheaders`);
        setCategories(response.data);
        console.log("Categories fetched successfully:", response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    // Fetch existing banners after component mounts
    const fetchBanners = async () => {
      try {
        const response = await axios.get(`${URI}api/admin/category-banners`);
        setBanners(response.data);
        console.log("Banners fetched successfully:", response.data);
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchCategories();
    fetchBanners(); // Fetch banners when the component mounts
  }, []);

  // Handle category selection
  const handleCategoryChange = (e) => {
    const selectedCat = e.target.value;
    setSelectedCategory(selectedCat);

    // Find the selected category object
    const categoryObject = categories.find(category => category.categories.trim() === selectedCat);
    if (categoryObject) {
      setSubcategories(categoryObject.subcategories || []); // Set subcategories based on selected category
      setSelectedSubcategory(''); // Clear the selected subcategory when changing category
    } else {
      setSubcategories([]); // Clear subcategories if no category is selected
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Prepare form data to send
    const formData = new FormData();
    
    // Check if the image is selected
    if (image) {
      formData.append('image', image);
    } else {
      console.warn('No image selected.'); // Optional logging
    }

    // Send either the selected subcategory or category
    const categoryToSend = selectedSubcategory || selectedCategory;
    formData.append('categoryName', categoryToSend); // Append the correct category name

    try {
      const response = await axios.post(`${URI}api/admin/category-banner`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Category banner created successfully!');
      console.log('Response:', response.data);
      setBanners((prevBanners) => [...prevBanners, response.data]);
    } catch (error) {
      console.error('Error creating category banner:', error.response ? error.response.data : error);
      setMessage('Failed to create category banner.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URI}api/admin/category-banner/${id}`);
      setBanners(banners.filter(banner => banner._id !== id));
      setMessage('Category banner deleted successfully.');
    } catch (error) {
      console.error('Error deleting category banner:', error);
      setMessage('Failed to delete category banner.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Create Category Banner</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Select Category:
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            required
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category._id} value={category.categories.trim()}> {/* Using trim to avoid whitespace issues */}
                {category.categories}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700 mb-1">
            Select Subcategory:
          </label>
          <select
            id="subcategory"
            value={selectedSubcategory}
            onChange={(e) => setSelectedSubcategory(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
            disabled={!subcategories.length} // Disable if there are no subcategories
          >
            <option value="">Select a subcategory (optional)</option>
            {subcategories.map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {subcategory}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Upload Image:
          </label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring focus:ring-blue-500"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          Create Category Banner
        </button>
      </form>

      {message && <p className="mt-4 text-center text-green-600">{message}</p>}

      <h2 className="text-xl font-semibold mb-4 text-center">Existing Category Banners</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((banner) => (
          <div key={banner._id} className="bg-white shadow-md rounded-lg p-4 text-center">
            <h3 className="font-medium text-lg">{banner.category}</h3>
            <img src={`${URI}${banner.image}`} alt={banner.category} className="w-full h-32 object-cover rounded-md mt-2 mb-2" />
            <button
              onClick={() => handleDelete(banner._id)}
              className="w-full py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-200"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBanner;
