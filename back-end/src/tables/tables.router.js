const methodNotAllowed = require("../errors/methodNotAllowed");
const router = require("express").Router();
const controller = require("./tables.controller");

// "/:table_id/seat"
router
  .route("/:table_id/seat")
  .delete(controller.destroy)
  .put(controller.update)
  .all(methodNotAllowed);

// "/"
router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
