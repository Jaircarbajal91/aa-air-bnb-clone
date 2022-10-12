import icon from '../../Navigation/images/icon.svg'
import { format } from 'date-fns'
import './Review.css'


const Review = ({ review, sessionUser, setUpdateShowReviewModal, setReviewToUpdate,setShowDeleteModal }) => {
  const { User, createdAt } = review
  const { firstName } = User
  const formattedDate = format(new Date(createdAt), 'MMMM yyy')
  const content = review.review
  return (
    <div className='review-container'>
      <div className='review-user-info-container'>
        <img src={icon} alt="" />
        <div className='review-user-info'>
          <span className='review-name'>{firstName}</span>
          <span className='review-date'>{formattedDate}</span>
        </div>
      </div>
      <div className='review-content-container'>
        <span>{content}</span>
      </div>
      {sessionUser && sessionUser.id === User.id && <div className='review-options'>
        <span onClick={() => {
          setUpdateShowReviewModal(true)
          setReviewToUpdate(review)
        }}>edit</span>
        <span onClick={() => {
          setShowDeleteModal(true)
          setReviewToUpdate(review)
        }}>delete</span>
      </div>}
    </div>
  )
}

export default Review
