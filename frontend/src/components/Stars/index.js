import { useEffect, useState } from 'react'
import emptyStar from '../Navigation/images/emptyStar.svg'
import fullStar from '../Navigation/images/fullStar.svg'
import './Stars.css'

const Stars = ({ starRating, setStarRating }) => {
  const [starsArr, setStarsArr] = useState(["empty", "empty", "empty", "empty", "empty"])
  const [style, setStyle] = useState({})
  useEffect(() => {
    let newStarsArr = []
    for (let i = 0; i < 5; i++) {
      if (starRating < i + 1) {
        newStarsArr.push("empty")
      } else {
        newStarsArr.push("full")
      }
    }
    setStarsArr(newStarsArr)
  }, [starRating])
  return (
    <div className='star-container'>
      {starsArr.map((star, idx) => (
        <img onClick={() => setStarRating(idx + 1)} className={`star-${star}`} key={idx} src={star === "empty" ? emptyStar : fullStar} alt="star-icon" />
      ))}
    </div>
  )
}

export default Stars
