import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { getAllUserBookingsThunk } from "../../../store/bookings"
import { Modal } from "../../../context/Modal"
import DeleteBooking from "../../DeleteBooking"
import UpdateBookingForm from "../UpdateBooking"

function CurrentBooking() {
  const { bookingId } = useParams()
  const dispatch = useDispatch()
  const bookings = useSelector(state => state.bookings)
  const booking = useSelector(state => state.bookings?.[bookingId])
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false)
  const sessionUser = useSelector(state => state.session.user)
  const spot = booking?.Spot
  let startDate, endDate;
  if (booking) {
    startDate = booking.startDate
    endDate = booking.endDate
  }
  useEffect(() => {
    const getBooking = async () => {
      if (bookings === null) {
        const res = await dispatch(getAllUserBookingsThunk())
        setIsLoaded(true)
      } else {
        setIsLoaded(true)
      }
    }
    getBooking()
  }, [dispatch, bookings])

  const formatDate = (date) => {
    let result = new Date(date).toLocaleDateString('en-us', {
      weekday: "long", year: "numeric", month: "short", day: "numeric"
    })
    return result
  }
  const checkIn = formatDate(startDate)
  const checkOut = formatDate(endDate)

  const date1 = new Date(startDate);
  const date2 = new Date(endDate);
  const Difference_In_Time = date2.getTime() - date1.getTime();
  const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  const total = Difference_In_Days * spot?.price
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return (
    <div className="current-booking">
      {isLoaded && (
        <div className="confirmation-container">
          <div className="confirmation-right-container">
            <div className="confirmation-header">
              <h1>Your reservation is confirmed</h1>
              <p>{`You're going to ${spot?.city}!`}</p>
            </div>
            <img style={{
              maxWidth: '20em'
            }} src={spot.previewImage} />
            <div className="confirmation-description">
              <p>{spot.name}</p>
              <p>{spot.description}</p>
              <p>{spot.city}, {spot.state}</p>
            </div>
            <div className="confirmation-booking info">
              <div className="confirmation-left-itinerary">
                <p>{checkIn.split(',')[0]}</p>
                <p>{checkIn.split(',')[1]},{checkIn.split(',')[2]}</p>
                <p>Check-in time is 4PM - 9PM</p>
              </div>
              <div className="confirmation-right-itinerary">
                <p>{checkOut.split(',')[0]}</p>
                <p>{checkOut.split(',')[1]},{checkIn.split(',')[2]}</p>
                <p>Check out time is 11AM</p>
              </div>
            </div>
          </div>
          <div className="confirmation-left-container">
            <div className="confirmation-address-container">
              <h3>Address</h3>
              <p>{spot.address}, {spot.city}, {spot.state}, {spot.country}</p>
            </div>
            <div className="confirmation-total-amount">
              <h3>Amount</h3>
              <p>{formatter.format(total)}</p>
            </div>
          </div>
          {booking.userId === sessionUser.id && (
            <div>
              <button onClick={() => setShowUpdate(true)}>Edit Spot</button>
              <button onClick={() => setShowDelete(true)}>Delete Spot</button>
              {showUpdate && (
                <Modal onClose={() => setShowUpdate(false)}>
                  <UpdateBookingForm booking={booking} setShowModal={setShowModal} />
                </Modal>
              )}
              {showDelete && (
                <Modal onClose={() => setShowDelete(false)}>
                  <DeleteBooking booking={booking} setShowModal={setShowModal} />
                </Modal>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CurrentBooking
