import { useParams } from 'react-router-dom'
import { useSelector, dispatch, useDispatch } from 'react-redux'
import { useEffect, useState } from 'react'
import { getSpotDetails } from '../../store/spots'
import './CurrentSpot.css'

function CurrentSpot() {
  const { spotId } = useParams()
  const sessionUser = useSelector(state => state.session.user)
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSpotDetails(spotId))
  }, [dispatch])
  const spot = useSelector(state => state.spots[spotId])

  return (
    <div className='current-spot'>
      <p>{spot?.description}: {spot?.name}</p>
      <div>
        <i className="fa-solid fa-star"></i>
        <p>{spot?.avgStarRating}</p>
      </div>
      <p>{spot?.city}, {spot?.state} {spot?.country}</p>
      <div>
        <img className='preview-image' src={`${spot?.previewImage}`} alt="" />
      </div>
      {spot?.Owner.id === sessionUser.id && (
        <div>
          <button>Edit Spot</button>
          <button>Delete Spot</button>
        </div>
      )}
    </div>
  )
}
export default CurrentSpot;
