import { useParams } from 'react-router-dom'
import { useSelector, dispatch, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { updateSpot, getSpotDetails } from '../../store/spots'
import { Modal } from '../../context/Modal'
import UpdateSpotForm from '../UpdateSpotForm/UpdateSpotForm'
import DeleteSpot from '../DeleteSpot/DeleteSpot'
import CreateBookingForm from '../Bookings/CreateBookingFrom'
import { getAllBookingsForSpotThunk } from '../../store/bookings'
import { useHistory } from 'react-router-dom'
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


  const sessionUser = useSelector(state => state.session.user)
  const spot = useSelector(state => state.spots.selectedSpot?.[spotId])
  const bookings = useSelector(state => state.bookings?.orderedBookingList)

  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSpotDetails(spotId)).then((res) => setIsLoaded(true))
  }, [dispatch])

  useEffect(() => {
    if (sessionUser) {
      dispatch(getAllBookingsForSpotThunk(spotId))
    }
  }, [dispatch, isLoaded])


  const rating = spot?.avgStarRating == 0 ? "New" : spot?.avgStarRating
  return isLoaded && (
    <div className='current-spot-container'>
      <div className='current-spot-wrapper'>
        <div className='current-spot-content'>
          <div className='current-spot-top-container'>
            <h2 className='current-spot-title'>{spot.description}: {spot.name}</h2>
          </div>
          <div className='current-spot-bottom-container'>
            <div className='spot-left-container'>
            <i id="spot-star" className="fa-solid fa-star"></i>
            <p className='current-spot-rating'>{rating}</p>
            <p className='current-spot-location'>{spot.city}, {spot.state} {spot.country}</p>
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
                    <UpdateSpotForm spotId={spotId} setShowUpdate={setShowUpdate} />
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
            <div className='current-spot-left-container'>
              <img className='preview-image-main' src={`${spot.previewImage}`} />
            </div>
            <div className='current-spot-right-container'>
              <div className='upper-left-img'>
                <img className='preview-image' src={`${spot.previewImage}`} />
              </div>
              <div className='upper-right-img'>
                <img className='preview-image top' src={`${spot.previewImage}`} />
              </div>
              <div className='bottom-left-img'>
                <img className='preview-image' src={`${spot.previewImage}`} />
              </div>
              <div className='bottom-right-img'>
                <img className='preview-image bottom' src={`${spot.previewImage}`} />
              </div>
            </div>
          </div>
        )}
        <div className='booking-container'>
          <CreateBookingForm spot={spot} bookings={bookings} />
        </div>
      </div>
    </div>
  )
}
export default CurrentSpot;
