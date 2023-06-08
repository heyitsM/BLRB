import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;
import CommentDao from "../../data/CommentDao.js";
import PostDao from "../../data/PostDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const commentDao = new CommentDao();
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
  const numComments = 10;
  let users;
  let posts;
  let comments;

  beforeAll(async () => {
    await prisma.$connect();
    // await postDao.deleteAll();
  });

  beforeEach(async () => {
    // await commentDao.deleteAll();
    // await postDao.deleteAll();
    // await userDao.deleteAll();

    users = [];
    posts = [];
    comments = [];
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

    // create comments
    for (let index = 0; index < numComments; index++) {
      // fields: userId, postId
      const userInd = index % numUsers;
      const postInd = index % numPosts;
      const userId = users[userInd].id;
      const postId = posts[postInd].id;
      const body = faker.lorem.sentence();
      const comment = await commentDao.create({
        userId,
        postId,
        body,
      });
      comments.push(comment);
    }
  });

  it("test create()", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const postInd = Math.floor(Math.random() * numPosts);
    const userId = users[userInd].id;
    const postId = posts[postInd].id;
    const body = faker.lorem.sentence();
    const _comment = await commentDao.create({
      userId,
      postId,
      body,
    });
    expect(_comment.userId).toBe(userId);
    expect(_comment.postId).toBe(postId);
    expect(_comment.body).toBe(body);
    expect(_comment.date_created).toBeDefined();
  });

  describe("test create() throws error", () => {
    it("valid uuid but non existant userId", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = "INVALID";
      const postId = posts[postInd].id;
      const body = faker.lorem.sentence();

      try {
        const _comment = await commentDao.create({
          userId,
          postId,
          body,
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
      const body = faker.lorem.sentence();

      try {
        const _comment = await commentDao.create({
          userId,
          postId,
          body,
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
      const body = faker.lorem.sentence();
      
      try {
        const _comment = await commentDao.create({
          userId,
          postId,
          body,
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
      const body = faker.lorem.sentence();
      
      try {
        const _comment = await commentDao.create({
          userId,
          postId,
          body,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non-string body", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = users[userInd].id;
      const postId = posts[postInd].id;
      const body = faker.datatype.number();

      try {
        const _comment = await commentDao.create({
          userId,
          postId,
          body,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

  });

  it("test read()", async () => {
    // fields: userId, postId, date_created
    const index = Math.floor(Math.random() * numPosts);
    const comment = comments[index];
    const _comment = await commentDao.read(comment.id);
    expect(_comment.userId).toBe(comment.userId);
    expect(_comment.postId).toBe(comment.postId);
    expect(_comment.body).toBe(comment.body);
    expect(_comment.date_created).toMatchObject(comment.date_created);
    expect(_comment.id).toBe(comment.id);
  });
  
  it("test read() given invalid ID", async () => {
    try {
      await commentDao.read("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await commentDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test readAll()", async () => {
    const comments = await commentDao.readAll({});
    expect(comments.length).toBe(numComments);
  });

  it("test readAll() given userId", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const userId = users[userInd].id;
    const _comments = await commentDao.readAll({ userId });
    expect(_comments.length).toBe(2);
  });

  it("test readAll() given postId", async () => {
    const postInd = Math.floor(Math.random() * numPosts);
    const postId = posts[postInd].id;
    const _comments = await commentDao.readAll({ postId });
    expect(_comments.length).toBeGreaterThanOrEqual(2);
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numComments);
    const comment = comments[index];
    const _comment = await commentDao.delete(comment.id);

    expect(_comment.userId).toBe(comment.userId);
    expect(_comment.postId).toBe(comment.postId);
    expect(_comment.body).toBe(comment.body);
    expect(_comment.date_created).toMatchObject(comment.date_created);
    expect(_comment.id).toBe(comment.id);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await commentDao.delete("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await commentDao.delete(valid_id);
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