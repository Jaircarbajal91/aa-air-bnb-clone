import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import { useDispatch } from 'react-redux'
import exit from '../Navigation/images/exit.svg'
import './LoginRequestModal.css'


const LoginRequestModal = ({ setShowLoginModal, setShowLoginRequestModal }) => {
  return (
    <>
      <Modal className='login-modal' onClose={() => setShowLoginRequestModal(false)}>
        <div className='login-request-container'>
          <div className='exit-image-container'>
            <img
              onClick={() => setShowLoginRequestModal(false)}
              className='exit-login-request'
              src={exit}
              alt="Close login request"
            />
          </div>
          <div className='login-request-text'>
            <h2 className='login-request-heading'>Please log in</h2>
            <p className='login-request-subtext'>
              You need to be signed in to host a new spot and manage your listings.
            </p>
          </div>
          <button
            onClick={() => {
              setShowLoginRequestModal(false);
              setShowLoginModal(true);
            }}
            className='button login-request'
          >
            Log in
          </button>
        </div>
      </Modal>
    </>
  );
};


export default LoginRequestModal;
