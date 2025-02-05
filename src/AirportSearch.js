// src/AirportSearch.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AirportSearch = ({ label, placeholder, onSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Only search if the input has at least 2 characters
    if (inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchAirports = async () => {
        try {
          const options = {
            method: 'GET',
            url: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport',
            params: {
              query: inputValue,  // ✅ Ensure inputValue is correctly passed
              locale: 'en-US' // ✅ API might require locale
            },
            headers: {
              'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY, // ✅ Use environment variable
              'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
            }
          };
      
          console.log("Fetching airports with params:", options.params); // ✅ Log request params
      
          const response = await axios.request(options);
      
          console.log("API Response:", response.data); // ✅ Log response to check format
      
          if (response.data && response.data.data) {
            setSuggestions(response.data.data);
          } else {
            console.warn("No airport results found.");
          }
        } catch (error) {
          console.error("Error fetching airports:", error);
        }
      };
      

    // Add a debounce delay of 500ms before calling the API
    const delayDebounceFn = setTimeout(() => {
      fetchAirports();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue]);

  const handleSelect = (airport) => {
    // Update the input value to the selected airport’s display name
    setInputValue(airport.presentation.suggestionTitle);
    setSuggestions([]);
    if (onSelect) {
      onSelect(airport);
    }
  };

  return (
    <div className="mb-3 position-relative">
      <label>{label}</label>
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          // Delay hiding suggestions to allow clicks
          setTimeout(() => setIsFocused(false), 200);
        }}
      />
      {suggestions.length > 0 && isFocused && (
        <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
          {suggestions.map((airport, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(airport)}
              style={{ cursor: 'pointer' }}
            >
              {airport.presentation.suggestionTitle} — {airport.presentation.subtitle}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AirportSearch;
