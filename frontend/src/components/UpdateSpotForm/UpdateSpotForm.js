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
  const [lat, setLat] = useState("")
  const [lng, setLng] = useState("")
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
    if (Number(lat) > 90 || Number(lat) < -90) newErrors.push("Latitude is not valid")
    if (Number(lng) > 180 || Number(lng) < -180) newErrors.push("Longitude is not valid")

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
      <div className="update-form header">
        <h3>Update Spot Form</h3>
      </div>
      {hasSubmitted && errors.length > 0 && (
        <ul>
          {errors.map(error => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
      <div className="update-input-wrapper">
        <input
          type="text"
          placeholder="Name of Spot"
          className="form-input first update"
          value={name}
          maxLength='50'
          minLength='1'
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Address"
          className="form-input none update"
          maxLength='50'
          minLength='1'
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="City"
          className="form-input none update"
          maxLength='20'
          minLength='1'
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="State"
          className="form-input none update"
          maxLength='2'
          minLength='1'
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Country"
          className="form-input none update"
          maxLength='50'
          minLength='1'
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
        />
        <input
          type="number"
          className="form-input none update"
          value={lat}
          min='-90'
          max='90'
          step="0.01"
          placeholder="Latitude"
          onChange={(e) => setLat(e.target.value)}
          required
        />
        <input
          type="number"
          className="form-input none update"
          value={lng}
          min='-180'
          max='180'
          step="0.01"
          placeholder="Longitude"
          onChange={(e) => setLng(e.target.value)}
          required
        />
        <input
          type="number"
          className="form-input none update"
          value={price}
          pattern="^\d+(?:\.\d{1,2})?$"
          min="0.00"
          step="0.01"
          placeholder="Price"
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="url"
          name="preview-image"
          className="form-input none update"
          placeholder="Image URL"
          value={previewImage}
          onChange={(e) => setPreviewImage(e.target.value)}
          required
        />
        <textarea
          type="text"
          value={description}
          className="form-input last desc update"
          placeholder="Description"
          maxLength='50'
          minLength='5'
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <button className="submit-button update" type="submit">Update Spot</button>
    </form>
  )
}

export default UpdateSpotForm
