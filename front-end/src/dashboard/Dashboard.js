import React from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { previous, today, next } from "../utils/date-time";
import { useHistory } from "react-router-dom";
import ReservationData from "./ReservationData";
import TableData from "./TableData";

// Dashboard function
function Dashboard({
  date,
  reservations,
  reservationsError,
  tables,
  tablesError,
  loadDashboard,
}) {
  const history = useHistory();
  // JSX render
  const reservationsRender = () => {
    return reservations.map((reservation, index) => (
      <ReservationData
        key={index}
        reservation={reservation}
        loadDashboard={loadDashboard}
      />
    ));
  };

  // JSX render
  const tablesRender = () => {
    return tables.map((table, index) => (
      <TableData key={index} table={table} loadDashboard={loadDashboard} />
    ));
  };

  // JSX render
  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      {/* error alert */}
      <ErrorAlert error={reservationsError} />

      {/* table */}
      <table className="table">
        <thead className="thead-light">
          <tr>
            <th scope="col">First Name</th>
            <th scope="col">Last Name</th>
            <th scope="col">Mobile Number</th>
            <th scope="col">Reservation Time</th>
          </tr>
        </thead>
        <tbody>{reservationsRender()}</tbody>
      </table>

      <h4 className="mb-0">Tables</h4>
      {/* error alert */}
      <ErrorAlert error={tablesError} />

      {/* table */}
      <table className="table">
        <thead className="thead-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Table Name</th>
            <th scope="col">Capacity</th>
            <th scope="col">Status</th>
            <th scope="col">Finish</th>
          </tr>
        </thead>
        <tbody>{tablesRender()}</tbody>
      </table>

      {/* button */}
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => history.push(`/dashboard?date=${previous(date)}`)}
      >
        Previous
        {/* button */}
      </button>
      <button
        className="btn btn-primary"
        type="button"
        onClick={() => history.push(`/dashboard?date=${today()}`)}
      >
        Today
      </button>
      {/* button */}
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => history.push(`/dashboard?date=${next(date)}`)}
      >
        Next
      </button>
    </main>
  );
}

export default Dashboard;
