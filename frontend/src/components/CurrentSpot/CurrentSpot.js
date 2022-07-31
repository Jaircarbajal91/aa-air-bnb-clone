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
  const paramSpot = useSelector(state => state.selectedSpot?.selectedSpot[spotId])
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [spotExists, setSpotExists] = useState(false)
  const [hasUpdated, setHasUpdated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuth, setIsAuth] = useState(true)
  const [bookingsExist, setBookingsExist] = useState(false)
  const [spot, setSpot] = useState(paramSpot)

  const sessionUser = useSelector(state => state.session.user)
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const dispatch = useDispatch()
  useEffect(() => {
    const checkSpot = async () => {
      if (spot === undefined) {
        const res = await dispatch(getSpotDetails(spotId))
        setSpot(res)
        setSpotExists(true)
      } else {
        setSpotExists(true)
      }
    }
    checkSpot()
  }, [dispatch, spot])

  useEffect(() => {
    const getSpotBookings = async () => {
      if (sessionUser) {
        try {
          if (bookings === undefined) {
            const res = await dispatch(getAllBookingsForSpotThunk(spotId))
            setBookingsExist(true)
          }
        } catch (err) {
          const errors = await err.json()
          if (errors?.errors[0] === "Unauthorized") {
            setIsAuth(false)
          }
        }
      }
    }
    getSpotBookings()
    setIsLoaded(true)
  }, [dispatch, bookings])

  useEffect(() => {
    if (hasUpdated) history.push(`/spot/${spotId}`)
  }, [hasUpdated])
  const rating = spot?.avgStarRating == 0 ? "New" : spot?.avgStarRating
  return isLoaded && (
    <div className='current-spot'>
      <p>{spot?.description}: {spot?.name}</p>
      <div>
        <i className="fa-solid fa-star"></i>
        <p>{rating}</p>
      </div>
      <p>{spot?.city}, {spot?.state} {spot?.country}</p>
      {spot && (<div>
        <img className='preview-image' src={`${spot.previewImage}`} />
      </div>)}
      {spot?.Owner.id === sessionUser?.id && (
        <div>
          <button onClick={() => setShowUpdate(true)}>Edit Spot</button>
          <button onClick={() => setShowDelete(true)}>Delete Spot</button>
          {showUpdate && (
            <Modal onClose={() => setShowUpdate(false)}>
              <UpdateSpotForm setHasUpdated={setHasUpdated} spotId={spotId} setShowUpdate={setShowUpdate} />
            </Modal>
          )}
          {showDelete && (
            <Modal onClose={() => setShowDelete(false)} >

              <DeleteSpot spotId={spotId} setShowDelete={setShowDelete} />
            </Modal>
          )}
        </div>
      )}
      {sessionUser === null && (
        <div>Please log in to set a reservation</div>
      )}
      {spotExists && <CreateBookingForm spot={spot} bookings={bookings} />}
    </div>
  )
}
export default CurrentSpot;
