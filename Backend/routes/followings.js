import express from "express";
import FollowingDao from "../data/FollowingDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import * as dotenv from "dotenv";
import {checkPermission} from "./token.js";

dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const debug = factory(import.meta.url);
const router = express.Router();
export const followingDao = new FollowingDao(DB_URL);
const endpoint = "/followings";

// GET all by sending nothing in body
// Can send follower_id and blrbo_id in as query parameters if you want to get by those
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { follower_id, blrbo_id } = req.query;
    const followings = await followingDao.readAll({ follower_id, blrbo_id });

    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${followings.length} followings!`,
      data: followings,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// GET by sending id in as a parameter
// url format: http://localhost:3000/followings/id={id}
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const following = await followingDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following following!`,
      data: following,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Create a following by sending info in body
// Necessary: follower_id, blrbo_id,
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { follower_id, blrbo_id, body } = req.body;
    const following = await followingDao.create({ follower_id, blrbo_id, body });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following following!`,
      data: following,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Followings cannot be Updated

// delete a following by sending id in as parameter
// url format: http://localhost:3000/followings/{id}
router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const following = await followingDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following following!`,
      data: following,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete all followings
router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    await followingDao.deleteAll();
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted all followings!`,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
