import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getAllUserBookingsThunk } from "../../../store/bookings"
import Listing from "../Listings"

function UserBookings() {
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const dispatch = useDispatch()
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    const getBookings = async () => {
      if (bookings === undefined || bookings.length) {
        const bookingsArr = await dispatch(getAllUserBookingsThunk())
        setIsLoaded(true)
      } else {
        setIsLoaded(true)
      }
    }
    getBookings()
  }, [dispatch])
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Dates Booked</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {isLoaded && !!bookings.length && bookings.map(booking => (
            <tr key={booking.id}>
              <Listing booking={booking} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default UserBookings
