import express from "express";
import ProfileDao from "../data/ProfileDao.js";
import UserDao from "../data/UserDao.js";
import { factory } from "../util/debug.js";
import {UserRole} from "../util/UserRole.js";
import ApiError from "../util/ApiError.js";
import {checkPermission} from "./token.js";

const debug = factory(import.meta.url);
const router = express.Router();
export const profileDAO = new ProfileDao();
export const userDAO = new UserDao();
const endpoint = "/profiles";

// url format: http://localhost:3000/search/users/?tags=tag1&tags=tag2&tags=tag3
// then tags = ["tag1", "tag2", "tag3"]
router.get(`${endpoint}/search`, checkPermission, async (req, res, next) => {
  try {
    let { partial, tags } = req.query;
    if (tags && typeof tags === "string") {
      tags = [tags];
    }

    const profiles = await profileDAO.search({ partial, tags });

    for (let i = 0; i < profiles.length; i++) {
      let tags = profiles[i]["tags"];

      for (let k = 0; k < tags.length; k++) {
        tags[k] = tags[k]["tag_info"];
      }
      profiles[i]["tags"] = tags;
    }

    res.send({
      status: 200,
      message: `Found ${profiles.length} profiles with the following: ${tags !== undefined ? "tags: [" + tags + "]" : "" }${tags !== undefined && partial !== undefined ? " and " : ""}${partial !== undefined ? "partial username/display name " + partial : ""}`,
      data: profiles,
    });
  } catch (err) {
    next(err);
  }
});

// create user
// send in display_name, bio, img, and tags
// MUST send in display_name, bio
router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
  debug(`${req.method} ${req.path} called...`);
  try {
    const { user_id, display_name, bio, img, tags} = req.body;
    let use_display_name = false;

    if (display_name) {
      use_display_name = true;
    }

    const profile = await profileDAO.create({ user_id, display_name, bio, use_display_name, img, tags });

    let returned_tags = profile["tags"];

    for (let i = 0; i < returned_tags.length; i++) {
      returned_tags[i] = returned_tags[i]["tag_info"];
    }

    profile["tags"] = returned_tags;

    debug(`Preparing the response payload...`);
    res.status(201).json({
      status: 201,
      message: `Successfully created the following profile!`,
      data: profile,
    });
    debug(`Done with ${req.method} ${req.path}`);
  } catch (err) {
    debug(`There was an error processing ${req.method} ${req.path} `);
    next(err);
  }
});

// send in userid, delete that profile
// url format: http://localhost:3000/profiles/{userid}
router.delete(`${endpoint}/:userid`, checkPermission, async (req, res, next) => {
    try {
        const { userid } = req.params;
        const profile = await profileDAO.delete(userid);

        let returned_tags = profile["tags"];

        for (let i = 0; i < returned_tags.length; i++) {
          returned_tags[i] = returned_tags[i]["tag_info"];
        }

        profile["tags"] = returned_tags;

        debug(`Preparing the response payload...`);
        res.status(201).json({
          status: 201,
          message: `Successfully deleted the following profile!`,
          data: profile,
        });
        debug(`Done with ${req.method} ${req.path}`);
      } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
      }
});

// change display name, bio, use_display_name status, img, and add tags
// can also remove tags from the profile without deleting them here
// url format: http://localhost:3000/profiles/{id}
// Put the load in body: display_name, bio, use_display_name, img, tags, tag_connect
// important: tag_connect false means disconnect (remove tags), tag_connect true means connect (add tags)
router.put(`${endpoint}/:userid`, checkPermission, async (req, res, next) => {
    try {
        const { userid } = req.params;
        const { display_name, bio, use_display_name, img, tags, tag_connect } = req.body;
        const user = await userDAO.read(userid);
        const profile = await profileDAO.update({ user_id:userid, user, display_name, bio, use_display_name, img, tags, tag_connect });

        let returned_tags = profile["tags"];

        for (let i = 0; i < returned_tags.length; i++) {
          returned_tags[i] = returned_tags[i]["tag_info"];
        }

        profile["tags"] = returned_tags;

        debug(`Preparing the response payload...`);
        res.status(201).json({
          status: 201,
          message: `Successfully updated the following profile!`,
          data: profile,
        });
        debug(`Done with ${req.method} ${req.path}`);
      } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
      }
});

// send in user id, get the full profile w tags
// url format: http://localhost:3000/profiles/{id}
router.get(`${endpoint}/:userid`, checkPermission, async (req, res, next) => {
    try {
        let { userid } = req.params;
        //userid = userid.substring(7);
        const profile = await profileDAO.read({ user_id:userid });
        debug(`Preparing the response payload...`);

        if (profile) {
          let returned_tags = profile["tags"];

          if (returned_tags) {
            for (let i = 0; i < returned_tags.length; i++) {
              returned_tags[i] = returned_tags[i]["tag_info"];
            }
    
            profile["tags"] = returned_tags;
          }

        }
        
        res.status(200).json({
          status: 200,
          message: `Successfully retrieved the following profile!`,
          data: profile,
        });
        debug(`Done with ${req.method} ${req.path}`);
      } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
      }
    
});

// get a list of profiles given specific data either about the user or the profile
// profile data: display name, bio, use_display_name, tags_array is an array of strings
// TODO: change stuff to req.query- cannot do get body
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
    try {
        const { display_name, bio, use_display_name, tags_array, img } = req.body;
        const profiles = await profileDAO.readAll({ display_name, bio, use_display_name, tags_array, img });

        for (let i = 0; i < profiles.length; i++) {
          let tags = profiles[i]["tags"];
    
          for (let k = 0; k < tags.length; k++) {
            tags[k] = tags[k]["tag_info"];
          }
          profiles[i]["tags"] = tags;
        }

        debug(`Preparing the response payload...`);
        res.status(200).json({
          status: 200,
          message: `Successfully loaded the following profiles!`,
          data: profiles,
        });
        debug(`Done with ${req.method} ${req.path}`);
      } catch (err) {
        debug(`There was an error processing ${req.method} ${req.path} `);
        next(err);
      }
});

export default router;
