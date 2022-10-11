import UpdateReviewForm from "./UpdateReviewForm";
import { Modal } from "../../../context/Modal";

const UpdateReviewModal = ({ spot, setUpdateShowReviewModal, reviewToUpdate, setUpdateReviewPosted }) => {
  return (
    <Modal onClose={() => setUpdateShowReviewModal(false)}>
      <UpdateReviewForm setUpdateReviewPosted={setUpdateReviewPosted} setUpdateShowReviewModal={setUpdateShowReviewModal} reviewToUpdate={reviewToUpdate} spot={spot} />
    </Modal>
  )
}

export default UpdateReviewModal
