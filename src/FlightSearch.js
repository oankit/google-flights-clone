// src/FlightSearch.js
import React, { useState } from 'react';
import axios from 'axios';
import AirportSearch from './AirportSearch';
import { FaPlane } from 'react-icons/fa';

const FlightSearch = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [travelDate, setTravelDate] = useState('');
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
  
    if (!origin || !destination || !travelDate) {
      setError('Please select origin, destination, and a travel date.');
      return;
    }
  
    setError('');
    setLoading(true);
    setFlights([]);
  
    try {
      const options = {
        method: 'GET',
        url: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchFlights',
        params: {
          originSkyId: origin.skyId, 
          destinationSkyId: destination.skyId,
          originEntityId: origin.entityId,
          destinationEntityId: destination.entityId,
          date: travelDate,
          cabinClass: 'economy',
          adults: '1',
          sortBy: 'best',
          currency: 'USD',
          market: 'en-US',
          countryCode: 'US'
        },
        headers: {
          'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
        }
      };
  
      console.log("Fetching flights with params:", options.params);
  
      const response = await axios.request(options);
      console.log("API Response:", response.data); // ✅ Log full response
  
      // ✅ Extract flights from `data.itineraries`
      if (response.data && response.data.data && response.data.data.itineraries) {
        console.log("Extracted Flights:", response.data.data.itineraries); // ✅ Log extracted itineraries
        setFlights(response.data.data.itineraries);
      } else {
        setError('No flights found.');
      }
    } catch (err) {
      console.error('Error fetching flight data:', err);
      setError('Error fetching flight data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="container py-4">
      <h1 className="page-title">Find flights</h1>
      
      <div className="search-container position-relative">
        <form onSubmit={handleSearch}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">From</label>
              <AirportSearch 
                placeholder="Enter city" 
                onSelect={setOrigin} 
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">To</label>
              <AirportSearch 
                placeholder="Enter city" 
                onSelect={setDestination} 
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
          </div>
          <div className="search-button-container">
            <button 
              type="submit" 
              className="search-button"
            >
              <i className="bi bi-search me-2"></i>
              Search
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : flights.length > 0 ? (
          <>
            <h2 className="results-title">Top departing flights</h2>
            {flights.map((flight, index) => {
              const airline = flight.legs?.[0]?.carriers?.marketing?.[0]?.name || "Unknown Airline";
              const price = flight.price?.formatted || "N/A";
              
              const departureDateTime = new Date(flight.legs?.[0]?.departure);
              const departureTime = departureDateTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              const departureDate = departureDateTime.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              });
              
              const arrivalDateTime = new Date(flight.legs?.[0]?.arrival);
              const arrivalTime = arrivalDateTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              const arrivalDate = arrivalDateTime.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
              });

              return (
                <div key={index} className="flight-card">
                  <div className="airline-name">{airline}</div>
                  <div className="flight-info">
                    <div className="flight-datetime">
                      <div className="flight-time">{departureTime}</div>
                      <div className="flight-date">{departureDate}</div>
                    </div>
                    <div className="flight-datetime">
                      <div className="flight-time">{arrivalTime}</div>
                      <div className="flight-date">{arrivalDate}</div>
                    </div>
                  </div>
                  <div className="flight-price">{price}</div>
                </div>
              );
            })}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default FlightSearch;
