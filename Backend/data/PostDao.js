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

const validBody = z.string().min(1, "Missing body attribute!");
const validImgString = z.string().min(1, "Missing requried img attribute!");
const validNumLikes = z
  .number()
  .int({ message: "the number of likes must be an integer" })
  .nonnegative({
    message: "the number of likes must be greater than or equal to 0",
  });
const validUuid = z.string().uuid("Invalid uuid!");

class PostDao {
  // return the created post
  // throws ApiError when userId, img, body, or tags is invalid
  async create({ userId, img, body, tags }) {
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

    debug("Validating the body..");
    result = validBody.safeParse(body);
    if (!result.success) {
      throw new ApiError(400, "Invalid body!");
    }

    debug("Validating the img..");
    if (img) {
      result = validImgString.safeParse(img);
      if (!result.success) {
        throw new ApiError(400, "Invalid img!");
      }
    }

    debug("Validating the tags...");
    if (tags !== undefined) {
      let success = Array.isArray(tags);
      if (!success) {
        throw new ApiError(400, "Invalid Tags list!");
      }
    } else {
      tags = [];
    }

    debug("Creating the post document..");


    const post = await prisma.post.create({
      data: {userId, img, body, tags}
    });
    return post;
  }

  // return all posts
  // throws ApiError if status is not REQUESTED, PENDING, REJECTED, ACCEPTED, PAID, COMPLETED (or the lowercase versions)
  async readAll({ userId, body, tags }) {
    let filter = {};
    if (userId) {
      filter.userId = userId;
    }

    
    if (body !== undefined) {
      debug("Validating the body..");
      let result = validBody.safeParse(body);
      filter.body = { contains: body }
    }

    if (tags !== undefined) {
      debug("Validating the tags...");
      let success = Array.isArray(tags);
      if (!success) {
        throw new ApiError(400, "Invalid Tags list!");
      }
      filter.tags = { hasSome: tags };
    }

    debug("Reading all post documents..");
    const posts = await prisma.post.findMany({
      where: filter,
    });

    return posts;
  }

  // return the post with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the post id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the post document..");
    const post = await prisma.post.findUnique({
      where: {
        id: id,
      },
    });
    if (!post) {
      throw new ApiError(404, "Resource not found!");
    }

    return post;
  }

  // return the updated post
  // throws ApiError if params are invalid or resource does not exist in our database
  async update({ id, img, num_likes }) {
    debug("Validating the post id...");
    let result;
    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!");
    }

    if (num_likes !== undefined) {
      debug("Validating the num_likes..");
      result = validNumLikes.safeParse(num_likes);
      if (!result.success) {
        throw new ApiError(400, "Invalid num_likes!");
      }
    }

    if (img) {
      debug("Validating the img..");
      result = validImgString.safeParse(img);
      if (!result.success) {
        throw new ApiError(400, "Invalid img!");
      }
    }

    debug("Updating the post document..");
    const post = await prisma.post.update({
      where: {
        id: id,
      },
      data: { img, num_likes },
    });

    if (!post) {
      throw new ApiError(404, "Resource not found!");
    }

    return post;
  }

  // return the deleted post
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the post id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Post ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Post resource not found!");
    }

    debug("Deleting the post document..");
    const post = await prisma.post.delete({
      where: {
        id: id,
      },
    });
    if (!post) {
      throw new ApiError(404, "Post resource not found!");
    }

    return post;
  }

  async deleteAll() {
    debug("Deleting all post documents..");
    await prisma.post.deleteMany({});
  }
}

export default PostDao;
