import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import LoginForm from './LoginForm';
import { logInAsDemo } from '../../store/session'
import { useDispatch } from 'react-redux'
import './LoginModal.css'


  function LoginFormModal({showLoginModal, setShowLoginModal}) {
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch()


    return (
      <>
        {showLoginModal && (
          <Modal className='login-modal' onClose={() => setShowLoginModal(false)}>
            <LoginForm setShowLoginModal={setShowLoginModal}/>
          </Modal>
        )}
      </>
    );
  }

export default LoginFormModal;
