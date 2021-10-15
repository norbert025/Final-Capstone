const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./tables.service");

async function DateValidaion(request, response, next) {
  const valid = request.body.data;
  if (!valid) {
    const message = "Body must include a data object";
    return next({ status: 400, message });
  }

  next();
}
// validation for body
async function BodyValidation(request, response, next) {
  const name = request.body.data.table_name;
  const capacity = request.body.data.capacity;
  if (!name || name === "") {
    const message = "'table_name' field cannot be empty";
    // returns 400 status with msg
    return next({ status: 400, message });
  }

  if (name.length < 2) {
    const message = "'table_name' field must be at least two characters";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (!capacity || capacity === "") {
    const message = "'capacity' field cannot be empty";
    // returns 400 status with msg
    return next({ status: 400, message });
  }

  if (typeof capacity !== "number") {
    const message = "'capacity' field must be a number";
    // returns 400 status with msg
    return next({ status: 400, message });
  }

  if (capacity < 1) {
    const message = "'capacity' field must be at least one";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  return next();
}
// reservation validation
async function ReservationValidation(request, response, next) {
  const { reservation_id } = request.body.data;

  if (!reservation_id) {
    const message = "'reservation_id' field must be included in the body";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }
  const reservation = await service.readId(Number(reservation_id));

  if (!reservation) {
    const message = `reservation_id ${reservation_id} does not exist`;
    // returns 400 status with msg
    return next({
      status: 404,
      message,
    });
  }

  response.locals.reservation = reservation;

  return next();
}

// validation for seats
async function seatValidation(request, response, next) {
  const capacity = response.locals.table.capacity;
  const status = response.locals.reservation.status;
  const people = response.locals.reservation.people;
  const tableStatus = response.locals.table.status;

  if (tableStatus === "occupied") {
    const message = "The table you selected is curently occupied";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (status === "seated") {
    const message = "The reservation you selected is already seated";
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  if (capacity < people) {
    const message = `The table you selected does not have enough capacity to seat ${response.locals.reservation.people} people`;
    // returns 400 status with msg
    return next({
      status: 400,
      message,
    });
  }

  return next();
}

// validation for seats
async function tableValidation(request, response, next) {
  const { table_id } = request.params;
  const data = await service.read(table_id);

  if (!data) {
    const message = `table_id ${table_id} does not exist`;
    // returns 404 status with msg
    return next({
      status: 404,
      message,
    });
  }

  response.locals.table = data;

  return next();
}

// validation for tables
async function tableValidations(request, response, next) {
  const status = response.locals.table.status;
  if (status !== "occupied") {
    const message = "This table is not occupied";
    // returns 400 status with msg
    return next({ status: 400, message });
  }

  return next();
}

// delete CRUD operation
async function destroy(request, response) {
  await service.IdUpdate(response.locals.table.reservation_id, "finished");
  await service.free(response.locals.table.table_id);

  response.status(200).json({ data: { status: "finished" } });
}

// list CRUD operation
async function list(request, response) {
  const data = await service.list();

  response.json({ data: data });
}

// update CRUD operation
async function update(request, response) {
  await service.taken(
    response.locals.table.table_id,
    response.locals.reservation.reservation_id
  );
  await service.IdUpdate(response.locals.reservation.reservation_id, "seated");

  response.status(200).json({ data: { status: "seated" } });
}

// create CRUD operation
async function create(request, response) {
  const reservation_id = request.body.data.reservation_id;
  const status = request.body.data.status;
  if (reservation_id) {
    status = "occupied";
    await service.IdUpdate(request.body.data.reservation_id, "seated");
  } else {
    request.body.data.status = "free";
  }

  const data = await service.create(request.body.data);

  response.status(201).json({ data });
}

module.exports = {
  destroy: [
    asyncErrorBoundary(tableValidation),
    asyncErrorBoundary(tableValidations),
    asyncErrorBoundary(destroy),
  ],
  update: [
    asyncErrorBoundary(DateValidaion),
    asyncErrorBoundary(tableValidation),
    asyncErrorBoundary(ReservationValidation),
    asyncErrorBoundary(seatValidation),
    asyncErrorBoundary(update),
  ],
  list: asyncErrorBoundary(list),
  create: [
    asyncErrorBoundary(DateValidaion),
    asyncErrorBoundary(BodyValidation),
    asyncErrorBoundary(create),
  ],
};
