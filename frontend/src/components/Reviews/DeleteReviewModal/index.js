import { Modal } from "../../../context/Modal"
import { useDispatch } from "react-redux"
import { deleteReviewThunk } from "../../../store/reviews"
import './DeleteReview.css'
import { useEffect } from "react"

const DeleteReviewModal = ({ setShowDeleteModal, reviewToUpdate, setDeletedReviewPosted }) => {
  const dispatch = useDispatch()
  const handleDelete = async () => {
    await dispatch(deleteReviewThunk(reviewToUpdate.id))
    setShowDeleteModal(false)
    setDeletedReviewPosted(true)
    setDeletedReviewPosted(false)
  }

  return (
    <Modal onClose={() => setShowDeleteModal(true)}>
      <div className="delete-review-container">
        <h3>Are you sure you would like to delete this review?</h3>
        <div className="delete button container">
          <button id="no-button" onClick={() => setShowDeleteModal(false)}>No</button>
          <button onClick={handleDelete}>Yes</button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteReviewModal
