import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getAllSpots, getSpotDetails } from "../../store/spots"
import Card from "../Cards"
import HeroSection from "../HeroSection"
import './SpotsCards.css'

function SpotCards() {
  
  const allSpots = useSelector(state => state.spots.orderedSpotsList)
  const [isLoaded, setIsLoaded] = useState(false);
  const [filteredSpots, setFilteredSpots] = useState(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getAllSpots())
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(true)); // Set loaded even if fetch fails
  }, [dispatch])

  const handleSearch = ({ query, location }) => {
    if (!query && !location) {
      setFilteredSpots(null);
      return;
    }

    const filtered = allSpots?.filter(spot => {
      const matchesLocation = !location || 
        spot.city?.toLowerCase().includes(location.toLowerCase()) ||
        spot.state?.toLowerCase().includes(location.toLowerCase()) ||
        spot.country?.toLowerCase().includes(location.toLowerCase());
      
      const matchesQuery = !query ||
        spot.name?.toLowerCase().includes(query.toLowerCase()) ||
        spot.description?.toLowerCase().includes(query.toLowerCase());
      
      return matchesLocation && matchesQuery;
    });
    
    setFilteredSpots(filtered);
  };

  const spots = filteredSpots !== null ? filteredSpots : allSpots;

  return isLoaded && (
    <div className="home-page-container">
      <HeroSection onSearch={handleSearch} />
      <div className="spots-container">
        {spots && spots.length > 0 ? (
          <div className="spots-cards-container">
            {spots.map(spot => (
              <Card key={spot.id} spot={spot} />
            ))}
          </div>
        ) : filteredSpots !== null && filteredSpots.length === 0 ? (
          <div className="no-results">
            <i className="fa-solid fa-magnifying-glass"></i>
            <h2>No spots found</h2>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default SpotCards
