import express from "express";
import CommentDao from "../data/CommentDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import * as dotenv from "dotenv";
import {checkPermission} from "./token.js";

dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const debug = factory(import.meta.url);
const router = express.Router();
export const commentDao = new CommentDao(DB_URL);
const endpoint = "/comments";

// GET all by sending nothing in body
// Can send userId and postId in as query parameters if you want to get by those
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { userId, postId } = req.query;
    const comments = await commentDao.readAll({ userId, postId });

    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${comments.length} comments!`,
      data: comments,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// GET by sending id in as a parameter
// url format: http://localhost:3000/comments/id={id}
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const comment = await commentDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following comment!`,
      data: comment,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Create a comment by sending info in body
// Necessary: userId, postId,
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { userId, postId, body } = req.body;
    const comment = await commentDao.create({ userId, postId, body });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following comment!`,
      data: comment,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Comments cannot be Updated

// delete a comment by sending id in as parameter
// url format: http://localhost:3000/comments/{id}
router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const comment = await commentDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following comment!`,
      data: comment,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete all comments
router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    await commentDao.deleteAll();
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted all comments!`,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
