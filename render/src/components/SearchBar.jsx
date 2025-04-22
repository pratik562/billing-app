import React, { useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import "../styles/SearchBar.css";

const SearchBar = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (event) => {
    setQuery(event.target.value);
    onSearch(event.target.value); // ✅ Real-time filtering
  };

  const handleClear = () => {
    setQuery("");
    onClear(); // ✅ Restore full data
  };

  return (
    <div className="search-container">
      <FaSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search by name or phone..."
        value={query}
        onChange={handleInputChange}
        className="search-input"
      />
      {query && <FaTimes className="clear-icon" onClick={handleClear} />}
    </div>
  );
};

export default SearchBar;
