import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Video = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // State to manage loading
  const [videos, setVideos] = useState([]); // State to store video list
  const URI = import.meta.env.VITE_API_URL;

  const handleFileChange = (event) => {
    setVideoFile(event.target.files[0]);
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!videoFile) {
      setMessage('Please select a video file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    
    setLoading(true); // Set loading to true before the upload starts

    try {
      const response = await axios.post(`${URI}api/video/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessage(response.data.message);
      setVideoFile(null); // Clear the file input after upload
      
      // Fetch the updated video list after a successful upload
      fetchVideos();

    } catch (error) {
      setMessage('Error uploading video: ' + error.response?.data?.message || error.message);
    } finally {
      setLoading(false); // Set loading to false after the upload finishes
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${URI}api/video/videoes`);
      setVideos(response.data); // Assuming response.data contains the list of videos
    } catch (error) {
      setMessage('Error fetching videos: ' + error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${URI}api/video/${id}`);
      setMessage('Video deleted successfully.');
      fetchVideos(); // Refresh the video list after deletion
    } catch (error) {
      setMessage('Error deleting video: ' + error.response?.data?.message || error.message);
    }
  };

  useEffect(() => {
    fetchVideos(); // Fetch videos on component mount
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Upload Video</h2>
      <form onSubmit={handleUpload} className="bg-white p-6 rounded shadow-md">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 border border-gray-300 rounded-lg cursor-pointer mb-4"
          required
        />
        <button
          type="submit"
          className={`w-full text-white font-semibold py-2 rounded transition duration-200 ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={loading} // Disable button while loading
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {loading && (
        <div className="flex justify-center mt-4">
          <svg
            className="animate-spin h-5 w-5 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="4"
              stroke="currentColor"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8-8-3.582-8-8zm12 0a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
      )}
      {message && <p className="mt-4 text-center text-red-600">{message}</p>}
      
      <h3 className="text-xl font-semibold mt-6">Uploaded Videos:</h3>
      <ul className="mt-4">
        {videos.length > 0 ? (
          videos.map((video) => (
            <li key={video._id} className="mb-4">
              <video controls className="w-full" loop>
                <source src={video.video} type="video/mp4" /> {/* Ensure this matches your API response */}
                Your browser does not support the video tag.
              </video>
              <p className="text-center mt-2">{video.title}</p>
              <button
                onClick={() => handleDelete(video._id)}
                className="mt-2 text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))
        ) : (
          <p className="text-center text-gray-500">No videos uploaded yet.</p>
        )}
      </ul>
    </div>
  );
};

export default Video;
