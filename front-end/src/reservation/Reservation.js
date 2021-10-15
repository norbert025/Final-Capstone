import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import {
  createReservation,
  editReservation,
  listReservations,
} from "../utils/api";

function Reservation({ loadDashboard, edit }) {
  const history = useHistory();
  const { reservation_id } = useParams();
  const [renderData, setrenderData] = useState({
    // useState default settings
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
  });
  const [reservation_Error, setreservation_Error] = useState(null);
  const [api_Error, setapi_Error] = useState(null);
  const [errors, setErrors] = useState([]);

  // useEffect api call
  useEffect(() => {
    if (edit) {
      if (!reservation_id) return null;

      loadReservations()
        .then((response) =>
          response.find(
            (reservation) =>
              reservation.reservation_id === Number(reservation_id)
          )
        )
        .then(addData);
    }

    function addData(ReservationExists) {
      const msg = <p>Only booked reservations can be edited.</p>;
      const {
        first_name,
        last_name,
        mobile_number,
        reservation_time,
        people,
        status,
      } = ReservationExists;
      if (!ReservationExists || status !== "booked") {
        return msg;
      }

      const date = new Date(ReservationExists.reservation_date);
      const dateString = `${date.getFullYear()}-${(
        "0" +
        (date.getMonth() + 1)
      ).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;

      setrenderData({
        first_name,
        last_name,
        mobile_number,
        reservation_date: dateString,
        reservation_time,
        people,
      });
    }

    async function loadReservations() {
      // abort controller
      const abortController = new AbortController();
      return await listReservations(null, abortController.signal).catch(
        setreservation_Error
      );
    }
  }, [edit, reservation_id]);

  // event handeler for on click
  const eventHandler = ({ target }) => {
    setrenderData({
      ...renderData,
      [target.name]:
        target.name === "people" ? Number(target.value) : target.value,
    });
  };

  // submit handeler
  const handleSubmit = (event) => {
    event.preventDefault();
    // abort controller
    const abortController = new AbortController();

    const found_Errors = [];

    if (validateFields(found_Errors) && validateDate(found_Errors)) {
      if (edit) {
        editReservation(reservation_id, renderData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${renderData.reservation_date}`)
          )
          .catch(setapi_Error);
      } else {
        createReservation(renderData, abortController.signal)
          .then(loadDashboard)
          .then(() =>
            history.push(`/dashboard?date=${renderData.reservation_date}`)
          )
          .catch(setapi_Error);
      }
    }
    setErrors(found_Errors);
    // abort controller
    return () => abortController.abort();
  };

  // validation function
  function validateFields(found_Errors) {
    for (const index in renderData) {
      if (renderData[index] === "") {
        found_Errors.push({
          message: `${index.split("_").join(" ")} cannot be left blank.`,
        });
      }
    }
    return found_Errors.length === 0;
  }

  // validation function
  function validateDate(found_Errors) {
    const dayReserved = new Date(
      `${renderData.reservation_date}T${renderData.reservation_time}:00.000`
    );
    const today = new Date();
    if (dayReserved.getDay() === 2) {
      const message =
        "Reservations cannot be made on a Tuesday (Restaurant is closed).";
      found_Errors.push({
        message,
      });
    }

    if (dayReserved < today) {
      const message = "Reservations cannot be made in the past.";
      found_Errors.push({
        message,
      });
    }

    if (
      dayReserved.getHours() < 10 ||
      (dayReserved.getHours() === 10 && dayReserved.getMinutes() < 30)
    ) {
      const message =
        "Reservation cannot be made: Restaurant is not open until 10:30AM.";
      found_Errors.push({
        message,
      });
    } else if (
      dayReserved.getHours() > 22 ||
      (dayReserved.getHours() === 22 && dayReserved.getMinutes() >= 30)
    ) {
      const message =
        "Reservation cannot be made: Restaurant is closed after 10:30PM.";
      found_Errors.push({
        message,
      });
    } else if (
      dayReserved.getHours() > 21 ||
      (dayReserved.getHours() === 21 && dayReserved.getMinutes() > 30)
    ) {
      const message =
        "Reservation cannot be made: Reservation must be made at least an hour before closing (10:30PM).";
      found_Errors.push({
        message,
      });
    }

    return found_Errors.length === 0;
  }
  const errorsRender = () => {
    return errors.map((error, index) => (
      <ErrorAlert key={index} error={error} />
    ));
  };

  //JSX render
  return (
    <form onSubmit={handleSubmit}>
      {errorsRender()}
      <ErrorAlert error={api_Error} />
      <ErrorAlert error={reservation_Error} />
      <div className="form-group">
        <label>
          First Name:
          <input
            type="text"
            name="first_name"
            onChange={eventHandler}
            required
          />
        </label>
      </div>
      <div className="LastName">
        <label>
          Last Name:
          <input
            type="text"
            name="last_name"
            onChange={eventHandler}
            required
          />
        </label>
      </div>
      <div className="MobileNumber">
        <label>
          Mobile Number:
          <input
            type="text"
            name="mobile_number"
            onChange={eventHandler}
            required
          />
        </label>
      </div>
      <div className="ReservationDate">
        <label>
          Date of Reservation:
          <input
            type="date"
            name="reservation_date"
            onChange={eventHandler}
            required
          />
        </label>
      </div>
      <div className="ReservationTime">
        <label>
          Time of reservation:
          <input
            type="time"
            name="reservation_time"
            onChange={eventHandler}
            required
          />
        </label>
      </div>
      <div className="People">
        <label>
          Number of People in Party:
          <input type="number" name="people" onChange={eventHandler} required />
        </label>
      </div>
      <div className="form-group"></div>
      <br />
      <button
        onClick={() => history.push("/")}
        type="button"
        className="btn btn-secondary"
      >
        Cancel
      </button>
      <button className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
}

export default Reservation;
