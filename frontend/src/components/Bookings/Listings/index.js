import "./Listing.css"

function Listing({ booking }) {
  console.log(booking)
  const { name, previewImage, city, state, price } = booking.Spot
  let { startDate, endDate } = booking
  startDate = new Date(startDate).toLocaleString().split(',')[0]
  endDate = new Date(endDate).toLocaleString().split(',')[0]
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);
  const Difference_In_Time = date2.getTime() - date1.getTime();
  const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
  const total = Difference_In_Days * price
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  return (
    <>
      <td><img className="listing-preivew-image" src={`${previewImage}`} /> {name}</td>
      <td>{city}, {state}</td>
      <td>{startDate} - {endDate}</td>
      <td>{formatter.format(total)}</td>
    </>
  )
}
export default Listing
