import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MetaTable = () => {
  const [metaData, setMetaData] = useState([]);
  const [message, setMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  // Fetch metadata
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5002/api/meta/metadata');
        setMetaData(response.data.data);
      } catch (error) {
        setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
      }
    };

    fetchData();
  }, []);

  // Handle Delete Action
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5002/api/meta/metadata/${id}`);
      setMetaData((prevMetaData) => prevMetaData.filter((data) => data._id !== id));
      setMessage('Metadata deleted successfully.');
    } catch (error) {
      setMessage(`Error deleting metadata: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // Handle Update Action
  const handleUpdate = async (id, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:5002/api/meta/metadata/${id}`, updatedData);
      setMetaData((prevMetaData) =>
        prevMetaData.map((data) => (data._id === id ? response.data : data))
      );
      setMessage('Metadata updated successfully.');
      setIsEditModalOpen(false);
    } catch (error) {
      setMessage(`Error updating metadata: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  // Open Edit Modal
  const openEditModal = (data) => {
    setCurrentData(data);
    setIsEditModalOpen(true);
  };

  // Handle input change in the modal
  const handleChange = (e) => {
    setCurrentData({
      ...currentData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit the updated data
  const handleSubmit = (e) => {
    e.preventDefault();
    handleUpdate(currentData._id, currentData);
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Metadata List</h1>
      {message && <p className="text-red-500">{message}</p>}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Keywords</th>
            <th className="py-2 px-4 border-b">Author</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {metaData.map((data) => (
            <tr key={data._id}>
              <td className="py-2 px-4 border-b">{data.title}</td>
              <td className="py-2 px-4 border-b">{data.description}</td>
              <td className="py-2 px-4 border-b">{data.keywords.join(', ')}</td>
              <td className="py-2 px-4 border-b">{data.author}</td>
              <td className="py-2 px-4 border-b">
                
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(data._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {isEditModalOpen && currentData && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Metadata</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={currentData.title}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  value={currentData.description}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Keywords</label>
                <input
                  type="text"
                  name="keywords"
                  value={currentData.keywords.join(', ')}
                  onChange={(e) => {
                    const updatedKeywords = e.target.value.split(',').map(k => k.trim());
                    setCurrentData({ ...currentData, keywords: updatedKeywords });
                  }}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Author</label>
                <input
                  type="text"
                  name="author"
                  value={currentData.author}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>
              <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                Save
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaTable;
