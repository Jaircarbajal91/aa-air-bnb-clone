import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from "react-router-dom";
import { login } from "../../store/session";
import * as sessionActions from '../../store/session'
import icon from '../Navigation/images/icon.svg'
import hamburger from '../Navigation/images/hamburgerIcon.svg'
import LoginFormModal from "../LoginFormModal";
import SignUpFormModal from "../SignupFormPage/SignUpModal";
import { logInAsDemo } from "../../store/session";
import { logoutBookingsAction } from "../../store/bookings";
import { useHistory } from "react-router-dom";
import { logoutSpotsAction } from "../../store/spots";
import './ProfileButton.css'


function ProfileButton({ user, isLoaded }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [showMenu, setShowMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  const handleDemo = () => {
    const user = { credential: 'demo@user.io', password: 'password' }
    dispatch(login(user))
      .then(() => {
        setShowLoginModal(false)
        history.push('/')
      })
  };


  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = () => {
      setShowMenu(false);
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const sessionUser = useSelector(state => state.session.user);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout())
      .then(() => {
        dispatch(logoutBookingsAction())
      })
      .then(() => history.push("/"))
      .catch(async (err) => {
        console.log(err)
        const errors = err.json()
        console.log(errors)
      })

  };
  return (
    <>
      {showLoginModal && (<LoginFormModal showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />)}
      {showSignUpModal && (<SignUpFormModal showSignUpModal={showSignUpModal} setShowSignUpModal={setShowSignUpModal} />)}
      <div className='host-hover-border'>
        <NavLink className='become-host-link' to="/spots/create">Become a Host</NavLink>
      </div>
      <div className="profile-button-border"
        onClick={openMenu}>
        <img className="hamburger-icon" src={hamburger} />
        <img className="profile-icon" src={icon} />
        {showMenu && (
          <div className="profile-dropdown">
            {isLoaded && sessionUser && (
              <ul className="profile-list">
                <li className="profile-list-item user-name-li">{user.username}</li>
                <NavLink className="menu-my-bookings hover-link" activeClassName="active" to="/bookings">My Bookings</NavLink>
                <li className="profile-list-item hover-link" onClick={logout}>Log Out</li>
              </ul>
            )}
            {isLoaded && !sessionUser && (
              <ul className="profile-list">
                <NavLink className='profile-list-item hover-link' onClick={() => setShowLoginModal(true)} to=''>Login</NavLink>
                <NavLink className='profile-list-item hover-link' onClick={() => handleDemo()} to=''>Demo Login</NavLink>
                <NavLink onClick={() => setShowSignUpModal(true)} className='profile-list-item hover-link' to="">Sign Up</NavLink>
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default ProfileButton;
