import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations, seatTable } from "../utils/api";

// Seats function
function Seats({ loadDashboard, tables }) {
  const history = useHistory();

  const [table_id, setTableId] = useState(0);
  const [reservations, setReservations] = useState([]);
  const [reservation_Error, setreservation_Error] = useState(null);
  const [errors, setErrors] = useState([]);
  const [api_Error, setapi_Error] = useState(null);

  const { reservation_id } = useParams();

  // useEffect for making api call
  useEffect(() => {
    // abort controller
    const abortController = new AbortController();

    setreservation_Error(null);

    listReservations(null, abortController.signal)
      .then(setReservations)
      .catch(setreservation_Error);

    return () => abortController.abort();
  }, []);

  if (!tables || !reservations) return null;

  // change handeler
  const handleChange = ({ target }) => setTableId(target.value);

  // on submit handeler
  const handleSubmit = (event) => {
    event.preventDefault();
    // abort controller
    const abortController = new AbortController();

    if (seatValidation()) {
      seatTable(reservation_id, table_id, abortController.signal)
        .then(loadDashboard)
        .then(() => history.push(`/dashboard`))
        .catch(setapi_Error);
    }

    // abort controller
    return () => abortController.abort();
  };

  const tableOptionsRender = () => {
    return tables.map((table, index) => (
      <option key={index} value={table.table_id}>
        {table.table_name} - {table.capacity}
      </option>
    ));
  };

  const errorsRender = () => {
    return errors.map((error, index) => (
      <ErrorAlert key={index} error={error} />
    ));
  };

  // validation function
  function seatValidation() {
    const found_Errors = [];

    const foundTable = tables.find(
      (table) => table.table_id === Number(table_id)
    );
    const ReservationExists = reservations.find(
      (reservation) => reservation.reservation_id === Number(reservation_id)
    );

    // if table found
    if (!foundTable) {
      const msg = "The table you selected does not exist.";
      found_Errors.push(msg);
      // if table not found
    }
    if (!ReservationExists) {
      const msg = "This reservation does not exist.";
      found_Errors.push(msg);
    } else {
      if (foundTable.status === "occupied") {
        const msg = "The table you selected is currently occupied";
        found_Errors.push(msg);
      }
      if (foundTable.capacity < ReservationExists.people) {
        const msg = `The table you selected cannot seat ${ReservationExists.people} people.`;
        found_Errors.push(msg);
      }
    }
    setErrors(found_Errors);

    return found_Errors.length === 0;
  }

  // JSX render
  return (
    <form className="form-select">
      {errorsRender()}
      <ErrorAlert error={api_Error} />
      <ErrorAlert error={reservation_Error} />

      <label className="form-label" htmlFor="table_id">
        Choose table:
      </label>
      <select
        className="form-control"
        name="table_id"
        id="table_id"
        value={table_id}
        onChange={handleChange}
      >
        <option value={0}>Choose A Table</option>
        {tableOptionsRender()}
      </select>
      <button className="btn btn-primary" type="submit" onClick={handleSubmit}>
        Submit
      </button>
      <button className="btn btn-danger" type="button" onClick={history.goBack}>
        Cancel
      </button>
    </form>
  );
}

export default Seats;
