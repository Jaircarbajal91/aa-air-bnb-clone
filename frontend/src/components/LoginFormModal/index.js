import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import LoginForm from './LoginForm';
import { logInAsDemo } from '../../store/session'
import { useDispatch } from 'react-redux'

  function LoginFormModal() {
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch()
    async function handleDemo() {
      const demo = await dispatch(logInAsDemo())
    }
    return (
      <>
        <button onClick={() => setShowModal(true)}>Log In</button>
        <button onClick={() => handleDemo()}>Demo Log In</button>
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            <LoginForm />
          </Modal>
        )}
      </>
    );
  }

export default LoginFormModal;
