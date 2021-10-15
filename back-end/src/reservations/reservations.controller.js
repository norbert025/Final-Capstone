const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service.js");

//DateValidaion
async function DateValidaion(request, response, next) {
  const valid = request.body.data;
  if (!valid) {
    const message = "Body must include a data object";
    // returns 400 status with msg
    return next({ status: 400, message });
  }
  return next();
}

//BodyValidation
async function BodyValidation(request, response, next) {
  const required = [
    "first_name",
    "last_name",
    "mobile_number",
    "reservation_date",
    "reservation_time",
    "people",
  ];

  required.forEach((require) => {
    const hasProp = request.body.data.hasOwnProperty(require);
    const noProp = request.body.data[require] === "";
    if (!hasProp || noProp) {
      const message = `Field required: '${require}'`;
      // returns 400 status with msg
      return next({ status: 400, message });
    }
  });

  if (
    Number.isNaN(
      Date.parse(
        `${request.body.data.reservation_date} ${request.body.data.reservation_time}`
      )
    )
  ) {
    const message =
      "'reservation_date' or 'reservation_time' field is in an incorrect format";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  const people = request.body.data.people;
  const status = request.body.data.status;

  // returns 400 status with msg
  if (typeof people !== "number") {
    const message = "'people' field must be a number";
    return next({ status: 400, message });
  }

  if (people < 1) {
    const message = "'people' field must be at least one";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (status && status !== "booked") {
    const message = `'status' field cannot be ${request.body.data.status}`;
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  next();
}

//validateDate
async function validateDate(request, response, next) {
  const dayReserved = new Date(
    `${request.body.data.reservation_date}T${request.body.data.reservation_time}:00.000`
  );
  const today = new Date();

  if (dayReserved.getDay() === 2) {
    const message = "'reservation_date' field: restaurant is closed on Tuesday";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (dayReserved < today) {
    const message =
      "'reservation_date' and 'reservation_time' must be in the future";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (
    dayReserved.getHours() < 10 ||
    (dayReserved.getHours() === 10 && dayReserved.getMinutes() < 30)
  ) {
    const message =
      "'reservation_time' field: restaurant is not open until 10:30AM";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (
    dayReserved.getHours() > 22 ||
    (dayReserved.getHours() === 22 && dayReserved.getMinutes() > 30)
  ) {
    const message =
      "'reservation_time' field: restaurant is closed after 10:30PM";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (
    dayReserved.getHours() > 21 ||
    (dayReserved.getHours() === 21 && dayReserved.getMinutes() > 30)
  ) {
    const message =
      "'reservation_time' field: reservation must be made at least one hour before closing";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  return next();
}

//ReservationValidation
async function ReservationValidation(request, response, next) {
  const reservation_id = request.params.reservation_id;
  const data = await service.read(Number(reservation_id));

  if (!data) {
    const message = `reservation_id ${reservation_id} does not exist`;
    // returns 404 status with msg
    return next({
      status: 404,
      message,
    });
  }

  response.locals.reservation = data;

  return next();
}

//UpdateBodyValidation
async function UpdateBodyValidation(request, response, next) {
  const valid = request.body.data.status;
  if (!valid) {
    const message = "Body must include a 'status' field";
    // returns 400 status with msg
    return next({ status: 400, message });
  }

  if (
    valid !== "booked" &&
    valid !== "seated" &&
    valid !== "finished" &&
    valid !== "cancelled"
  ) {
    const message = `'status' field cannot be ${valid}`;
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (response.locals.reservation.status === "finished") {
    const message = "A finished reservation cannot be updated";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  return next();
}

//list CRUD operation
async function list(request, response) {
  const date = request.query.date;
  const mobile_number = request.query.mobile_number;

  const data = await service.list(date, mobile_number);

  const filtered = data.filter((data) => data.status !== "finished");

  response.json({ data: filtered });
}

//create CRUD operation
async function create(request, response) {
  const reqData = request.body.data;
  request.body.data.status = "booked";
  const data = await service.create(reqData);
  response.status(201).json({ data });
}

//update CRUD operation
async function update(request, response) {
  const id = response.locals.reservation.reservation_id;
  const status = request.body.data.status;
  await service.update(id, status);

  response.status(200).json({ data: { status } });
}

//edit
async function edit(request, response) {
  const id = response.locals.reservation.reservation_id;
  const idData = request.body.data;
  const data = await service.edit(id, idData);

  response.status(200).json({ data });
}

//read CRUD operation
async function read(request, response) {
  const data = response.locals.reservation;
  response.status(200).json({ data });
}

module.exports = {
  read: [asyncErrorBoundary(ReservationValidation), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(DateValidaion),
    asyncErrorBoundary(ReservationValidation),
    asyncErrorBoundary(UpdateBodyValidation),
    asyncErrorBoundary(update),
  ],
  list: [asyncErrorBoundary(list)],
  create: [
    asyncErrorBoundary(DateValidaion),
    asyncErrorBoundary(BodyValidation),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(create),
  ],
  edit: [
    asyncErrorBoundary(DateValidaion),
    asyncErrorBoundary(ReservationValidation),
    asyncErrorBoundary(BodyValidation),
    asyncErrorBoundary(validateDate),
    asyncErrorBoundary(edit),
  ],
};
