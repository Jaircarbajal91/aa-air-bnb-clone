import { Modal } from "../../../context/Modal"
import { useDispatch } from "react-redux"
import { deleteReviewThunk } from "../../../store/reviews"

const DeleteReviewModal = ({setShowDeleteModal, reviewToUpdate, setDeletedReviewPosted }) => {
  const dispatch = useDispatch()
  const handleDelete = async () => {
    await dispatch(deleteReviewThunk(reviewToUpdate.id))
    setShowDeleteModal(false)
    setDeletedReviewPosted(true)
    setDeletedReviewPosted(false)
  }

  return (
    <Modal onClose={() => setShowDeleteModal(false)}>
      <div className="delete-review">
        <h3>Are you sure you would like to delete this review?</h3>
        <button onClick={() => setShowDeleteModal(false)}>No</button>
        <button onClick={handleDelete}>Yes</button>
      </div>
    </Modal>
  )
}

export default DeleteReviewModal
