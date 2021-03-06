const methodNotAllowed = require("../errors/methodNotAllowed");
const router = require("express").Router();
const controller = require("./reservations.controller");

// /:reservation_id/status
router
  .route("/:reservation_id/status")
  .put(controller.update)
  .all(methodNotAllowed);

// /:reservation_id
router
  .route("/:reservation_id")
  .put(controller.edit)
  .get(controller.read)
  .all(methodNotAllowed);

// /
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
