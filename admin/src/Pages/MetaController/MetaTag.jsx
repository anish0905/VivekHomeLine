import React, { useState } from 'react';
import axios from 'axios';
import MetaTable from './MetaTable';

const MetaTag = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keyword, setKeyword] = useState(''); // For adding a single keyword
  const [keywords, setKeywords] = useState([]); // Store multiple keywords
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5002/api/meta/metadata', {
        title,
        description,
        keywords, // Send the array of keywords
        author,
      });

      setMessage(response.data.message); // Display success message
      resetForm();
    } catch (error) {
      setMessage(`Error: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  const addKeyword = () => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
      setKeywords((prevKeywords) => [...prevKeywords, trimmedKeyword]);
      setKeyword(''); // Clear the input after adding
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setKeywords([]);
    setAuthor('');
    setMessage('');
    setKeyword(''); // Clear the keyword input as well
  };

  return (
    <>
      <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Create Metadata</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Add Keyword:</label>
            <div className="flex">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)} // Update the keyword state
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="ml-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition duration-200"
              >
                Add
              </button>
            </div>
            {keywords.length > 0 && (
              <div className="mt-2">
                <p className="font-medium text-gray-700">Keywords:</p>
                <ul className="list-disc list-inside">
                  {keywords.map((k, index) => (
                    <li key={index} className="text-gray-600">{k}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Author:</label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Submit
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>} {/* Display success/error message */}
      </div>
      <MetaTable />
    </>
  );
};

export default MetaTag;
