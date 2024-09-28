import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";

import BannerSlider from "./BannerSlider";
import CardHome from "./CardHome";
import DealsHeader from "./DealsHeader";
// import SalesAdOfferHomepage from "./SalesAdOfferHomepage";
import ServiceCard from "./ServiceCard";
import Testimonials from "./Testimonials";
import OfferSales from "./OfferSales";
import ProductDescription from "./ProductDescription";
import { Cateroy } from "./category/Cateroy";
import CustomizedCurtains from "./CustomizedCurtains";
import Blinds from "./Blinds";
import WallPaper from "./WallPaper";
import Video from "./Video";
import { Api } from "../Api";

const HomePage = () => {
  const URI = import.meta.env.VITE_API_URL;
  const [metaData, setMetaData] = useState({
    title: "",
    description: "",
    keywords: [],
    author: "",
  });

  useEffect(() => {
    // Fetch metadata from API
    const fetchMetadata = async () => {
      try {
        const response = await axios.get(`${URI}api/meta/metadata`);
        const data = response.data.data; // Assuming the API returns an array of metadata
        // Set the first metadata item (if your API returns multiple, you may need to adjust this)
        if (data.length > 0) {
          setMetaData(data[0]);
        }
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };

    fetchMetadata();
  }, []);

  return (
    <div className="w-full">
      {/* React Helmet for setting meta tags */}
      <Helmet>
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description} />
        <meta name="keywords" content={metaData.keywords.join(", ")} />
        <meta name="author" content={metaData.author} />
      </Helmet>

      {/* Page Content */}
      <BannerSlider />
      <Video />
      <CardHome />
      <ProductDescription />
      <Cateroy />
      <ServiceCard />
      <CustomizedCurtains />
      <Blinds />
      <WallPaper />
      {/* <DealsHeader /> */}
      <OfferSales />
      {/* <SalesAdOfferHomepage /> */}
      <Testimonials />
      <Api />
    </div>
  );
};

export default HomePage;
