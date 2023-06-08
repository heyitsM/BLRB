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
const validBody = z.string().min(1, "Missing body attribute!");

class CommentDao {
  // return the created comment
  // throws ApiError when userId, or postId is invalid
  async create({ userId, postId, body }) {
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


    debug("Validating the body..");
    result = validBody.safeParse(body);
    if (!result.success) {
      throw new ApiError(400, "Invalid body!");
    }

    debug("Creating the comment document..");

    const comment = await prisma.comment.create({
      data: { userId, postId, body }, // , User: {connect: { id: userId }}, Post: {connect: { id: postId }}
    });
    return comment;
  }

  // return all comments
  async readAll({ userId, postId }) {
    let filter = {};
    if (userId) {
      filter.userId = userId;
    }
    if (postId) {
      filter.postId = postId;
    }

    debug("Reading all comment documents..");
    const comments = await prisma.comment.findMany({
      where: filter,
    });

    return comments;
  }

  // return the comment with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the comment id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the comment document..");
    const comment = await prisma.comment.findUnique({
      where: {
        id: id,
      },
    });
    if (!comment) {
      throw new ApiError(404, "Resource not found!");
    }

    return comment;
  }

  // a comment cannot be updated, only created, read, and deleted

  // return the deleted comment
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the comment id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Comment ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Comment resource not found!");
    }

    debug("Deleting the comment document..");
    const comment = await prisma.comment.delete({
      where: {
        id: id,
      },
    });
    if (!comment) {
      throw new ApiError(404, "Comment resource not found!");
    }

    return comment;
  }

  async deleteAll() {
    debug("Deleting all comment documents..");
    await prisma.comment.deleteMany({});
  }
}

export default CommentDao;
