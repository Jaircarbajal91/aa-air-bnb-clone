import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import { useDispatch } from 'react-redux'
import exit from '../Navigation/images/exit.svg'
import './LoginRequestModal.css'


const LoginRequestModal = ({ setShowLoginModal, setShowLoginRequestModal }) => {
  return (
    <>
      <Modal className='login-modal' onClose={() => setShowLoginRequestModal(false)}>
        <div className='delete-container'>
          <div className='exit-image-container'>
            <img onClick={() => setShowLoginRequestModal(false)} className='exit-login-request' src={exit} alt="exit-icon" />
          </div>
          <h3>Please log in to host a new spot.</h3>
          <button onClick={() => {
            setShowLoginRequestModal(false)
            setShowLoginModal(true)
          }} className='button login-request'>Log in</button>
        </div>
      </Modal>
    </>
  )
}


export default LoginRequestModal;
