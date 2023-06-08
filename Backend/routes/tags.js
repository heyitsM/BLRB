import express from "express";
import TagDao from "../data/TagDao.js";
import { factory } from "../util/debug.js";
import {UserRole} from "../util/UserRole.js";
import ApiError from "../util/ApiError.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const tagDao = new TagDao();
const endpoint = "/tags";

router.get(`${endpoint}`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    const { info } = req.query;
    const tags = await tagDao.readAll({ tag_info:info });

    if (tags.length !== 0) {
      for (let i =0; i<tags.length; i++) {
        tags[i] = tags[i]["tag_info"];
      }
    } else {
      tags = []
    }

    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${tags.length} tags!`,
      data: tags, //users.map((user) => hidePassword(user)),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.get(`${endpoint}/:id`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const tags = await tagDao.read(id);
    const tag = tags[0];
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following tag!`,
      data: tag,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.post(`${endpoint}`, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { tag_info, profile_id, portfolio_item_id } = req.body;
    const tag = await tagDao.create({ tag_info, profile_id, portfolio_item_id });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following tag!`,
      data: tag, // hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// tags are read-only
// router.put(`${endpoint}/:id`, async (req, res, next) => {
//   debug(`${req.method} ${req.path} called...`);
//   try {
//     const { id } = req.params;
//     const { tag_info, profile_id, portfolio_item_id } = req.body;
//     const tag = await tagDao.update({ tag_id: id, tag_info, profile_id, portfolio_item_id });
//     debug(`Preparing the response payload...`);
//     res.json({
//       status: 200,
//       message: `Successfully updated the following tag!`,
//       data: tag,
//     });
//     debug(`Done with ${req.method} ${req.path}`);
//   } catch (err) {
//     debug(`There was an error processing ${req.method} ${req.path} `);
//     next(err);
//   }
// });

// router.delete(`${endpoint}/:id`, async (req, res, next) => {
//   debug(`${req.method} ${req.path} called...`);
//   try {
//     debug(`Read ID received as request parameter...`);
//     const { id } = req.params;
//     const tag = await tagDao.delete(id);
//     debug(`Preparing the response payload...`);
//     res.json({
//       status: 200,
//       message: `Successfully deleted the following tag!`,
//       data: tag,
//     });
//     debug(`Done with ${req.method} ${req.path} `);
//   } catch (err) {
//     debug(`There was an error processing ${req.method} ${req.path} `);
//     next(err);
//   }
// });

export default router;