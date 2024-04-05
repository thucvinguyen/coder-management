const { sendResponse, AppError } = require("../helpers/utils");
const { validationResult } = require("express-validator");
const ObjectId = require("mongoose").Types.ObjectId;
const Task = require("../models/Task");
const User = require("../models/User");

const taskController = {};

// Create a new Task
taskController.createTask = async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const created = await Task.create({
        name: name,
        description: description,
      });
      sendResponse(
        res,
        200,
        true,
        { data: created },
        null,
        "Create Task Successfully"
      );
    } else {
      const errors = result.array();
      const errorsMsgs = errors.map((item) => item.msg);
      const errorMsgsText = errorsMsgs.join(", ");
      throw new AppError(400, `${errorMsgsText}`, "Create Task Error");
    }
  } catch (err) {
    next(err);
  }
};

// Get task by id
taskController.getTaskById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (ObjectId.isValid(id)) {
      if (String(new ObjectId(id)) === id) {
        const task = await Task.findOne({ _id: id }).populate("assignedTo");
        sendResponse(res, 200, true, task, null, "Get task successfully");
      } else {
        throw new AppError(400, "Invalid Id", "Get Task Error");
      }
    } else {
      throw new AppError(400, "Invalid Id", "Get Task Error");
    }
  } catch (error) {
    next(error);
  }
};

// Get all tasks
taskController.getAllTasks = async (req, res, next) => {
  const allowedQueries = ["name", "status", "createdAt", "updatedAt"];
  try {
    let tasks = [];
    const keys = Object.keys(req.query);
    if (keys.length !== 0) {
      keys.forEach((item) => {
        if (!allowedQueries.includes(item)) {
          throw new AppError(400, "Queries not allowed", "Get Task Error");
        }
      });
      const { name, status, createdAt, updatedAt } = req.query;
      const filter = {};
      if (name) filter.name = { $regex: name, $options: "i" };
      if (status) filter.status = status;

      const sort = {};
      if (createdAt) sort.createdAt = parseInt(createdAt);
      if (updatedAt) sort.updatedAt = parseInt(updatedAt);
      tasks = await Task.find(filter).sort(sort).populate("assignedTo");
    } else {
      tasks = await Task.find().populate("assignedTo");
    }

    sendResponse(res, 200, true, tasks, null, "Get tasks successfully");
  } catch (err) {
    next(err);
  }
};

// assign task
taskController.assignTask = async (req, res, next) => {
  try {
    const { userName, taskId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid Task ID", "Assign Task Error");
    }
    const user = await User.findOne({ name: userName });

    if (!user) {
      throw new AppError(404, "User not found", "Assign Task Error");
    }
    const taskUpdate = await Task.findOneAndUpdate(
      { _id: taskId },
      { $set: { assignedTo: user._id } },
      { new: true }
    );
    if (!taskUpdate) {
      throw new AppError(404, "Task not found", "Assign Task Error");
    }
    sendResponse(
      res,
      200,
      true,
      { taskUpdate },
      null,
      "Assign Task Successfully"
    );
  } catch (err) {
    next(err);
  }
};

// unassign task
taskController.unassignTask = async (req, res, next) => {
  try {
    const { userName, taskId } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid Task ID", "Assign Task Error");
    }
    const user = await User.findOne({ name: userName });

    if (!user) {
      throw new AppError(404, "User not found", "Unassign Task Error");
    }
    const taskUpdate = await Task.findOneAndUpdate(
      { _id: taskId },
      { $set: { assignedTo: null } },
      { new: true }
    );

    if (!taskUpdate) {
      throw new AppError(404, "Task not found", "Unassign Task Error");
    }
    sendResponse(
      res,
      200,
      true,
      { taskUpdate },
      null,
      "Unassign Task Successfully"
    );
  } catch (err) {
    next(err);
  }
};

// update task
taskController.updateTask = async (req, res, next) => {
  const { id } = req.params;
  const updateTaskInfo = req.body;

  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    if (!ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid Task ID", "Update Task Error");
    }
    const query = await Task.findById(id);
    if (!query) {
      throw new AppError(404, "Task not found", "Update Task Error");
    }
    if (query.status === "done" && updateTaskInfo.status !== "archive") {
      throw new AppError(
        400,
        "Can't update status of task set to done, except archive",
        "Update Task Error"
      );
    }
    const updatedTask = await Task.findByIdAndUpdate(id, updateTaskInfo, {
      new: true,
    });
    sendResponse(res, 200, true, updatedTask, null, "Update Task Successfully");
  } catch (err) {
    next(err);
  }
};

// delete task
taskController.deleteTask = async (req, res, next) => {
  const { id } = req.params;
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    if (!ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid Task ID", "Delete Task Error");
    }
    const query = await Task.findById(id);
    if (!query) {
      throw new AppError(404, "Task not found", "Delete Task Error");
    }
    if (query.status === "done") {
      throw new AppError(
        400,
        "Can't delete task set to done",
        "Delete Task Error"
      );
    }
    const deletedTask = await Task.findByIdAndUpdate(id, { isDeleted: true });
    sendResponse(res, 200, true, deletedTask, null, "Delete Task Successfully");
  } catch (err) {
    next(err);
  }
};

module.exports = taskController;
