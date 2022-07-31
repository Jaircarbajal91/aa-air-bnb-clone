import { useSelector, useDispatch } from "react-redux"
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { updateSpot } from "../../store/spots";
import './UpdateSpot.css'

function UpdateSpotForm({ setShowUpdate, setHasUpdated }) {
  const { spotId } = useParams()
  const sessionUser = useSelector(state => state.session.user)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [country, setCountry] = useState("")
  const [lat, setLat] = useState(0)
  const [lng, setLng] = useState(0)
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [previewImage, setPreviewImage] = useState("")
  const [errors, setErrors] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const history = useHistory()
  const dispatch = useDispatch()
  useEffect(() => {
    const newErrors = []
    if (name.length > 50) newErrors.push("Name must be less than 50 characters")
    if (Number(lat) > 90 || Number(lat) < -90)  newErrors.push("Latitude is not valid")
    if (Number(lng) > 180 || Number(lng) < -180)  newErrors.push("Longitude is not valid")

    setErrors(newErrors)

  }, [name, lat, lng])

  if (sessionUser === null) {
    alert("must be logged in to edit a spot")
    return <Redirect to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasSubmitted(true)
    if (errors.length > 0) return;

    const updatedSpot = {
      id: spotId,
      name,
      address,
      city,
      state,
      country,
      lat,
      lng,
      previewImage,
      price,
      description
    }

    const response = await dispatch(updateSpot(updatedSpot))
    setHasUpdated(true);
    setShowUpdate(false)
    history.push(`/spots/${spotId}`)
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="update-spot-form"
    >
      <h3>Update Spot Form</h3>
      {hasSubmitted && errors.length > 0 && (
        <ul>
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <label >
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label >
        Address:
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
      </label>
      <label >
        City:
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
      </label>
      <label >
        State:
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
      </label>
      <label >
        Country:
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
      </label>
      <label >
        Latitude:
        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          required
        />
      </label>
      <label >
        Longitude:
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          required
        />
      </label>
      <label >
        Price per night:
        <input
          type="number"
          value={price}
          min="0.00"
          step="0.01"
          placeholder="100.00"
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>
      <label >
        Preview Image:
        <input
          type="url"
          name="preview-image"
          accept="image/png, image/gif, image/jpeg"
          value={previewImage}
          onChange={(e) => setPreviewImage(e.target.value)}
          required
        />
      </label>
      <label >
        Description:
        <textarea
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <button type="submit">Update Spot</button>
    </form>
  )
}

export default UpdateSpotForm
