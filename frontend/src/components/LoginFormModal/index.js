import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import LoginForm from './LoginForm';
import { logInAsDemo } from '../../store/session'
import { useDispatch } from 'react-redux'


  function LoginFormModal({showLoginModal, setShowLoginModal}) {
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch()


    return (
      <>
        {showLoginModal && (
          <Modal onClose={() => setShowLoginModal(false)}>
            <LoginForm setShowLoginModal={setShowLoginModal}/>
          </Modal>
        )}
      </>
    );
  }

export default LoginFormModal;
