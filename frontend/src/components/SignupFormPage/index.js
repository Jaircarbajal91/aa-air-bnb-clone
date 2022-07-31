// frontend/src/components/SignupFormPage/index.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect } from "react-router-dom";
import * as sessionActions from "../../store/session";
import './SignupForm.css'

function SignupFormPage({ setShowSignUpModal }) {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);

  if ((sessionUser)) return <Redirect to="/" />;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === confirmPassword) {
      setErrors([]);
      return dispatch(sessionActions.signupUser({ email, username, password, firstName, lastName }))
        .then(() => setShowSignUpModal(false))
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) setErrors(data.errors);
        });
    }
    return setErrors(['Confirm Password field must be the same as the Password field']);
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <div className="signup-form-wrapper">
        <div className="signup-title">
          <h4 className="signup-h3">Sign up</h4>
        </div>
        <div className="signup-welcome">
          <h3 className="signup-welcome-h3">Welcome to Jairbnb</h3>
        </div>
        <div className="signup-input-wrapper">
          <input
            type="text"
            value={firstName}
            placeholder='First Name'
            className='signup-form-input firstname'
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            value={lastName}
            placeholder='Last Name'
            className='signup-form-input none'
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="text"
            value={email}
            className='signup-form-input none'
            placeholder='Email'
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            value={username}
            className='signup-form-input none'
            placeholder='Username'
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            value={password}
            className='signup-form-input none'
            placeholder='Password'
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            value={confirmPassword}
            className='signup-form-input confirm'
            placeholder='Confirmed Password'
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <div className="signup-form-errors">
            <ul className="errors-list">
              {errors.length > 0 && errors.map((error, idx) => <li key={idx}>{error}</li>)}
            </ul>
          </div>
        </div>
      </div>
        <button className="signup-submit-button" type="submit">Continue</button>
    </form>
  );
}

export default SignupFormPage;
