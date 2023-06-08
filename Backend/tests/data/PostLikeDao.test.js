import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import PostLikeDao from "../../data/PostLikeDao.js";
import PostDao from "../../data/PostDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const postLikeDao = new PostLikeDao();
const postDao = new PostDao();
const userDao = new UserDao();
const select_tags = [
  "elementary",
  "realism",
  "watercolor",
  "digital",
  "video",
];
// const roles = ["RECRUITER", "PROFESSIONALY", "FOR_FUN"];
const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];

describe("Test PostDao", () => {
  const numUsers = 5;
  const numPosts = 5;
  const numPostLikes = 10;
  let users;
  let posts;
  let postLikes;

  beforeAll(async () => {
    await prisma.$connect();
    // await postDao.deleteAll();
  });

  beforeEach(async () => {
    // await postLikeDao.deleteAll();
    // await postDao.deleteAll();
    // await userDao.deleteAll();

    users = [];
    posts = [];
    postLikes = [];
    // create users
    for (let index = 0; index < numUsers; index++) {
      const first_name = faker.name.firstName();
      const last_name = faker.name.lastName();
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      let ind = Math.floor(Math.random() * roles.length);
      let role = roles[ind];
      const user = await userDao.create({
        first_name,
        last_name,
        username,
        email,
        password,
        role,
      });
      users.push(user);
    }
    // create posts
    for (let index = 0; index < numPosts; index++) {
      // fields: userId, img, body, tags
      const userInd = index % numUsers; // Math.floor(Math.random() * numUsers);
      const userId = users[userInd].id;
      const body = faker.lorem.sentence();
      const img = faker.lorem.sentence(6);
      const tags = [select_tags[index % select_tags.length]];
      const post = await postDao.create({
        userId,
        body,
        img,
        tags,
      });
      posts.push(post);
    }

    // create postLikes
    for (let index = 0; index < numPostLikes; index++) {
      // fields: userId, postId
      const userInd = index % numUsers;
      const postInd = index % numPosts;
      const userId = users[userInd].id;
      const postId = posts[postInd].id;
      const postLike = await postLikeDao.create({
        userId,
        postId,
      });
      postLikes.push(postLike);
    }
  });

  it("test create()", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const postInd = Math.floor(Math.random() * numPosts);
    const userId = users[userInd].id;
    const postId = posts[postInd].id;
    const _postLike = await postLikeDao.create({
      userId,
      postId,
    });
    expect(_postLike.userId).toBe(userId);
    expect(_postLike.postId).toBe(postId);
    expect(_postLike.date_liked).toBeDefined();
  });

  describe("test create() throws error", () => {
    it("valid uuid but non existant userId", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = "INVALID";
      const postId = posts[postInd].id;
      
      try {
        const _postLike = await postLikeDao.create({
          userId,
          postId,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("invalid userId", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = faker.datatype.uuid();
      const postId = posts[postInd].id;
      
      try {
        const _postLike = await postLikeDao.create({
          userId,
          postId,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("valid uuid but non existant postId", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = users[userInd].id;
      const postId = faker.datatype.uuid();
      
      try {
        const _postLike = await postLikeDao.create({
          userId,
          postId,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("invalid postId", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = users[userInd].id;
      const postId = "INVALID";
      
      try {
        const _postLike = await postLikeDao.create({
          userId,
          postId,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

  });

  it("test read()", async () => {
    // fields: userId, postId, date_liked
    const index = Math.floor(Math.random() * numPosts);
    const postLike = postLikes[index];
    const _postLike = await postLikeDao.read(postLike.id);
    expect(_postLike.userId).toBe(postLike.userId);
    expect(_postLike.postId).toBe(postLike.postId);
    expect(_postLike.date_liked).toMatchObject(postLike.date_liked);
    expect(_postLike.id).toBe(postLike.id);
  });
  
  it("test read() given invalid ID", async () => {
    try {
      await postLikeDao.read("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await postLikeDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test readAll()", async () => {
    const posts = await postLikeDao.readAll({});
    expect(posts.length).toBeGreaterThanOrEqual(numPostLikes);
  });

  it("test readAll() given userId", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const userId = users[userInd].id;
    const _postLikes = await postLikeDao.readAll({ userId });
    expect(_postLikes.length).toBeGreaterThanOrEqual(2);
  });

  it("test readAll() given postId", async () => {
    const postInd = Math.floor(Math.random() * numPosts);
    const postId = posts[postInd].id;
    const _postLikes = await postLikeDao.readAll({ postId });
    expect(_postLikes.length).toBeGreaterThanOrEqual(2);
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numPostLikes);
    const postLike = postLikes[index];
    const _postLikeLike = await postLikeDao.delete(postLike.id);

    expect(_postLikeLike.userId).toBe(postLike.userId);
    expect(_postLikeLike.postId).toBe(postLike.postId);
    expect(_postLikeLike.date_liked).toMatchObject(postLike.date_liked);
    expect(_postLikeLike.id).toBe(postLike.id);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await postLikeDao.delete("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await postLikeDao.delete(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  afterAll(async () => {
    // await postDao.deleteAll();
    // await userDao.deleteAll();
    await prisma.$disconnect();
  });
});