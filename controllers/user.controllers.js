const { default: mongoose } = require("mongoose");
const { sendResponse, AppError } = require("../helpers/utils.js");
const Task = require("../models/Task.js");
const User = require("../models/User.js");
const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;

const userController = {};

userController.getAllUsers = async (req, res, next) => {
  const { name, role } = req.query;
  const allowedQueries = ["name", "role"];
  let users = [];

  try {
    const keys = Object.keys(req.query);
    if (keys.length !== 0) {
      keys.forEach((item) => {
        if (!allowedQueries.includes(item)) {
          throw new AppError(400, "Queries not allowed");
        }
      });
      const filter = {};
      if (name) filter.name = name;
      if (role) filter.role = role;
      users = await User.find(filter).populate("taskResponsible");
    } else {
      users = await User.find().populate("taskResponsible");
    }
    sendResponse(res, 200, true, users, null, "Get users successfully");
  } catch (error) {
    next(error);
  }
};
userController.getUserByName = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name } = req.params;
  try {
    const users = await User.find({
      name: { $regex: new RegExp(`.*${name}.*`, "i") },
    }).populate("taskResponsible");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "Users not found" });
    }
    res.status(200).json({ users });
  } catch (err) {
    console.error("Error retrieving user by name:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

userController.createUser = async (req, res, next) => {
  const { name, role } = req.body;
  try {
    const existingUser = await User.findOne({ name: name });
    if (existingUser) {
      throw new AppError(
        400,
        "User with this name already exists",
        "Create User Error"
      );
    }
    const result = validationResult(req);
    if (result.isEmpty()) {
      const created = await User.create({ name: name, role: role });
      sendResponse(res, 200, true, { data: created }, null, "User created");
    } else {
      const errors = result.array();
      const errorMsgs = errors.map((item) => item.msg);
      const errorMsgsText = errorMsgs.join(", ");
      throw new AppError(400, `${errorMsgsText}`, "Create User Error");
    }
  } catch (err) {
    next(err);
  }
};

userController.getAssign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid Task ID", "Assign Task Error");
    }

    // const task = await Task.findById(id);
    // if (!task) {
    //   throw new AppError(404, "Task not found", "Assign Task Error");
    // }

    // const userUpdate = await User.findOneAndUpdate(
    //   { name: userName },
    //   { $addToSet: { taskResponsible: task._id } },
    //   { new: true }
    // );
    const userUpdate = await User.findOne({ _id: id }).populate(
      "taskResponsible"
    );

    if (!userUpdate) {
      throw new AppError(404, "User not found", "Assign Task Error");
    }

    res.status(200).json({
      success: true,
      message: "Assign Task Successfully",
      userUpdate: userUpdate,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = userController;
