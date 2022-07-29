import { useHistory } from "react-router-dom";
import { deleteBookingThunk } from "../../../store/bookings";
import { useDispatch } from "react-redux";
function DeleteBooking({booking, setShowDelete}) {
  const dispatch = useDispatch()
  const history = useHistory()
  const handleDelete = async (e) => {
    await dispatch(deleteBookingThunk(booking.id))
    setShowDelete(false)
    history.push("/bookings")
  }
  return (
    <div>
      <button onClick={() => handleDelete()}>YES</button>
      <button onClick={() => setShowDelete(false)}>NO</button>
    </div>
  )
}

export default DeleteBooking;
