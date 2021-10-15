const knex = require("../db/connection");

// tableName
const tableName = "reservations";

//update CRUD operation
function update(reservation_id, status) {
  return knex(tableName).where({ reservation_id }).update({ status });
}

//read CRUD operation
function read(reservation_id) {
  return knex(tableName)
    .select()
    .where({ reservation_id: reservation_id })
    .first();
}

//create CRUD operation
function create(reservation) {
  return knex(tableName)
    .insert(reservation)
    .returning("*")
    .then((data) => data[0]);
}

// update CRUD operation
function edit(reservation_id, reservation) {
  return knex(tableName)
    .where({ reservation_id: reservation_id })
    .update({ ...reservation })
    .returning("*")
    .then((data) => data[0]);
}

//list CRUD operation
function list(date, mobile_number) {
  if (date) {
    return knex(tableName)
      .select()
      .where({ reservation_date: date })
      .orderBy("reservation_time", "asc");
  }
  //if mobile_number exists
  if (mobile_number) {
    return knex(tableName)
      .select()
      .where("mobile_number", "like", `${mobile_number}%`);
  }
  return knex(tableName).select("*");
}

module.exports = {
  read,
  update,
  edit,
  list,
  create,
};
