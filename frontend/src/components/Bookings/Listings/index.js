import { useHistory } from "react-router-dom"
import "./Listing.css"

function Listing({ booking }) {
  const history = useHistory()
  const { name, previewImage, city, state, price } = booking.Spot
  let { id } = booking
  let start = new Date(booking.startDate)
  let end = new Date(booking.endDate)
  let startDate = new Date(start.getTime() + start.getTimezoneOffset() * 60000).toLocaleString().split(',')[0]
  let endDate = new Date(end.getTime() + end.getTimezoneOffset() * 60000).toLocaleString().split(',')[0]
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);
  const Difference_In_Time = date2.getTime() - date1.getTime();
  const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  const total = Difference_In_Days * price
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  const handleClick = (e) => {
    history.push(`/bookings/${id}`)
  }
  return (
    <>
      <td
        className="table-name one"
        style={{
          cursor: "pointer",
        }}
        onClick={handleClick}>
        <img className="listing-preivew-image table-name one" src={`${previewImage}`} />
        {`     ${name}`}
      </td>
      <td>{city}, {state}</td>
      <td>{startDate} - {endDate}</td>
      <td>{formatter.format(total)}</td>
    </>
  )
}
export default Listing
