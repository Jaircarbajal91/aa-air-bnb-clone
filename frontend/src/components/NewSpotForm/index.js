import { useSelector, useDispatch } from "react-redux"
import { Redirect, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import { createNewSpot } from "../../store/spots";
import { getAllSpots } from "../../store/spots";
import plus from '../Navigation/images/plus.svg'
import states from '../../utils/statesArray'
import countryList from '../../utils/countryList'
import exit from '../Navigation/images/exit.svg'
import "./NewSpotForm.css"
import { CommandCompleteMessage } from "pg-protocol/dist/messages";
import LoadingAnimation from "../LoadingAnimation";

function NewSpotForm() {
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
  const [message, setMessage] = useState("Welcome back!")
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [images, setImages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [page, setPage] = useState(0)
  const [errors, setErrors] = useState([]);
  const [nameErrors, setNameErrors] = useState([])
  const [priceErrors, setPriceErrors] = useState([])
  const [addressErrors, setAddressErrors] = useState([])
  const [descriptionErrors, setDescriptionErrors] = useState([])
  const [isDisabled, setIsDisabled] = useState(true)
  const [previewImages, setPreviewImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const history = useHistory()
  const dispatch = useDispatch()

  const spots = useSelector(state => state.spots?.orderedSpotsList)

  useEffect(() => {
    dispatch(getAllSpots())
  }, [dispatch])

  useEffect(() => {
    const newErrors = []
    const errors = {
      name: [],
      address: [],
      price: [],
      description: [],
      images: []
    }
    switch (page) {
      case (0): {
        setMessage("Welcome Back!")
        break;
      }
      case (1): {
        setMessage("Give your new spot a name!")
        if (name.length < 1) newErrors.push("Please enter the name of your new spot")
        if (name.length > 50) errors.name.push("Name must be less than 50 characters")
        break;
      }
      case (2): {
        setMessage("What is your new spots address?")
        if (address.length < 1) newErrors.push("Please enter an address for your place")
        else if (city.length < 1) newErrors.push("Please enter a city for your place")
        else if (state.length < 2) newErrors.push("Please enter a state for your place")
        else if (country.length < 3) newErrors.push("Please enter a country for your place")
        else {
          for (let spot of spots) {
            if (spot.address === address && spot.city === city && spot.state === state && spot.country === country) {
              errors.address.push("Address already exists")
              break;
            }
          }
        }
        break;
      }
      case (3): {
        setMessage("How much would a night cost?")
        const regexMoney = /(?=.*?\d)^\$?(([1-9]\d{0,2}(,\d{3})*)|\d+)?(\.\d{1,2})?$/;
        if (!price) newErrors.push("Please enter a price")
        else if (!String(price).match(regexMoney)) errors.price.push('Price format is incorrect.')
        else if (!price || Number(price) < 20) newErrors.push("Min price is $20 a night")
        else if (Number(price) > 100000) newErrors.push("Max price is $1,000,000 a night")
        break;
      }
      case (4): {
        setMessage("What's your spot like?")
        if (description.length < 1) newErrors.push("Please enter a price")
        else if (description.length < 20) errors.description.push('Min description length is 20 characters')
        else if (description.length > 400) errors.description.push('Max description length is 400 characters')
        break;
      }
      case (5): {
        setMessage("Let's us see your spot!")
        if (images.length < 5) errors.images.push("Please add more images")
        break;
      }
      default:
        setPage(0)
        break;
    }

    if (
      !newErrors.length &&
      !errors.name.length &&
      !errors.address.length &&
      !errors.price.length &&
      !errors.description.length &&
      !errors.images.length) setIsDisabled(false)
    else setIsDisabled(true)

    setNameErrors(errors.name)
    setAddressErrors(errors.address)
    setPriceErrors(errors.price)
    setDescriptionErrors(errors.description)
  }, [page, name, address, city, state, country, price, description, images.length])


  if (sessionUser === null) {
    alert("must be logged in to create a spot")
    return <Redirect to="/" />
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setHasSubmitted(true)
    if (errors.length > 0) {
      return
    }
    const newSpot = {
      name,
      address,
      city,
      state,
      country,
      lat: 1,
      lng: 1,
      price,
      description,
      images
    }
    setIsSubmitting(true)
    const response = await dispatch(createNewSpot(newSpot))
    history.push('/')
    // setErrors(newErrors.errors)
  }

  // const updateFiles = (e) => {
  //   const files = e.target.files;
  //   setImages(files);
  // };


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

  const removePreviewImage = (imageToRemove, idx) => {
    console.log(idx)
    const newPreviewImages = [...previewImages]
    newPreviewImages.splice(idx, 1)
    const newImages = [...images]
    newImages.splice(idx, 1)
    setPreviewImages(newPreviewImages)
    setImages(newImages)
  }

  return (
    <div className="host-page-container">
      <div className="host-page-left-conatiner">
        <h1 className="welcome-message">{message}</h1>
      </div>
      {!isSubmitting ? <div className="host-page-right-container">
        <div className="create-errors-container">
          {hasSubmitted && errors.length > 0 && (
            <ul className="errors-list">
              {errors.map(error => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className="new-spot-form"
        >
          <div className="create-spot-input-wrapper">
            {page === 0 && <div onClick={() => {
              setPage((prev) => prev + 1)
            }} className="page zero-container">
              <img src={plus} alt="" />
              <span>Host a new spot!</span>
            </div>}
            {page === 1 && <div className="page one-container">
              {nameErrors.length > 0 && <div className="page-errors">
                {nameErrors.map(error => (
                  <p key={error}>{error}</p>
                ))}
              </div>}
              <h2>Please name your spot:</h2>
              <input
                type="text"
                placeholder="Name of Spot"
                className="multi-page-input create-spot"
                maxLength='50'
                minLength='1'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>}
            {page === 2 && <div className="page two-container">
              {addressErrors.length > 0 && <div className="page-errors">
                {addressErrors.map(error => (
                  <p key={error}>{error}</p>
                ))}
              </div>}
              <h2>Please list an address:</h2>
              <input
                type="text"
                placeholder="Address"
                className="multi-page-input create-spot"
                maxLength='50'
                minLength='1'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="City"
                className="multi-page-input create-spot"
                maxLength='20'
                minLength='1'
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <div className="select-fields">
                <select
                  className="multi-page-input create-spot select"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                >
                  <>
                    <option disabled value="">Please select a state</option>
                    {states.map(state => (
                      <option key={state.name} value={state.abbreviation}>{state.name}</option>
                    ))}
                  </>
                </select>
                <select
                  placeholder="Country"
                  className="multi-page-input create-spot select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                >
                  <>
                    <option disabled value="">Please select a Country</option>
                    {countryList.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </>
                </select>
              </div>
            </div>}
            {/* <input
              type="number"
              placeholder="Latitude"
              className="form-input none create"
              min='-90'
              max='90'
              step="0.01"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              required
            /> */}
            {/* <input
              type="number"
              placeholder="Logitude"
              className="form-input none create"
              min='-180'
              max='180'
              step="0.01"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              required
            /> */}
            {page === 3 && <div className="page six-container">
              {priceErrors.length > 0 && <div className="page-errors">
                {priceErrors.map(error => (
                  <p key={error}>{error}</p>
                ))}
              </div>}
              <h2>Please list price per night:</h2>
              <h5>Min $20 - Max $1,000,000 a night</h5>
              <div className="price-container">
                <span>$</span>
                <input
                  type="number"
                  className="multi-page-input create-spot price"
                  pattern="^\d+(?:\.\d{1,2})?$"
                  value={price}
                  min="0.00"
                  step="0.01"
                  placeholder="100.00"
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
            </div>}
            {page === 4 && <div className="page seven-container">
              <h2>Please write a description:</h2>
              <div className="description-container">
                <h5>Min length 20 characters</h5>
                <span>{description.length} / 400</span>
              </div>
              <textarea
                type="text"
                placeholder="Description"
                className="multi-page-input create-spot"
                onKeyDown={(e) => checkKeyDown(e)}
                maxLength='400'
                minLength='20'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>}
            {page === 5 && <div className="page eight-container">
              <div className="preview-images-container">
                {previewImages.length > 0 && previewImages.map((image, i) => (
                  <div key={i} className="current-preview-image">
                    <img className="preview image" src={image} />
                    <img onClick={(e) => removePreviewImage(image, i)} className='remove-preivew-img icon' src={exit} alt="" />
                  </div>
                ))}
              </div>
              <h2>Please add minimum 5 images:</h2>
              <input
                type="file"
                className="file-select create-spot"
                accept=".png,
                            .jpeg,
                            .jpg,
                            .gif,"
                onChange={handleFileEvent}
              />
            </div>}
            <div className="create-spot-buttons-container">
              {page < 5 && page > 0 && <button disabled={isDisabled} className='next-button' onClick={(e) => {
                e.preventDefault()
                setPage(currPage => currPage + 1)
              }}>Next</button>}
              {page === 5 && <button disabled={isDisabled} className='create submit-button' type='button' onClick={handleSubmit}>Host Spot</button>}
              {page > 0 && <button className='back-button' onClick={(e) => {
                e.preventDefault()
                setPage(currPage => currPage - 1)
              }}>Back</button>}
            </div>
          </div>
        </form>
      </div> : <div className="loading-animation-container">
        <LoadingAnimation />
      </div>}
    </div>
  )
}

export default NewSpotForm
