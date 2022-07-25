import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch } from "react-router-dom";
import SignupFormPage from "./components/SignupFormPage";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import SpotCards from "./components/SpotsCards";
import CurrentSpot from "./components/Bookings/CurrentSpot";
import NewSpotForm from "./components/NewSpotForm";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && (
        <Switch>
          <Route path="/signup">
            <SignupFormPage />
          </Route>
          <Route path="/spots/create">
            <NewSpotForm />
          </Route>
          <Route exact path="/">
            <SpotCards />
          </Route>
          <Route path="/spots/:spotId">
            <CurrentSpot />
          </Route>
        </Switch>
      )}
    </>
  );
}

export default App;
