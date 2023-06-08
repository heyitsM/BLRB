import express from "express";
import CommissionDao from "../data/CommissionDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import * as dotenv from "dotenv";
import {checkPermission} from "./token.js";

dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const debug = factory(import.meta.url);
const router = express.Router();
export const commissionDao = new CommissionDao(DB_URL);
const endpoint = "/commissions";

// GET all by sending nothing in body
// Can send artist_id, commissioner_id in as parameters if you want to get by those
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { artist_id, commissioner_id, status } = req.query;
    const commissions = await commissionDao.readAll({ artist_id, commissioner_id, status });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${commissions.length} commissions!`,
      data: commissions,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// GET by sending id in as a parameter
// url format: http://localhost:3000/commissions/id={id}
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const commission = await commissionDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following commission!`,
      data: commission,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Create a commission by sending info in body
// Necessary: artist_id, commissioner_id, title, description
// Optional: notes, price
// Notes: status is default "REQUESTED"
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { artist_id, commissioner_id, title, description, notes, price } = req.body;
    const commission = await commissionDao.create({ artist_id, commissioner_id, title, description, notes, price });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following commission!`,
      data: commission,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Update a commission by sending info in body and id in as parameter
// url format: http://localhost:3000/commissions/{id}
// Body parameter options: price, status
// Just include what you are going to update- no need to include empty strings for non-updated things
router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { price, status } = req.body;
    const commission = await commissionDao.update({ id, price, status });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following commission!`,
      data: commission,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete a commission by sending id in as parameter
// url format: http://localhost:3000/commissions/{id}
router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const commission = await commissionDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following commission!`,
      data: commission,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete all commissions
router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    await commissionDao.deleteAll();
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted all commissions!`,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
