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

  return (
    <nav className='main-navbar'>
      <div className='navbar-content-wrapper'>
        <div className='svg-container' onClick={() => history.push('/')}>
          <img className='svg-logo' src={logo} />
          <img style={{
            marginLeft: '.7em'
          }} className='svg-logo-name' src={name} />
        </div>
        {isLoaded && (
          <div className='right-profile-container'>
            <ProfileButton user={sessionUser} isLoaded={isLoaded} />
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
