import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import SpotCards from "./components/SpotsCards";
import CurrentSpot from "./components/CurrentSpot/CurrentSpot";
import NewSpotForm from "./components/NewSpotForm";
import UserBookings from "./components/Bookings/AllUserBookings";
import CurrentBooking from "./components/Bookings/CurrentBooking";
import { getAllSpots } from "./store/spots";
import { getAllUserBookingsThunk } from "./store/bookings";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  // const bookings = useSelector(state => state.bookings?.orderedBookingList)
  // const sessionUser = useSelector(state => state.session?.user)
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  // useEffect(() => {
  //   if (sessionUser){
  //     dispatch(getAllUserBookingsThunk(sessionUser.id))
  //   }
  // }, [dispatch])
  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route exact path="/">
            <SpotCards />
          </Route>
          <Route exact path="/signup">
            <SignupFormPage />
          </Route>
          <Route exact path="/spots/create">
            <NewSpotForm />
          </Route>
          <Route exact path="/spots/:spotId">
            <CurrentSpot />
          </Route>
          <Route exact path="/bookings">
            <UserBookings />
          </Route>
          <Route exact path="/bookings/:bookingId">
            <CurrentBooking />
          </Route>
          <Route path="*">
            <div>Page Not Found</div>
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
