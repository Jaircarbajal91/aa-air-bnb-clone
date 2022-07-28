import React, { useState, useEffect } from "react";
import { useDispatch } from 'react-redux';
import { NavLink } from "react-router-dom";
import * as sessionActions from '../../store/session';
import icon from '../Navigation/images/icon.svg'
import hamburger from '../Navigation/images/hamburgerIcon.svg'
import './ProfileButton.css'

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = () => {
      setShowMenu(false);
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
  };
  return (
    <>
      <div className="profile-button-border"
        onClick={openMenu}>
        <img className="hamburger-icon" src={hamburger} />
        <img className="profile-icon" src={icon} />
      </div>
      {showMenu && (
        <div className="profile-dropdown">
          <ul className="profile-list">
            <li className="profile-username">{user.username}</li>
            <li className="profile-email">{user.email}</li>
            <li><NavLink className="menu-my-bookings" activeClassName="active" to="/bookings">My Bookings</NavLink></li>
            <li className="profile-logout" onClick={logout}>Log Out</li>
          </ul>
        </div>
      )}
    </>
  );
}

export default ProfileButton;
