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
              const legs = flight.legs || [];
              const segments = legs[0]?.segments || [];
              const numberOfStops = segments.length - 1;
              const mainCarrier = flight.legs?.[0]?.carriers?.marketing?.[0];
              
              return (
                <div key={index} className="flight-card">
                  <div className="flight-card-header">
                    {mainCarrier && (
                      <>
                        <img 
                          src={mainCarrier.logoUrl} 
                          alt={mainCarrier.name}
                          className="airline-logo"
                        />
                        <span className="airline-name">{mainCarrier.name}</span>
                      </>
                    )}
                    <div className="flight-stops">
                      {numberOfStops === 0 ? 'Direct' : 
                       numberOfStops === 1 ? '1 stop' : 
                       `${numberOfStops} stops`}
                    </div>
                  </div>
                  
                  {legs.map((leg, legIndex) => {
                    const departureDateTime = new Date(leg.departure);
                    const arrivalDateTime = new Date(leg.arrival);
                    
                    const durationMs = arrivalDateTime - departureDateTime;
                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return (
                      <div key={legIndex} className="flight-segment">
                        <div className="flight-info">
                          <div className="flight-datetime">
                            <div className="flight-time">
                              {departureDateTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            <div className="flight-airport">{leg.origin?.display}</div>
                          </div>

                          <div className="flight-duration">
                            <div className="duration-line">
                              <FaPlane className="plane-icon" />
                            </div>
                            <div className="duration-text">{`${hours}h ${minutes}m`}</div>
                          </div>

                          <div className="flight-datetime">
                            <div className="flight-time">
                              {arrivalDateTime.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                            <div className="flight-airport">{leg.destination?.display}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="flight-price">{flight.price?.formatted || "N/A"}</div>
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
