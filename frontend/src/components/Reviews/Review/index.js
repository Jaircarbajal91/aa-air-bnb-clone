import icon from '../../Navigation/images/icon.svg'
import { format } from 'date-fns'
import './Review.css'


const Review = ({ review }) => {
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
    </div>
  )
}

export default Review
