import React, { useState } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import './LoginModal.css'

function LoginForm({ setShowLoginModal }) {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

// comment 
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .then(() => setShowLoginModal(false))
      .catch(
        async (res) => {
          const data = await res.json();
          if (data && data.errors) setErrors(data.errors);
        }
      );
  };


  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="form-input-wrapper">
        <div className="login-title-container">
          <h3 id="login-title">Log in</h3>
        </div>
        <input
          type="text"
          autoComplete="false"
          id="login-email-input"
          className="login-input"
          placeholder={'email'}
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
        />
        <input
          type="password"
          id="login-pw-input"
          value={password}
          className="login-input"
          placeholder={'password'}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="login-errors-container">
      {errors.length > 0 && (
        <ul className="errors-list">
          {errors.map((error, idx) => (
            <li key={idx}>{error}</li>
          ))}
        </ul>
      )}
      </div>
      <button className="login-button" type="submit">Continue</button>
    </form>
  );
}

export default LoginForm;
