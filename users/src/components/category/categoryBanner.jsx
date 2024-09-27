import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CategoryBanner = ({ categorieName }) => {
  const [banners, setBanners] = useState([]); // State to hold banner data
  const [selectedBanner, setSelectedBanner] = useState(null); // State for the selected banner

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/admin/category-banners');
        setBanners(response.data); // Set banner data
        console.log("Banners fetched successfully:", response.data); // Log banner data
      } catch (error) {
        console.error('Error fetching banners:', error);
      }
    };

    fetchBanners(); // Fetch banners when component mounts
  }, []); // Empty dependency array to run only on mount

  useEffect(() => {
    const findBanner = (name) => {
      if (!name) return null; // If name is undefined or null, return null
      return banners.find(banner => banner.category && banner.category.trim() === name.trim());
    };

    // First check for the category name from props
    let matchedBanner = findBanner(categorieName);

    // If no match found, check local storage
    if (!matchedBanner) {
      const storedCategory = localStorage.getItem('selectedCategory');
      matchedBanner = findBanner(storedCategory);
    }

    setSelectedBanner(matchedBanner); // Set the selected banner
  }, [categorieName, banners]); // Update whenever categorieName or banners change

  return (
    <div>
      {selectedBanner ? (
        <img 
          key={selectedBanner._id} 
          src={`http://localhost:5002/${selectedBanner.image}`} 
          alt={selectedBanner.category} 
          className='w-screen h-[50vh]' 
        />
      ) : (
        <p>No banner found for the selected category.</p>
      )}
    </div>
  );
};

export default CategoryBanner;
