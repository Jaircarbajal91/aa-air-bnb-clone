import { useSelector, useDispatch } from "react-redux"
import { useEffect, useState } from "react"
import { getAllUserBookingsThunk } from "../../../store/bookings"
import Listing from "../Listings"

function UserBookings() {
  const bookings = useSelector(state => state.bookings?.orderedBookingList)
  const dispatch = useDispatch()
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasBookings, setHasBookings] = useState(false)
  useEffect(() => {
    const getUserBookings = async () => {
      try {
        if (bookings === undefined) {
          await dispatch(getAllUserBookingsThunk())
        } else if (bookings.length && bookings[0]?.Spot === undefined) {
          console.log(bookings)
          await dispatch(getAllUserBookingsThunk())
        } else {
          await dispatch(getAllUserBookingsThunk())
        }
      } catch (err) {
        const errors = await err.json()
      }
    }
    getUserBookings()
    setIsLoaded(true)
    if (bookings?.length) {
      setHasBookings(true)
    }
  }, [dispatch])

  return isLoaded && (
    <div>
      {!hasBookings && (
        <div>
          You currently have no bookings :(
        </div>
      )}
      {hasBookings && (<table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th>Dates Booked</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {isLoaded && bookings[0]?.Spot && !!bookings?.length && bookings.map(booking => (
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
