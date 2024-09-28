import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

// Function to capitalize words
const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const MiniDrawer = ({ isOpen, onClose, setIsLoginModalOpen }) => { // Accept setIsLoginModalOpen as a prop
  const [openCategory, setOpenCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const token = localStorage.getItem("token"); // Check if token exists for login status

  const URI = import.meta.env.VITE_API_URL;

  // Fetch categories from the API
  useEffect(() => {
    fetchCategories();
  }, [URI]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${URI}api/admin/navheaders`);
      const categoriesData = response.data;
      setCategories(categoriesData);
      localStorage.setItem("categories", JSON.stringify(categoriesData)); // Save categories to local storage (optional)
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleCategoryClick = (index) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  return (
    <div
      className={`fixed top-0 z-40 left-0 h-full w-64 bg-gray-800 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold">Menu</h2>
        <button className="text-2xl" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      <ul className="p-4 space-y-2">
        {/* Static Links */}
        <li>
          <Link
            to="/"
            className="block p-2 rounded hover:bg-gray-700 transition duration-200"
            onClick={onClose}
          >
            Home
          </Link>
        </li>

        {!token && (
          <li>
            <button
              className="block p-2 rounded hover:bg-gray-700 transition duration-200"
              onClick={() => {
                setIsLoginModalOpen(true); // Open Login Modal
                onClose();
              }}
            >
              Login
            </button>
          </li>
        )}

        {token && (
          <li>
            <Link
              to="/user-profile/myaccount"
              className="block p-2 rounded hover:bg-gray-700 transition duration-200"
              onClick={onClose}
            >
              My Account
            </Link>
            {/* Other account-related links */}
          </li>
        )}

        {/* Dynamic Categories fetched from API */}
        {categories.map((category, index) => (
          <li key={category._id} className="relative">
            <button
              className="w-full text-left p-2 rounded hover:bg-gray-700 transition duration-200"
              onClick={() => handleCategoryClick(index)}
            >
              {capitalizeWords(category.categories)}
            </button>
            {openCategory === index && (
              <ul className="pl-4 mt-2 space-y-1">
                {category.subcategories.map((subcategory) => (
                  <li key={subcategory}>
                    <Link
                      to={`/subcategory/${encodeURIComponent(subcategory)}/shop-in-bangalore`}
                      className="block p-2 rounded hover:bg-gray-600 transition duration-200"
                      onClick={onClose}
                    >
                      {capitalizeWords(subcategory)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MiniDrawer;
