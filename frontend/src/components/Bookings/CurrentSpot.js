import { useParams } from 'react-router-dom'
import { useSelector, dispatch, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { getSpotDetails } from '../../store/spots'

function CurrentSpot() {
  const {spotId} = useParams()
  const spot = useSelector(state => state.spots[spotId])
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(getSpotDetails(spotId))
  }, [dispatch])
  return (
    <div>
      hello from current spot
    </div>
  )
}
export default CurrentSpot;
