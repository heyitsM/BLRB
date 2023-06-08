import express from "express";
import UserDao from "../data/UserDao.js";
import { factory } from "../util/debug.js";
import {UserRole} from "../util/UserRole.js";
import ApiError from "../util/ApiError.js";
import { createToken, checkPermission } from "./token.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const userDao = new UserDao();
const endpoint = "/users";

// GET all by sending nothing in body
// Can send username, email, and role in as parameters if you want to get by those
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { username, email, role } = req.body;
    const users = await userDao.readAll({ username, email, role });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${users.length} users!`,
      data: users, //users.map((user) => hidePassword(user)),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.post(`${endpoint}/search`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { username, email, role } = req.body;
    const users = await userDao.readAll({ username, email, role });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${users.length} users!`,
      data: users, //users.map((user) => hidePassword(user)),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// GET by sending id in as a parameter
// url format: http://localhost:3000/users/id={id}
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const user = await userDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following user!`,
      data: user,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Create a user by sending info in body
// Necessary: first_name, last_name, username, email, password
// Optional: role
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { first_name, last_name, username, email, password, role } = req.body;
    const user = await userDao.create({ first_name, last_name, username, email, password, role });
    const token = createToken({user:user.id, role:"NONADMIN"});
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following user!`,
      data: user,
      token: token,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Update a user by sending info in body and id in as parameter
// url format: http://localhost:3000/users/{id}
// Body parameter options: first_name, last_name, password, role
// Just include what you are going to update- no need to include empty strings for non-updated things
router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { first_name, last_name, password, role } = req.body;
    const user = await userDao.update({ id, first_name, last_name, password, role });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following user!`,
      data: user,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete a user by sending id in as parameter
// url format: http://localhost:3000/users/{id}
router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const user = await userDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following user!`,
      data: user,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete all users
router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    await userDao.deleteAll();
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted all users!`,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});



export default router;
