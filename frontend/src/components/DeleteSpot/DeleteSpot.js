import { useHistory } from "react-router-dom";
import { deleteSpot } from "../../store/spots";
import { useDispatch } from "react-redux";
import './Delete.css'

function DeleteSpot({ spotId, setShowDelete }) {
  const dispatch = useDispatch()
  const history = useHistory()
  const handleDelete = async (e) => {
    await dispatch(deleteSpot(spotId))
    setShowDelete(false)
    history.push("/")
  }
  return (
    <div className="delete-container">
      <p className="delete-message">This spot will be deleted <strong> permanently</strong>. Are you sure you want to proceed? </p>
      <div className="delete-buttons">
        <button className="delete-button" onClick={() => handleDelete()}>YES</button>
        <button className="delete-button" onClick={() => setShowDelete(false)}>NO</button>
      </div>
    </div>
  )
}

export default DeleteSpot;
