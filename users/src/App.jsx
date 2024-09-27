import React from "react";
import "./App.css";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Navbar2 from "./components/Navbar2";
import Footer from "./components/Footer";




function App() {
  return (
    <div>
      
      <Navbar />
      <div className="lg:block md:block hidden">
      <Navbar2 />
    </div>
     <div className="pt-20">
      <Outlet />
      <Footer/>
      </div>
    </div>
  );
}

export default App;
