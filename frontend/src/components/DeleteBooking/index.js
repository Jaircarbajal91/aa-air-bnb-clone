import { useHistory } from "react-router-dom";
import { deleteBookingThunk } from "../../store/bookings";
import { useDispatch } from "react-redux";
function DeleteBooking({booking, setShowModal}) {
  const dispatch = useDispatch()
  const history = useHistory()
  const handleDelete = async (e) => {
    await dispatch(deleteBookingThunk(booking.id))
    setShowModal(false)
    history.push("/bookings")
  }
  return (
    <div>
      <button onClick={() => handleDelete()}>YES</button>
      <button onClick={() => setShowModal(false)}>NO</button>
    </div>
  )
}

export default DeleteBooking;
