import React, { useState } from 'react';
import { Modal } from '../../context/Modal';
import SignupFormPage from '.';
import { useDispatch } from 'react-redux'



  function SignUpFormModal({showSignUpModal, setShowSignUpModal}) {
    const [showModal, setShowModal] = useState(false);
    const dispatch = useDispatch()

    return (
      <>
        {showSignUpModal && (
          <Modal className='signup-modal' onClose={() => setShowSignUpModal(false)}>
            <SignupFormPage setShowSignUpModal={setShowSignUpModal}/>
          </Modal>
        )}
      </>
    );
  }

export default SignUpFormModal;
