import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getAllUserBookingsThunk } from "../../../store/bookings"
import Listing from "../Listings"

function UserBookings() {
  const bookings = useSelector(state => state.bookings)
  const bookingsArr = bookings?.orderedBookingList
  const dispatch = useDispatch()
  const [isLoaded, setIsLoaded] = useState(false)
  useEffect(() => {
    const getUserBookings = async () => {
      try {
        if (bookings === null || bookingsArr === undefined) {
          await dispatch(getAllUserBookingsThunk())
        } else if (bookingsArr?.length && bookingsArr[0]?.Spot === undefined) {
          await dispatch(getAllUserBookingsThunk())
        } else {
          await dispatch(getAllUserBookingsThunk())
        }
      } catch (err) {
        const errors = await err.json()
        if (errors.message) setIsLoaded(true)
      }
    }
    getUserBookings()
    setIsLoaded(true)
  }, [dispatch])
  
  return isLoaded && (
    <div>
      {bookings.orderedBookingList.length === 0 && (
        <div>Looks like you currently don't have any bookings :(</div>
      )}
      {bookingsArr?.[0]?.Spot && bookingsArr?.length > 0 && (<table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Dates Booked</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {bookingsArr.map(booking => (
            <tr key={booking.id}>
              <Listing booking={booking} />
            </tr>
          ))}
        </tbody>
      </table>)}
    </div>
  )
}
export default UserBookings
