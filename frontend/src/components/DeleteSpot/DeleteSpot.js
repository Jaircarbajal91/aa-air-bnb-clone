import { useHistory } from "react-router-dom";
import { deleteSpot } from "../../store/spots";
import { useDispatch } from "react-redux";
function DeleteSpot({spotId, setShowModal}) {
  const dispatch = useDispatch()
  const history = useHistory()
  const handleDelete = async (e) => {
    await dispatch(deleteSpot(spotId))
    setShowModal(false)
    history.push("/")
  }
  return (
    <div>
      <button onClick={() => handleDelete()}>YES</button>
      <button onClick={() => setShowModal(false)}>NO</button>
    </div>
  )
}

export default DeleteSpot;
