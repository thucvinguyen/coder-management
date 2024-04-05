const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const {
  createUser,
  getAllUsers,
  getUserByName,
  assignResponsible,
} = require("../controllers/user.controllers.js");

/** Get all users
 * @route GET api/user
 * @description Get a list of users
 * @allowedQueries: name
 */
router.get("/", getAllUsers);

/** Get single user by Name
 * @route GET api/user/:name
 * @description Get user by name
 */
const validateUserName = () => {
  return [
    param("name", "Username cannot empty").notEmpty(),
    param("name", "Username must be Alphabet").matches(/^[A-Za-z\s]+$/),
  ];
};

router.get("/:name", validateUserName(), getUserByName);

/** Create a new user with manager access
 * @route POST api/users
 * @description Create a new user
 * @requiredBody: name
 */

const validateUser = () => {
  return [
    body("name", "Username cannot empty").notEmpty(),
    body("name", "Username must be Alphabet").matches(/^[A-Za-z\s]+$/),
  ];
};

router.post("/", validateUser(), createUser);

// get tasks by target userid:
const validateTask = () => {
  return [
    param("userName", "Invalid user name").notEmpty().isString(),
    param("taskId", "Invalid task ID").notEmpty().isMongoId(),
  ];
};

router.put("/assign/:userName/:taskId", validateTask(), assignResponsible);

module.exports = router;
