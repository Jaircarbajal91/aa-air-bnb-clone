import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";


function DeleteBooking({ booking, setShowDelete, setDeleted }) {
  const dispatch = useDispatch()
  const history = useHistory()
  return (
    <div>
      <button onClick={() => {
        setDeleted(true)
        setShowDelete(false)
      }}>YES</button>
      <button onClick={() => {
        setShowDelete(false)
        history.push('/bookings')
        }}>NO</button>
    </div>
  )
}

export default DeleteBooking;
