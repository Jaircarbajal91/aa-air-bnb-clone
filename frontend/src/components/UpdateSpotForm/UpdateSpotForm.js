import { useSelector, useDispatch } from "react-redux"
import { Redirect, useHistory, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSpotDetails, updateSpot } from "../../store/spots";
import UpdateLoadingAnimation from "../LoadingAnimation/UpdateLoadingAnimation";
import exit from '../Navigation/images/exit.svg'
import './UpdateSpot.css'

function UpdateSpotForm({ setShowUpdate, spot }) {
  const { spotId } = useParams()
  const sessionUser = useSelector(state => state.session.user)
  const [name, setName] = useState(spot.name)
  const [address, setAddress] = useState(spot.address)
  const [city, setCity] = useState(spot.city)
  const [state, setState] = useState(spot.state)
  const [country, setCountry] = useState(spot.country)
  const [lat, setLat] = useState(spot.lat)
  const [lng, setLng] = useState(spot.lng)
  const [price, setPrice] = useState(spot.price)
  const [description, setDescription] = useState(spot.description)
  const [previewImage, setPreviewImage] = useState(spot.previewImage)
  const [errors, setErrors] = useState([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState([]);
  const [isDisabled, setIsDisabled] = useState(true)
  const [previewImages, setPreviewImages] = useState([spot.previewImage, ...spot.Images.map(image => image.url)])
  const [unmutablePreviewImages, setUnmutablePreview] = useState([spot.previewImage, ...spot.Images.map(image => image.url)])
  const [imagesToDelete, setImagesToDelete] = useState([])
  const history = useHistory()
  const dispatch = useDispatch()
  useEffect(() => {
    const newErrors = []
    if (name.length > 50) newErrors.push("Name must be less than 50 characters")
    if (previewImages.length < 5) newErrors.push("You need at least 5 images")
    // if (Number(lat) > 90 || Number(lat) < -90) newErrors.push("Latitude is not valid")
    // if (Number(lng) > 180 || Number(lng) < -180) newErrors.push("Longitude is not valid")
    if (!newErrors.length) setIsDisabled(false)
    else setIsDisabled(true)
    setErrors(newErrors)

  }, [name, lat, lng, previewImages.length])

  if (sessionUser === null) {
    alert("must be logged in to edit a spot")
    return <Redirect to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasSubmitted(true)
    if (errors.length > 0) return;
    setIsSubmitting(true)
    const updatedSpot = {
      id: spotId,
      name,
      address,
      city,
      state,
      country,
      lat: 1,
      lng: 1,
      price,
      description,
      images,
      imagesToDelete
    }

    const response = await dispatch(updateSpot(updatedSpot))
    await dispatch(getSpotDetails(spotId))
    setShowUpdate(false)
    history.push(`/spots/${spotId}`)
  }

  const removePreviewImage = (imageToRemove, idx) => {
    const newPreviewImages = [...previewImages]
    const imageToDelete = newPreviewImages.splice(idx, 1)[0]
    const imageFoundInUnmutable = unmutablePreviewImages.find(image => image === imageToDelete)
    setImagesToDelete([...imagesToDelete, imageFoundInUnmutable])
    const newImages = [...images]
    newImages.splice(idx, 1)
    setPreviewImages(newPreviewImages)
    setImages(newImages)
  }

  const getPreviewImages = async (uploaded) => {
    const file = uploaded[uploaded.length - 1]
    const reader = new FileReader(file)
    reader.readAsDataURL(file);
    reader.onloadend = function () {
      setPreviewImages([...previewImages, reader.result])
    }
  }

  const updateImages = async (files) => {
    const uploaded = [...images]
    const length = uploaded.length
    const file = files[files.length - 1]
    const item = uploaded.find(uploadedFile => uploadedFile.name === file.name)
    if (item) {
      files.pop()
    } else {
      uploaded.push(file)
    }
    setImages(uploaded)
    if (uploaded.length !== length) {
      getPreviewImages(uploaded)
    }
  }

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files)
    updateImages(chosenFiles)
  }

  const checkKeyDown = (e) => {
    if (e.keyCode == 13) return false;
  };
  return !isSubmitting ? (
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
        {/* <input
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
        /> */}
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
        {/* <input
          type="url"
          name="preview-image"
          className="form-input none update"
          placeholder="Image URL"
          value={previewImage}
          onChange={(e) => setPreviewImage(e.target.value)}
          required
        /> */}
        <textarea
          type="text"
          value={description}
          className="form-input last desc update"
          placeholder="Description"
          onKeyDown={(e) => checkKeyDown(e)}
          maxLength='400'
          minLength='20'
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <span className="add-images update">Please add minimum 5 images:</span>
        <input
          type="file"
          className="file-select update-spot"
          accept=".png,
                            .jpeg,
                            .jpg,
                            .gif,"
          onChange={handleFileEvent}
        />
      </div>
      <button disabled={isDisabled} className="submit-button update" type="submit">Update Spot</button>
      <div className="preview-images-container update">
        {previewImages.length > 0 && previewImages.map((image, i) => (
          <div key={i} className="current-preview-image">
            <img className="preview image update" src={image} />
            <img onClick={(e) => removePreviewImage(image, i)} className='remove-preivew-img icon update' src={exit} alt="" />
          </div>
        ))}
      </div>
    </form>
  ) : <div className="udpate-loading-animation-container">
    <UpdateLoadingAnimation />
  </div>
}

export default UpdateSpotForm
