import express from "express";
import PortfolioItemDao from "../data/PortfolioItemDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import {checkPermission} from "./token.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const portfolioItemDao = new PortfolioItemDao();
const endpoint = "/portfolioItems";

router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    const { userId, title, description, img, tags } = req.query;
    const portfolioItems = await portfolioItemDao.readAll({ userId, title, description, img, tags });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${portfolioItems.length} users!`,
      data: portfolioItems,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const portfolioItem = await portfolioItemDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following portfolio!`,
      data: portfolioItem,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { userId, title, description, img, tags } = req.body;
    const portfolioItem = await portfolioItemDao.create({ userId, title, description, img, tags });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following portfolio!`,
      data: portfolioItem, // hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { id } = req.params;
    const { title, description, img, tags } = req.body;
    const portfolioItem = await portfolioItemDao.update({ id, title, description, img, tags });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully updated the following portfolio!`,
      data: portfolioItem,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const portfolioItem = await portfolioItemDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following portfolio!`,
      data: portfolioItem,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;