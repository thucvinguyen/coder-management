const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  unassignTask,
} = require("../controllers/task.controllers.js");

/**
 * @route GET api/task
 * @description Get a list of tasks
 * @allowedQueries: name
 */

router.get("/", getAllTasks);

/**
 * @route GET api/task
 * @description Get a task by its id
 * @allowedQueries: id
 */
router.get("/:id", getTaskById);

/**
 * @route POST api/task
 * @description Create a new task
 * @allowedQueries: name
 */
const validateTask = () => {
  return [
    body("name", "Task name cannot empty").notEmpty(),
    body("description", "Task description cannot empty").notEmpty(),
  ];
};

router.post("/", validateTask(), createTask);

/**
 * @route DELETE api/task
 * @description delete a task
 * @allowedQueries: id
 */
const validateId = () => {
  return param("id", "Invalid task ID").notEmpty().isMongoId();
};

router.delete("/:id", validateId(), deleteTask);

/**
 * @route PUT api/task
 * @description assign a task
 * @allowedQueries: name of user, id of task
 */
const validateAssign = () => {
  return [
    param("userName", "Invalid user name").notEmpty().isString(),
    param("taskId", "Invalid task ID").notEmpty().isMongoId(),
  ];
};

router.put("/assign/:userName/:taskId", validateAssign(), assignTask);

/**
 * @route PUT api/task
 * @description unassign a task
 * @allowedQueries: name of user, id of task
 */
const validateUnassign = () => {
  return [
    param("userName", "Invalid user name").notEmpty().isString(),
    param("taskId", "Invalid task ID").notEmpty().isMongoId(),
  ];
};

router.put("/unassign/:userName/:taskId", validateUnassign(), unassignTask);

/**
 * @route PUT api/task
 * @description update a task
 * @allowedQueries: status
 */
const validateStatus = () => {
  return [
    param("id", "Invalid task ID").notEmpty().isMongoId(),
    body("status", "Status cannot be empty").notEmpty(),
  ];
};

router.put("/:id", validateStatus(), updateTask);

module.exports = router;
