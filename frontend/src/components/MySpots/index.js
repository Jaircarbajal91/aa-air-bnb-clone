import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { getAllUserSpots } from "../../store/spots";
import Card from "../Cards";
import "../SpotsCards/SpotsCards.css";
import "./MySpots.css";

function MySpots() {
  const dispatch = useDispatch();
  const history = useHistory();
  const sessionUser = useSelector(state => state.session.user);
  const spots = useSelector(state => state.spots.userSpotsList);

  useEffect(() => {
    if (!sessionUser) {
      history.push("/");
      return;
    }
    dispatch(getAllUserSpots());
  }, [dispatch, sessionUser, history]);

  if (!sessionUser) return null;

  return (
    <div className="home-page-container">
      <div className="my-spots-header-bar">
        <div className="my-spots-header-inner">
          <h1>My Spots</h1>
          <p>Manage and view all the places you are hosting.</p>
        </div>
      </div>
      <div className="spots-container">
        {spots && spots.length > 0 ? (
          <div className="spots-cards-container">
            {spots.map(spot => (
              <Card key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <div className="no-results">
            <i className="fa-solid fa-magnifying-glass"></i>
            <h2>You don't have any spots yet</h2>
            <p>Click "Become a Host" to create your first spot.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MySpots;

