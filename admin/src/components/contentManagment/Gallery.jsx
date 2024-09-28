import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Gallery = () => {
  const URI = import.meta.env.VITE_API_URL; // Ensure the environment variable is set
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await axios.get(`${URI}api/admin/gallery`);
      setGalleryItems(response.data);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to fetch gallery items',
        icon: 'error',
      });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    if (file) {
      formData.append('file', file); // Only append file if it exists
    }

    try {
      if (editingItem) {
        // Update existing item
        await axios.put(`${URI}api/admin/gallery/${editingItem._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire('Success', 'Gallery updated successfully!', 'success');
      } else {
        // Create new item
        await axios.post(`${URI}api/admin/gallery`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Swal.fire('Success', 'Gallery created successfully!', 'success');
      }
      resetForm();
      fetchGalleryItems(); // Refresh the gallery items
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to save gallery',
        icon: 'error',
      });
    } finally {
      setIsModalOpen(false); // Close modal on success or error
    }
  };

  const resetForm = () => {
    setTitle('');
    setFile(null);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setTitle(item.title);
    setFile(null); // Clear file since we are editing
    setEditingItem(item);
    setIsModalOpen(true); // Open modal for editing
  };

  const handleDelete = async (id) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the gallery item!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });

    if (confirmDelete.isConfirmed) {
      try {
        await axios.delete(`${URI}api/admin/gallery/${id}`);
        Swal.fire('Deleted!', 'Gallery item has been deleted.', 'success');
        fetchGalleryItems(); // Refresh the gallery items
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete gallery item',
          icon: 'error',
        });
      }
    }
  };

  return (
    <>
      <div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Gallery
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-md w-1/3">
            <h2 className="text-lg font-bold mb-4">{editingItem ? 'Update Gallery' : 'Create Gallery'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border border-gray-300 p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Upload Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 w-full"
                  required={!editingItem} // Require file only if not editing
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Table */}
      <table className="min-w-full mt-4 border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Title</th>
            <th className="border border-gray-300 p-2">Image</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {galleryItems.map((item) => (
            <tr key={item._id}>
              <td className="border border-gray-300 p-2">{item.title}</td>
              <td className="border border-gray-300 p-2">
                <img
                  src={`${URI}uploads/${item.filename}`}
                  alt={item.title}
                  className="w-20 h-20 object-cover"
                />
              </td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Gallery;
