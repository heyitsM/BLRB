import express from "express";
import ProfessionalArtistInfoDao from "../data/ProfessionalArtistInfoDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import * as dotenv from "dotenv";
import {checkPermission} from "./token.js";

dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const debug = factory(import.meta.url);
const router = express.Router();
export const professionalArtistInfoDao = new ProfessionalArtistInfoDao();
const endpoint = "/professionalArtistInfos";

// GET all by sending nothing in body
// Can send commission_rules, accepting_commissions, stripeAccountID in as query parameters if you want to get by those
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { commission_rules, accepting_commissions, stripeAccountID, pdf_link } = req.query;
    let accept = accepting_commissions === "true" ? true : accepting_commissions;
    if (accept !== true) {
      accept = accepting_commissions === "false" ? false : accepting_commissions;
    }
    const professionalArtistInfos = await professionalArtistInfoDao.readAll({ commission_rules, accepting_commissions: accept, stripeAccountID, pdf_link });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${professionalArtistInfos.length} professionalArtistInfos!`,
      data: professionalArtistInfos,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// GET by sending id in as a parameter
// url format: http://localhost:3000/professionalArtistInfos/id={id}
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const professionalArtistInfo = await professionalArtistInfoDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following professionalArtistInfo!`,
      data: professionalArtistInfo,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Create a professionalArtistInfo by sending info in body
// Necessary: id, stripeAccountID
// Optional: commission_rules, accepting_commissions
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id, commission_rules, accepting_commissions, stripeAccountID, pdf_link } = req.body;
    let accept = accepting_commissions === "true" ? true : accepting_commissions;
    if (accept !== true) {
      accept = accepting_commissions === "false" ? false : accepting_commissions;
    }
    const professionalArtistInfo = await professionalArtistInfoDao.create({ id, commission_rules, accepting_commissions: accept, stripeAccountID, pdf_link });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following professionalArtistInfo!`,
      data: professionalArtistInfo,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// Update a professionalArtistInfo by sending info in body and id in as parameter
// url format: http://localhost:3000/professionalArtistInfos/{id}
// Body parameter options: commission_rules, accepting_commissions
// Just include what you are going to update- no need to include empty strings for non-updated things
router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { commission_rules, accepting_commissions, pdf_link } = req.body;
    const professionalArtistInfo = await professionalArtistInfoDao.update({ id, commission_rules, accepting_commissions, pdf_link });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following professionalArtistInfo!`,
      data: professionalArtistInfo,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete a professionalArtistInfo by sending id in as parameter
// url format: http://localhost:3000/professionalArtistInfos/{id}
router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const professionalArtistInfo = await professionalArtistInfoDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following professionalArtistInfo!`,
      data: professionalArtistInfo,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// delete all professionalArtistInfos
router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    await professionalArtistInfoDao.deleteAll();
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted all professionalArtistInfos!`,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;
