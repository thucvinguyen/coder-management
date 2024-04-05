var express = require("express");
const { sendResponse } = require("../helpers/utils");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!");
});

router.get("/management/:test", async (req, res, next) => {
  const { test } = req.params;
  try {
    //turn on to test error handling
    if (test === "error") {
      throw new AppError(401, "Access denied", "Authentication Error");
    } else {
      sendResponse(
        res,
        200,
        true,
        { data: "management" },
        null,
        "management success"
      );
    }
  } catch (err) {
    next(err);
  }
});

const userRouter = require("./user.api.js");
router.use("/user", userRouter);

const taskRouter = require("./task.api.js");
router.use("/task", taskRouter);

module.exports = router;
