import React from 'react';
import { NavLink, Link, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import LoginFormModal from '../LoginFormModal';
import './Navigation.css';
import logo from './images/logo.svg'
import name from './images/jairbnb.svg'


function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);
  const history = useHistory()
  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <div className='right-profile-container'>
        <NavLink className='become-host-link' to="/spots/create">Become a Host</NavLink>
        <ProfileButton user={sessionUser} />
      </div>
    );
  } else {
    sessionLinks = (
      <>
        <LoginFormModal />
        <NavLink to="/signup">Sign Up</NavLink>
      </>
    );
  }

  return (
    <nav className='main-navbar'>
      <div className='svg-container' onClick={() => history.push('/')}>
        <img className='svg-logo' src={logo} />
        <img style={{
          marginLeft: '.7em'
        }} className='svg-logo-name' src={name} />
      </div>
        {isLoaded && sessionLinks}
    </nav>
  );
}

export default Navigation;
