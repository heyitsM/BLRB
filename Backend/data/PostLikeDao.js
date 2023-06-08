import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import UserDao from "./UserDao.js";
import PostDao from "./PostDao.js";

dotenv.config();
// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);
const userDao = new UserDao();
const postDao = new PostDao();

const validUuid = z.string().uuid("Invalid uuid!");

class PostLikeDao {
  // return the created postLike
  // throws ApiError when userId, or postId is invalid
  async create({ userId, postId }) {
    let result;
    debug("Validating the user id..");
    result = validUuid.safeParse(userId);
    if (!result.success) {
      throw new ApiError(400, "Invalid user ID!");
    }
    try {
      await userDao.read(userId);
    } catch (err) {
      throw new ApiError(404, "User resource not found!");
    }

    debug("Validating the post id..");
    result = validUuid.safeParse(postId);
    if (!result.success) {
      throw new ApiError(400, "Invalid post ID!");
    }
    try {
      await postDao.read(postId);
    } catch (err) {
      throw new ApiError(404, "Post resource not found!");
    }

    debug("Creating the postLike document..");

    const postLike = await prisma.postLike.create({
      data: { userId, postId },
    });
    return postLike;
  }

  // return all postLikes
  async readAll({ userId, postId }) {
    let filter = {};
    if (userId) {
      filter.userId = userId;
    }
    if (postId) {
      filter.postId = postId;
    }

    debug("Reading all postLike documents..");
    const postLikes = await prisma.postLike.findMany({
      where: filter,
    });

    return postLikes;
  }

  // return the postLike with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the postLike id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the postLike document..");
    const postLike = await prisma.postLike.findUnique({
      where: {
        id: id,
      },
    });
    if (!postLike) {
      throw new ApiError(404, "Resource not found!");
    }

    return postLike;
  }

  // a postLike cannot be updated, only created, read, and deleted

  // return the deleted postLike
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the postLike id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid PostLike ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "PostLike resource not found!");
    }

    debug("Deleting the postLike document..");
    const postLike = await prisma.postLike.delete({
      where: {
        id: id,
      },
    });
    if (!postLike) {
      throw new ApiError(404, "PostLike resource not found!");
    }

    return postLike;
  }

  async deleteAll() {
    debug("Deleting all postLike documents..");
    await prisma.postLike.deleteMany({});
  }
}

export default PostLikeDao;
