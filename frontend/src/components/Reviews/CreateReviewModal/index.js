import CreateReviewForm from "./CreateReviewForm";
import { Modal } from "../../../context/Modal";

const CreateReviewModal = ({ spot, setShowReviewModal, setNewReviewPosted }) => {
  return (
    <Modal onClose={() => setShowReviewModal(false)}>
      <CreateReviewForm setNewReviewPosted={setNewReviewPosted} spot={spot} setShowReviewModal={setShowReviewModal}/>
    </Modal>
  )
}

export default CreateReviewModal
