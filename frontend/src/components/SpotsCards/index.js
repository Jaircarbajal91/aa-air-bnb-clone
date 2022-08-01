import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getAllSpots, getSpotDetails } from "../../store/spots"
import Card from "../Cards"
import './SpotsCards.css'

function SpotCards() {
  const spots = useSelector(state => state.spots.orderedSpotsList)
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllSpots()).then(() => setIsLoaded(true));
  }, [dispatch])
  return isLoaded && (
    <div className="spots-container">
      <div className="spots-cards-container">
        {spots?.map(spot => (
          <Card key={spot.id} spot={spot} />
        ))}
      </div>
    </div>
  )
}

export default SpotCards
