import React from "react";
import { Link } from "react-router-dom";
import { IdUpdateStatus } from "../utils/api";

// reservation data for tables
function ReservationData({ reservation, loadDashboard }) {
  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservation;
  if (!reservation || status === "finished") return null;

  // handeler for cancel buttton
  const handeler = () => {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      // abort controller
      const abortController = new AbortController();

      IdUpdateStatus(reservation_id, "cancelled", abortController.status).then(
        loadDashboard
      );

      // abort controller
      return () => abortController.abort();
    }
  };

  return (
    // Table rows
    <tr>
      <th scope="row">{reservation_id}</th>
      <td>{first_name}</td>
      <td>{last_name}</td>
      <td>{mobile_number}</td>
      <td>{reservation_date}</td>
      <td>{reservation_time}</td>
      <td>{people}</td>
      {/* conditional rendering */}
      {status === "booked" && (
        <>
          <td>
            <Link to={`/reservations/${reservation_id}/edit`}>
              <button className="btn btn-secondary" type="button">
                Edit
              </button>
            </Link>
          </td>
          <td>
            <button
              className="btn btn-danger"
              type="button"
              onClick={handeler}
              data-reservation-id-cancel={reservation_id}
            >
              Cancel
            </button>
          </td>
          <td>
            <Link to={`/reservations/${reservation_id}/seat`}>
              <button className="btn btn-primary" type="button">
                Seat
              </button>
            </Link>
          </td>
        </>
      )}
    </tr>
  );
}

export default ReservationData;
