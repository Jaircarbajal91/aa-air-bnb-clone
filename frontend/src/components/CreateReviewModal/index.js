import CreateReviewForm from "./CreateReviewForm";
import { Modal } from "../../context/Modal";

const CreatReviewModal = ({ spot, setShowReviewModal }) => {
  return (
    <Modal onClose={() => setShowReviewModal(true)}>
      <CreateReviewForm spot={spot} setShowReviewModal={setShowReviewModal}/>
    </Modal>
  )
}

export default CreatReviewModal
