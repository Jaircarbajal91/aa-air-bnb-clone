import CreateReviewForm from "./CreateReviewForm";
import { Modal } from "../../context/Modal";

const CreatReviewModal = ({ spot, setShowReviewModal, setNewReviewPosted }) => {
  return (
    <Modal onClose={() => setShowReviewModal(false)}>
      <CreateReviewForm setNewReviewPosted={setNewReviewPosted} spot={spot} setShowReviewModal={setShowReviewModal}/>
    </Modal>
  )
}

export default CreatReviewModal
