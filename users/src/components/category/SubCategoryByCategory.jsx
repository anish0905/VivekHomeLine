import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CategoryBanner from "./categoryBanner";
import axios from 'axios';

export const SubCategoryByCategory = () => {
  const [categoriesData, setCategoriesData] = useState(null); // Initialize as null
  const { id } = useParams(); // Get the ID from URL parameters
  const navagate = useNavigate()

  const URI = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const resp = await axios.get(`${URI}api/categories/${id}`);
      setCategoriesData(resp.data); // Set the fetched data
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Check if categoriesData exists
  const categoryName = categoriesData?.category || ''; // Extract category name
  const categoryImage = categoriesData?.image || ''; // Extract category image
  const subcategories = categoriesData?.subcategories || []; // Ensure subcategories is defined

  const handleMouseMove = (e) => {
    const container = e.currentTarget;
    const { left, top, width, height } = container.getBoundingClientRect();
    
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    const xRotation = ((y / height) - 0.5) * 30; // Adjust rotation intensity here
    const yRotation = ((x / width) - 0.5) * -30; // Adjust rotation intensity here

    container.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg)`;
  };

  const handleMouseLeave = (e) => {
    const container = e.currentTarget;
    container.style.transform = 'rotateX(0deg) rotateY(0deg)'; // Reset rotation on mouse leave
  };

  return (
    <div>
      <CategoryBanner title="Our Products" />

      <div className="flex flex-wrap justify-center mt-4">
        {subcategories.map((subcategory) => (
          <div 
            key={subcategory._id} 
            className="flex flex-col items-center mx-4 mb-6 image-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
           onClick={()=>navagate(`/subcategory/${subcategory.name}/shop-in-bangalore`)}>
            {subcategory.image && (
              <img
                src={`${URI}${subcategory.image}`} // Use URI for images
                alt={subcategory.name}
                className="image h-32 w-32 rounded-lg object-cover mb-2 transition-transform duration-500 ease-in-out"
              />
            )}
            <h3 className="text-lg font-semibold text-center">{subcategory.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};
