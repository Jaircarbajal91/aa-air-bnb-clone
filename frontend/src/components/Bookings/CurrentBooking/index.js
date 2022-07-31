import { useEffect, useState } from "react"
import { useParams, useHistory } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getAllUserBookingsThunk } from "../../../store/bookings"
import { Modal } from "../../../context/Modal"
import DeleteBooking from "../DeleteBooking"
import UpdateBookingForm from "../UpdateBooking"
import { deleteBookingThunk } from "../../../store/bookings";

function CurrentBooking() {
  const { bookingId } = useParams()
  const history = useHistory()
  const dispatch = useDispatch()
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [changeable, setChangeable] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)
  const [total, setTotal] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const sessionUser = useSelector(state => state.session.user)
  let bookings = useSelector(state => state.bookings)
  let booking = useSelector(state => state.bookings?.[bookingId])
  const spot = booking?.Spot
  useEffect(() => {
    const getBookings = async () => {
      try {
        if (bookings === null || spot === undefined) {
          await dispatch(getAllUserBookingsThunk())
        } else {
          setIsLoaded(true)
          let start = new Date(booking.startDate)
          let end = new Date(booking.endDate)
          let startDate = new Date(start.getTime() + start.getTimezoneOffset() * 60000)
          let endDate = new Date(end.getTime() + end.getTimezoneOffset() * 60000)
          setCheckIn(new Date(startDate).toDateString())
          setCheckOut(new Date(endDate).toDateString())

          const Difference_In_Time = end.getTime() - start.getTime();
          const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
          setTotal(Difference_In_Days * spot?.price)

          const date = new Date(startDate).getTime()
          const today = new Date().getTime()

          if (date < today) setChangeable(false)
        }
      } catch (err) {
        const error = await err.json()
        if (error.message === "You have no bookings yet"){
          history.push('/bookings')
        }
      }
    }
    getBookings()
    console.log(bookings)
  }, [dispatch, bookings, booking?.endDate, booking?.startDate, spot?.price])


  useEffect(() => {
    if (deleted) {
      dispatch(deleteBookingThunk(bookingId))
        .then(() => history.push('/bookings'))
    }
  }, [deleted, bookingId, dispatch, history])

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return isLoaded && (
    <div className="current-booking">
      <div className="confirmation-container">
        <div className="confirmation-right-container">
          <div className="confirmation-header">
            <h1>{changeable ? "Your reservation is confirmed" : "We hope you enjoyed your stay!"}</h1>
            <p>{changeable && `You're going to ${spot?.city}!`}</p>
          </div>
          {spot && (<img style={{
            maxWidth: '20em'
          }} src={spot?.previewImage} />)}
          <div className="confirmation-description">
            <p>{spot?.name}</p>
            <p>{spot?.description}</p>
            <p>{spot?.city}, {spot?.state}</p>
          </div>
          <div className="confirmation-booking info">
            <div className="confirmation-left-itinerary">
              <p>{checkIn.substring(0, 3)}</p>
              <p>{checkIn.substring(3)}</p>
              <p>Check-in time is 4PM - 9PM</p>
            </div>
            <div className="confirmation-right-itinerary">
              <p>{checkOut.substring(0, 3)}</p>
              <p>{checkOut.substring(3)}</p>
              <p>Check out time is 11AM</p>
            </div>
          </div>
        </div>
        <div className="confirmation-left-container">
          <div className="confirmation-address-container">
            <h3>Address</h3>
            <p>{spot?.address}, {spot?.city}, {spot?.state}, {spot?.country}</p>
          </div>
          <div className="confirmation-total-amount">
            <h3>Amount</h3>
            <p>{formatter.format(total)}</p>
          </div>
        </div>
        {booking?.userId === sessionUser.id && changeable && (
          <div>
            {/* <button onClick={() => setShowUpdate(true)}>Change Reservaion</button> */}
            <button onClick={() => setShowDelete(true)}>Cancel Reservaion</button>
            {/* {showUpdate && (
              <Modal onClose={() => setShowUpdate(false)}>
                <UpdateBookingForm booking={booking} setShowUpdate={setShowUpdate} />
              </Modal>
            )} */}
            {showDelete && (
              <Modal onClose={() => setShowDelete(false)}>
                <DeleteBooking setDeleted={setDeleted} booking={booking} setShowDelete={setShowDelete} />
              </Modal>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CurrentBooking
