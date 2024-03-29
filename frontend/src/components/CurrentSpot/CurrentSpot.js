import { Redirect, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { updateSpot, getSpotDetails } from '../../store/spots'
import { Modal } from '../../context/Modal'
import UpdateSpotForm from '../UpdateSpotForm/UpdateSpotForm'
import DeleteSpot from '../DeleteSpot/DeleteSpot'
import CreateBookingForm from '../Bookings/CreateBookingForm'
import { getAllBookingsForSpotThunk } from '../../store/bookings'
import { useHistory } from 'react-router-dom'
import { getSpotReviewsThunk } from '../../store/reviews'
import Reviews from '../Reviews'
import cancellation from '../Navigation/images/cancellation.svg'
import superhost from '../Navigation/images/superhost.svg'
import designedBy from '../Navigation/images/designedBy.svg'
import CreateReviewModal from '../Reviews/CreateReviewModal'
import UpdateReviewModal from '../Reviews/UpdateReviewModal'
import DeleteReviewModal from '../Reviews/DeleteReviewModal'
import './CurrentSpot.css'


function CurrentSpot() {
  const { spotId } = useParams()
  const history = useHistory()
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [hasUdpated, setHasUpdate] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [bookingsExist, setBookingsExist] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showUpdateReviewModal, setUpdateShowReviewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [newReviewPosted, setNewReviewPosted] = useState(false)
  const [updateReviewPosted, setUpdateReviewPosted] = useState(false)
  const [deletedReviewPosted, setDeletedReviewPosted] = useState(false)
  const [spotImages, setSpotImages] = useState([])
  const [reviewToUpdate, setReviewToUpdate] = useState({ review: '' })
  const sessionUser = useSelector(state => state.session.user)
  const spot = useSelector(state => state.spots.selectedSpot?.[spotId])
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const reviews = useSelector(state => state.reviews.orderedReviewsList)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const classNameSetter = [1, 2, 3, 4]

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSpotDetails(spotId))
    .then(() => dispatch(getSpotReviewsThunk(spotId)))
    .catch(async(err) => {
      const error = await err.json()
      console.log(error)
    })
    .finally((res) => setIsLoaded(true))
  }, [dispatch, newReviewPosted, updateReviewPosted, deletedReviewPosted])

  useEffect(() => {
    if (sessionUser) {
      dispatch(getAllBookingsForSpotThunk(spotId))
    }
  }, [dispatch, isLoaded])

  useEffect(() => {
    setFirstName(spot?.Owner.firstName[0].toUpperCase() + spot?.Owner.firstName.substring(1).toLowerCase())
    setLastName(spot?.Owner.lastName[0].toUpperCase() + spot?.Owner.lastName.substring(1).toLowerCase())
    setSpotImages(spot?.Images)
  }, [spot])

  if (isLoaded && !spot) {
    return <Redirect to='/'/>
  }

  const rating = spot?.avgStarRating == 0 ? "New" : spot?.avgStarRating
  return isLoaded && (
    <div className='current-spot-container'>
      {showReviewModal && <CreateReviewModal setNewReviewPosted={setNewReviewPosted} spot={spot} setShowReviewModal={setShowReviewModal} />}
      {showUpdateReviewModal && <UpdateReviewModal setUpdateReviewPosted={setUpdateReviewPosted} reviewToUpdate={reviewToUpdate} spot={spot} setUpdateShowReviewModal={setUpdateShowReviewModal} />}
      {showDeleteModal && <DeleteReviewModal setDeletedReviewPosted={setDeletedReviewPosted} reviewToUpdate={reviewToUpdate} setShowDeleteModal={setShowDeleteModal} />}
      <div className='current-spot-wrapper'>
        <div className='current-spot-content'>
          <div className='current-spot-top-container'>
            <h2 className='current-spot-title'>{spot.description}: {spot.name}</h2>
          </div>
          <div className='current-spot-bottom-container'>
            <div className='spot-left-container'>
              <i id="spot-star" className="fa-solid fa-star"></i>
              <span className='current-spot-rating'>{rating} · </span>
              <u className='current-spot-rating'>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</u>
              <span className='current-spot-rating'> · Superhost · </span>
              <span className='current-spot-location'>{spot.city}, {spot.state}, {spot.country}</span>
            </div>
            {spot.Owner.id === sessionUser?.id && (
              <div className='current-spot-buttons'>
                <button
                  className='spot-edit-button'
                  onClick={() => setShowUpdate(true)}>Edit Spot</button>
                <button
                  className='spot-delete-button'
                  onClick={() => setShowDelete(true)}>Delete Spot</button>
                {showUpdate && (
                  <Modal onClose={() => setShowUpdate(false)}>
                    <UpdateSpotForm spot={spot} spotId={spotId} setShowUpdate={setShowUpdate} />
                  </Modal>
                )}
                {showDelete && (
                  <Modal onClose={() => setShowDelete(false)} >

                    <DeleteSpot spotId={spotId} setShowDelete={setShowDelete} />
                  </Modal>
                )}
              </div>
            )}
          </div>
        </div>
        {spot && (
          <div className='current-spot-img-container'>
            <div className='preview-image main container'>
              <img className='preview-image main' src={`${spot.previewImage}`} />
            </div>
            {classNameSetter.map((num, i) => {
              let setClassName = ''
              let counter = 0
              if (i === 0) setClassName = 'preview-image top left'
              if (i === 1) setClassName = 'preview-image top right'
              if (i === 2) setClassName = 'preview-image bottom left'
              if (i === 3) setClassName = 'preview-image bottom right'
              return (
                <div className={`${setClassName} container`}>
                  <img key={i} className={setClassName} src={spotImages[i] ? spotImages[i].url : spot.previewImage} />
                </div>
              )
            })}
            {/* <img className='preview-image top left' src={`${spot.previewImage}`} />
            <img className='preview-image top right' src={`${spot.previewImage}`} />
            <img className='preview-image bottom left' src={`${spot.previewImage}`} />
            <img className='preview-image bottom right' src={`${spot.previewImage}`} /> */}
          </div>
        )}
        <div className='booking-container'>
          <div className='bottom-owner-description-container'>
            <h2 className='bottom-owner-description'>{spot.name[0].toUpperCase() + spot.name.slice(1).toLowerCase()} hosted by {spot.Owner.firstName[0].toUpperCase() + spot.Owner.firstName.slice(1).toLowerCase()} {spot.Owner.lastName[0].toUpperCase() + spot.Owner.lastName.slice(1).toLowerCase()}</h2>
            <div className='spot description'>
              <span>{spot.description}</span>
            </div>
            <div className='spot-description-extras-wrapper'>
              <div className='spot-description-extras-container'>
                <div className='spot-description-extras'>
                  <img src={designedBy} alt="designed-by-icon" />
                  <div className='spot-description-content'>
                    <span className='spot-description-content-top'>Designed by</span>
                    <span className='spot-description-content-bottom'>{firstName} {lastName}</span>
                  </div>
                </div>
                <div className='spot-description-extras'>
                  <img src={superhost} alt="designed-by-icon" />
                  <div className='spot-description-content'>
                    <span className='spot-description-content-top'>{firstName} is a Superhost</span>
                    <span className='spot-description-content-bottom'>Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.</span>
                  </div>
                </div>
                <div className='spot-description-extras'>
                  <img src={cancellation} alt="designed-by-icon" />
                  <div className='spot-description-content'>
                    <span className='spot-description-content-top'>Free cancellation for 48 hours.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <CreateBookingForm spot={spot} bookings={bookings} />
        </div>
        <div className='reviews-wrapper'>
          <div className='reviews-content-wrapper'>
            <div className='reviews-content-container bottom'>
              <i id="spot-star" className="fa-solid fa-star"></i>
              <span className='current-spot-rating'>{rating} · </span>
              <span className='current-spot-rating'>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
            </div>
            {sessionUser && <button className='write-review-button' onClick={() => setShowReviewModal(true)}>Write a review</button>}
          </div>
          {reviews.length > 0 && <Reviews setShowDeleteModal={setShowDeleteModal} setReviewToUpdate={setReviewToUpdate} setUpdateShowReviewModal={setUpdateShowReviewModal} sessionUser={sessionUser} spot={spot} reviews={reviews} />}
        </div>
      </div>
    </div>
  )
}
export default CurrentSpot;
