import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './Video.css'; // Ensure this file is included

const Video = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);

  const URI = import.meta.env.VITE_API_URL;

  // useEffect with an empty dependency array to avoid infinite re-renders
  useEffect(() => {
    fetchVideos();
  }, []); // Empty dependency array ensures the effect runs only once after initial render

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${URI}api/video/videoes`);
      if (response.data && response.data.length > 0) {
        setVideoFile(response.data[0]); // Assuming you want to show the first video
      }
      console.log(response.data);
    } catch (error) {
      setErrorMessage('Error fetching videos: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="video-container">
      {videoFile ? (
        <video
          ref={videoRef}
          src={videoFile.video}
          autoPlay
          muted  // Mute the video for autoplay to work smoothly
          playsInline  // Ensures autoplay works on mobile browsers as well
          className="custom-video"  // You can add custom CSS if needed
        />
      ) : (
        <p>Loading video...</p>
      )}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default Video;
