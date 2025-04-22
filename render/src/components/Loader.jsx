import React from "react";
import '../styles/Loader.css'

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader"></div>
      <p>Loading data...</p>
    </div>
  );
};

export default Loader;
