import React, { useState } from "react";
import { listReservations } from "../utils/api";
import ReservationData from "../dashboard/ReservationData";
import ErrorAlert from "../layout/ErrorAlert";

// search function
function Search() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState(null);

  // event handler for on click
  const eventHandler = ({ target }) => {
    setMobileNumber(target.value);
  };

  // submit handeler for on click
  const submithandeler = (event) => {
    event.preventDefault();

    // abort controller
    const abortController = new AbortController();

    setError(null);

    listReservations({ mobile_number: mobileNumber }, abortController.signal)
      .then(setReservations)
      .catch(setError);
    // abort controller
    return () => abortController.abort();
  };

  // JSX render
  const searchRender = () => {
    return reservations.length > 0 ? (
      reservations.map((reservation, index) => (
        <ReservationData key={index} reservation={reservation} />
      ))
    ) : (
      <tr>
        <td>No reservations found</td>
      </tr>
    );
  };

  // JSX render
  return (
    <div>
      <form onSubmit={submithandeler}>
        <ErrorAlert error={error} />
        <label htmlFor="mobile_number">Enter a customer's phone number:</label>
        <input
          name="mobile_number"
          id="mobile_number"
          type="tel"
          onChange={eventHandler}
          value={mobileNumber}
          required
        />
        <button className="btn btn-primary" type="submit">
          Find
        </button>
      </form>
      <table className="table">
        <thead>
          {/* Table */}
          <tr>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Date</th>
            <th scope="col">Time</th>
            <th scope="col">People</th>
            <th scope="col">Status</th>
            <th scope="col">Edit</th>
            <th scope="col">Cancel</th>
            <th scope="col">Seat</th>
          </tr>
        </thead>
        <tbody>{searchRender()}</tbody>
      </table>
    </div>
  );
}

export default Search;
