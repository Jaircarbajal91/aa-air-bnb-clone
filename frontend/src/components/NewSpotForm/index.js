import { useSelector, useDispatch } from "react-redux"
import { Redirect, useHistory } from "react-router-dom";
import { useState } from "react";
import { createNewSpot } from "../../store/spots";
import "./NewForm.css"

function NewSpotForm() {
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

  const history = useHistory()

  const dispatch = useDispatch()
  if (sessionUser === null) {
    alert("must be logged in to create a spot")
    return <Redirect to="/" />
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const newSpot = {
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
    const createdSpot = await dispatch(createNewSpot(newSpot));
    history.push("/")
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="new-spot-form"
    >
      <label >
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label >
        Address:
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </label>
      <label >
        City:
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </label>
      <label >
        State:
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
        />
      </label>
      <label >
        Country:
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
      </label>
      <label >
        Latitude:
        <input
          type="number"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
        />
      </label>
      <label >
        Longitude:
        <input
          type="number"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
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
        />
      </label>
      <label >
        Preview Image:
        <input
          type="url"
          value={previewImage}
          onChange={(e) => setPreviewImage(e.target.value)}
        />
      </label>
      <label >
        Description:
        <textarea
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <button type="submit">Create Spot</button>
    </form>
  )
}

export default NewSpotForm
