const knex = require("../db/connection");

const tableName = "tables";
const tableName2 = "reservations";

// update CRUD operation
function taken(table_id, reservation_id) {
  return knex(tableName)
    .where({ table_id })
    .update({ reservation_id, status: "occupied" });
}

// list CRUD operation
function list() {
  return knex(tableName).select("*").orderBy("table_name", "asc");
}

// create CRUD operation
function create(table) {
  return knex(tableName)
    .insert(table)
    .returning("*")
    .then((data) => data[0]);
}

// read CRUD operation
function read(table_id) {
  return knex(tableName).select().where({ table_id: table_id }).first();
}

// read CRUD operation
function readId(reservation_id) {
  return knex(tableName2)
    .select()
    .where({ reservation_id: reservation_id })
    .first();
}

// update CRUD operation
function free(table_id) {
  return knex(tableName)
    .where({ table_id: table_id })
    .update({ reservation_id: null, status: "free" });
}

// update CRUD operation
function IdUpdate(reservation_id, status) {
  return knex(tableName2).where({ reservation_id }).update({ status: status });
}

module.exports = {
  readId,
  taken,
  free,
  IdUpdate,
  list,
  create,
  read,
};
