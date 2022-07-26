import { useParams } from 'react-router-dom'
import { useSelector, dispatch, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { getSpotDetails, updateSpot } from '../../store/spots'
import { Modal } from '../../context/Modal'
import UpdateSpotForm from '../UpdateSpotForm/UpdateSpotForm'
import DeleteSpot from '../DeleteSpot/DeleteSpot'
import './CurrentSpot.css'

function CurrentSpot() {
  const { spotId } = useParams()
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);

  const sessionUser = useSelector(state => state.session.user)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSpotDetails(spotId))
  }, [dispatch])
  const spot = useSelector(state => state.spots[spotId])
  const handleClickUpdate = async (id) => {
    const udpatedSpot = await dispatch(updateSpot(id))
  }

  return (
    <div className='current-spot'>
      <p>{spot?.description}: {spot?.name}</p>
      <div>
        <i className="fa-solid fa-star"></i>
        <p>{spot?.avgStarRating}</p>
      </div>
      <p>{spot?.city}, {spot?.state} {spot?.country}</p>
      <div>
        <img className='preview-image' src={`${spot?.previewImage}`} />
      </div>
      {spot?.Owner?.id === sessionUser.id && (
        <div>
          <button onClick={() => setShowUpdate(true)}>Edit Spot</button>
          <button onClick={() => setShowDelete(true)}>Delete Spot</button>
          {showUpdate && (
            <Modal onClose={() => setShowUpdate(false)}>
              <UpdateSpotForm spotId={spotId} setShowModal={setShowModal} />
            </Modal>
          )}
          {showDelete && (
            <Modal onClose={() => setShowDelete(false)}>
              <DeleteSpot spotId={spotId} setShowModal={setShowModal} />
            </Modal>
          )}
        </div>
      )}
    </div>
  )
}
export default CurrentSpot;
