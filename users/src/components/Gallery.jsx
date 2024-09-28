import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Gallery = () => {
    const URI = import.meta.env.VITE_API_URL;
  const [images, setImages] = useState([]);
 

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`${URI}api/admin/gallery`);
        setImages(response.data); // Assuming response.data is an array of image objects
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="p-4 mt-12 text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Gallery</h1>
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.filename} className="overflow-hidden rounded shadow-md">
            <img
              src={`${URI}uploads/${image.filename}`} // Adjust the URL as necessary
              alt={image.title}
              className="w-full h-auto object-cover"
            />
            <div className="p-2">
              <h3 className="font-semibold text-center">{image.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
