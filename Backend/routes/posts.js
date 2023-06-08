import express from "express";
import PostDao from "../data/PostDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import * as dotenv from "dotenv";
import {checkPermission} from "./token.js";

dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const debug = factory(import.meta.url);
const router = express.Router();
export const postDao = new PostDao(DB_URL);
const endpoint = "/posts";

// GET all by sending nothing in body
// Can send userId, tags, partial body texts in as parameters if you want to get by those
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { userId, body, tags } = req.query;
    let posts;
    if (tags) {
      const tags_array = tags.split(",");
      posts = await postDao.readAll({ userId, body, tags: tags_array });
    } else {
      posts = await postDao.readAll({ userId, body });
    }
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${posts.length} posts!`,
      data: posts,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// GET by sending id in as a parameter
// url format: http://localhost:3000/posts/id={id}
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const post = await postDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following post!`,
      data: post,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Create a post by sending info in body
// Necessary: userId, body,
// Optional: img, tags,
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { userId, img, body, tags } = req.body;
    const post = await postDao.create({ userId, img, body, tags });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following post!`,
      data: post,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Update a post by sending info in body and id in as parameter
// url format: http://localhost:3000/posts/{id}
// Body parameter options: num_likes
// Just include what you are going to update- no need to include empty strings for non-updated things
router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { img, num_likes } = req.body;
    const post = await postDao.update({ id, img, num_likes });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following post!`,
      data: post,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete a post by sending id in as parameter
// url format: http://localhost:3000/posts/{id}
router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const post = await postDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following post!`,
      data: post,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete all posts
router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    await postDao.deleteAll();
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted all posts!`,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
