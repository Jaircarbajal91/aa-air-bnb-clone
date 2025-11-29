import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import SpotCards from "./components/SpotsCards";
import CurrentSpot from "./components/CurrentSpot/CurrentSpot";
import NewSpotForm from "./components/NewSpotForm";
import UserBookings from "./components/Bookings/AllUserBookings";
import CurrentBooking from "./components/Bookings/CurrentBooking";
import MySpots from "./components/MySpots";
import Footer from "./components/Footer";
import { getAllSpots } from "./store/spots";
import { getAllUserBookingsThunk } from "./store/bookings";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const sessionUser = useSelector(state => state.session?.user);
  useEffect(() => {
    dispatch(sessionActions.restoreUser())
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(true)); // Set loaded even if restore fails
  }, [dispatch]);

  useEffect(() => {
    if (sessionUser) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }
  }, [sessionUser]);

  // useEffect(() => {
  //   if (sessionUser){
  //     dispatch(getAllUserBookingsThunk(sessionUser.id))
  //   }
  // }, [dispatch])
  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && sessionUser && showWelcome && (
        <div className="welcome-banner">
          {(() => {
            const rawName = sessionUser.firstName || sessionUser.username || '';
            const name =
              rawName.length > 0
                ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
                : rawName;
            return `Welcome back, ${name}!`;
          })()}
        </div>
      )}
      {isLoaded && (
        <Switch>
          <Route exact path="/">
            <SpotCards />
          </Route>
          <Route exact path="/signup">
            <SignupFormPage />
          </Route>
          <ProtectedRoute exact path="/spots/create">
            <NewSpotForm />
          </ProtectedRoute>
          <ProtectedRoute exact path="/spots/mine">
            <MySpots />
          </ProtectedRoute>
          <Route exact path="/spots/:spotId">
            <CurrentSpot />
          </Route>
          <ProtectedRoute exact path="/bookings">
            <UserBookings />
          </ProtectedRoute>
          <ProtectedRoute exact path="/bookings/:bookingId">
            <CurrentBooking />
          </ProtectedRoute>
          <Route path="*">
            <div>Page Not Found</div>
          </Route>
        </Switch>
      )}
      <Footer />
    </>
  );
}

export default App;
