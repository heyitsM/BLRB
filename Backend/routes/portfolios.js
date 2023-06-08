import express from "express";
import PortfolioDao from "../data/PortfolioDao.js";
import { factory } from "../util/debug.js";
import {UserRole} from "../util/UserRole.js";
import ApiError from "../util/ApiError.js";
import {checkPermission} from "./token.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const portfolioDao = new PortfolioDao();
const endpoint = "/portfolios";

router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);

  try {
    const { userId } = req.query;
    const portfolios = await portfolioDao.readAll({ userId });
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved ${portfolios.length} users!`,
      data: portfolios, //users.map((user) => hidePassword(user)),
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
    const portfolio = await portfolioDao.read(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully retrieved the following portfolio!`,
      data: portfolio,
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
    const { userId } = req.body;
    const portfolio = await portfolioDao.create({ userId });
    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following portfolio!`,
      data: portfolio, // hidePassword(user),
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// portfolios are read-only
// router.put(`${endpoint}/:id`, async (req, res, next) => {
//   debug(`${req.method} ${req.path} called...`);
//   try {
//     const { id } = req.params;
//     const { items } = req.body;
//     const portfolio = await portfolioDao.update({ userId: id, items });
//     debug(`Preparing the response payload...`);
//     res.json({
//       status: 200,
//       message: `Successfully updated the following portfolio!`,
//       data: portfolio,
//     });
//     debug(`Done with ${req.method} ${req.path}`);
//   } catch (err) {
//     debug(`There was an error processing ${req.method} ${req.path} `);
//     next(err);
//   }
// });

router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    debug(`Read ID received as request parameter...`);
    const { id } = req.params;
    const portfolio = await portfolioDao.delete(id);
    debug(`Preparing the response payload...`);
    res.json({
      status: 200,
      message: `Successfully deleted the following portfolio!`,
      data: portfolio,
    });
    debug(`Done with ${req.method} ${req.path} `);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

export default router;