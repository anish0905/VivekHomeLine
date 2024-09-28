import React, { useEffect, useState } from 'react';

const AboutUs = () => {
    const [aboutData, setAboutData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const URI = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                const response = await fetch(`${URI}api/content-about`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setAboutData(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
                setLoading(false);
            }
        };
        fetchAboutData();
    }, [URI]);

    if (loading) {
        return <p className="text-center text-gray-600 text-lg">Loading...</p>;
    }

    if (error) {
        return <p className="text-center text-red-600 text-lg">Error: {error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 w-full mt-12 ">
            <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">About Us</h1>
                {aboutData.length > 0 ? (
                    <div className="flex flex-wrap">
                        {aboutData.map((item) => (
                            <div key={item._id} className="flex flex-col md:flex-row mb-8 w-full"> {/* Use flex-col on small screens */}
                                {/* Image Section */}
                                <div className="w-full md:w-2/5 pr-4"> {/* 40% for image on medium screens and above */}
                                    <img
                                        src={`${URI}uploads/${item.filename}`}
                                        alt={item.title}
                                        className="w-full h-auto rounded-md object-cover" // Ensures proper image scaling
                                    />
                                </div>
                                {/* Text Section */}
                                <div className="w-full md:w-2/5 pl-4 my-auto"> {/* 40% for text on medium screens and above */}
                                    <h2 className="text-2xl font-semibold  mb-4 text-blue-gray-900">{item.title}</h2>
                                    <div
                                        className="text-gray-700 leading-relaxed mb-6"
                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                    />
                                </div>
                                {/* Gap Section */}
                                <div className="hidden md:w-1/5 md:block"> {/* 20% gap only on medium screens and above */}
                                    {/* This area can remain empty or contain any additional content */}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-600 text-lg">No data available</p>
                )}
            </div>
        </div>
    );
};

export default AboutUs;
