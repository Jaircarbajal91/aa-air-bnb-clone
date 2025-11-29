import React, { useState } from 'react';
import './HeroSection.css';

function HeroSection({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ query: searchQuery, location });
    }
  };

  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Find your next adventure</h1>
        <p className="hero-subtitle">Discover unique places to stay around the world</p>
        <form className="hero-search-form" onSubmit={handleSubmit}>
          <div className="search-bar">
            <div className="search-field">
              <label htmlFor="location">Where</label>
              <input
                id="location"
                type="text"
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="search-divider"></div>
            <div className="search-field">
              <label htmlFor="query">What</label>
              <input
                id="query"
                type="text"
                placeholder="Add dates, guests, or keywords"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="search-button">
              <i className="fa-solid fa-magnifying-glass"></i>
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HeroSection;

