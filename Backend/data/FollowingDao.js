import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import UserDao from "./UserDao.js";

dotenv.config();
// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);
const userDao = new UserDao();

const validUuid = z.string().uuid("Invalid uuid!");

class FollowingDao {
  // return the created following
  // throws ApiError when follower_id, or blrbo_id is invalid
  async create({ follower_id, blrbo_id }) {
    let result;
    debug("Validating the follower id..");
    result = validUuid.safeParse(follower_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid follower id ID!");
    }
    try {
      await userDao.read(follower_id);
    } catch (err) {
      throw new ApiError(404, "Follower User resource not found!");
    }

    debug("Validating the blrbo id..");
    result = validUuid.safeParse(blrbo_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid blrbo id ID!");
    }
    try {
      await userDao.read(blrbo_id);
    } catch (err) {
      throw new ApiError(404, "Blrbo User resource not found!");
    }

    debug("Creating the following document..");

    const following = await prisma.following.create({
      data: { follower_id, blrbo_id },
    });
    return following;
  }

  // return all followings
  async readAll({ follower_id, blrbo_id }) {
    let filter = {};
    if (follower_id) {
      filter.follower_id = follower_id;
    }
    if (blrbo_id) {
      filter.blrbo_id = blrbo_id;
    }

    debug("Reading all following documents..");
    const followings = await prisma.following.findMany({
      where: filter,
    });

    return followings;
  }

  // return the following with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the following id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the following document..");
    const following = await prisma.following.findUnique({
      where: {
        id: id,
      },
    });
    if (!following) {
      throw new ApiError(404, "Resource not found!");
    }

    return following;
  }

  // a following cannot be updated, only created, read, and deleted

  // return the deleted following
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the following id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Following ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Following resource not found!");
    }

    debug("Deleting the following document..");
    const following = await prisma.following.delete({
      where: {
        id: id,
      },
    });
    if (!following) {
      throw new ApiError(404, "Following resource not found!");
    }

    return following;
  }

  async deleteAll() {
    debug("Deleting all following documents..");
    await prisma.following.deleteMany({});
  }
}

export default FollowingDao;
