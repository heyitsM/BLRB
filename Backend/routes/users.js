import express from "express";
import User from "../data/objects/User.js";
import UserDao from "../data/daos/UserDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";

const debug = factory(import.meta.url);
const router = express.Router();
const endpoint = "/users";
export const userDAO = new UserDao();

router.post(`${endpoint}`, async (req, res, next) => {
    try {
      const { email, firstName, lastName, username, password } = req.body;
      const user = new User({email, firstName, lastName, username, password});
      await userDAO.add(user)
      const resp = user.to_json()
      res.status(201).json({
        status: 201,
        message: `Successfully created the following user!`,
        data: resp
      });
      debug(`Done with ${req.method} ${req.path}`);
    } catch (err) {
      debug(`There was an error processing ${req.method} ${req.path} `);
      next(err);
    }
});

router.get(`${endpoint}/union`, async (req, res, next) => {
  try {
    const { emails, usernames, firstNames, lastNames, roles } = req.query;
    
    if (!Array.isArray(emails)) {
      emails = [emails];
    }
    if (!Array.isArray(usernames)) {
      usernames = [usernames];
    }
    if (!Array.isArray(firstNames)) {
      firstNames = [firstNames];
    }
    if (!Array.isArray(lastNames)) {
      lastNames = [lastNames];
    }
    if (!Array.isArray(roles)) {
      roles = [roles];
    }

    const resp = await userDAO.getAllUnion({emails, usernames, firstNames, lastNames, roles});

    res.status(200).json({
      status: 200,
      message: `Successfully found the following user(s)!`,
      data: resp
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.get(`${endpoint}/intersection`, async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, role } = req.query;
    
    if (Array.isArray(username)) {
      throw new ApiError(400, 'May only include one username for this route');
    } else if (Array.isArray(firstName)) {
      throw new ApiError(400, 'May only include one firstName for this route');
    } else if (Array.isArray(role)) {
      throw new ApiError(400, 'May only include one role for this route');
    } else if (Array.isArray(lastName)) {
      throw new ApiError(400, 'May only include one lastName for this route');
    } else if (Array.isArray(email)) {
      throw new ApiError(400, 'May only include one email');
    }

    const resp = await userDAO.getAllIntersect({username, email, firstName, lastName, role});


    res.status(200).json({
      status: 200,
      message: `Successfully found the following user(s)!`,
      data: resp,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

router.put(`${endpoint}/:id`, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role } = req.body;
    const user = await userDAO.getById(id);
    const resp = await userDAO.updateUser(user, {username, email, firstName, lastName, role});

    res.status(200).json({
      status: 200,
      message: `Successfully found the following user(s)!`,
      data: resp,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});


router.delete(`${endpoint}/:id`, async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userDAO.getById(id);
    const deleted = await userDAO.deleteUser(user);

    res.status(200).json({
      status: 200,
      message: `Successfully deleted the following user!`,
      data: deleted,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
})
export default router;