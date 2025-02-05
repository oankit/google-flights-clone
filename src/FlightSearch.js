// src/FlightSearch.js
import React, { useState } from 'react';
import axios from 'axios';
import AirportSearch from './AirportSearch';

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
    <div className="container my-4">
      <h1 className="mb-4 text-center">Flight Search</h1>
      <form onSubmit={handleSearch}>
        <div className="row">
          <div className="col-md-4">
            <AirportSearch label="Origin" placeholder="Enter origin" onSelect={setOrigin} />
          </div>
          <div className="col-md-4">
            <AirportSearch label="Destination" placeholder="Enter destination" onSelect={setDestination} />
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <label>Travel Date</label>
              <input
                type="date"
                className="form-control"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="text-center">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </div>
      </form>

      <div className="row mt-4">
  {loading && <p className="text-center">Loading flights...</p>}
  
  {!loading && flights.length === 0 && (
    <p className="text-center">No flights found. Try a different search.</p>
  )}

  {flights.length > 0 &&
    flights.map((flight, index) => {
       // ✅ Extract airline name correctly
       const airline = flight.legs?.[0]?.carriers?.marketing?.[0]?.name || "Unknown Airline";
      
       // ✅ Extract price (formatted string)
       const price = flight.price?.formatted || "N/A";
 
       // ✅ Extract flight number (if available)
       const flightNumber = flight.legs?.[0]?.segments?.[0]?.flightNumber || "N/A";
 

      // ✅ Extract departure & arrival times
      const departureTime = flight.legs?.[0]?.departure || "N/A";
      const arrivalTime = flight.legs?.[0]?.arrival || "N/A";

      return (
        <div key={index} className="col-md-4 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">{airline}</h5>
              <p className="card-text">Flight Number: {flightNumber}</p>
              <p className="card-text">Price: {price}</p>
              <p className="card-text">Departure: {departureTime}</p>
              <p className="card-text">Arrival: {arrivalTime}</p>
            </div>
          </div>
        </div>
      );
    })}
</div>

    </div>
  );
};

export default FlightSearch;
