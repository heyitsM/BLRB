import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { createToken } from "../../routes/token.js";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import { userDao } from "../../routes/users.js";
import { postDao } from "../../routes/posts.js";
import app from "../../index.js";
import { postLikeDao } from "../../routes/postLikes.js";

const endpoint = "/postLikes";
const request = new supertest(app);

const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];
const select_tags = [
  "elementary",
  "realism",
  "watercolor",
  "digital",
  "video",
];

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  const numPosts = 5;
  const numPostLikes = 10;
  let users;
  let posts;
  let postLikes;
  let tokens;

  beforeAll(async () => {
    // await postDao.deleteAll();
  });

  beforeEach(async () => {
    // await postLikeDao.deleteAll();
    // await postDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    posts = [];
    postLikes = [];
    tokens = [];

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
      let token = createToken({user:user.id, role:"NONADMIN"});
      users.push(user);
      tokens.push(token);
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

  describe("GET request", () => {
    it("Respond 200", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(numPostLikes);
    });

    it("Respond 200 searching for given userId", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}?userId=${user.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("Respond 200 searching for given postId", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const response = await request
        .get(`${endpoint}?postId=${post.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET request given ID", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numPostLikes);
      const postLike = postLikes[index];
      const response = await request.get(`${endpoint}/${postLike.id}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.userId).toBe(postLike.userId);
      expect(response.body.data.postId).toBe(postLike.postId);
      const response_date_liked = new Date(response.body.data.date_liked);
      expect(response_date_liked).toMatchObject(postLike.date_liked);
      expect(response.body.data.id).toBe(postLike.id);
    });

    it("Respond 400 on invalid post ID", async () => {
      const response = await request.get(`${endpoint}/invalid}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing postLike ID", async () => {
      const response = await request.get(`${endpoint}/${faker.datatype.uuid()}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const postInd = Math.floor(Math.random() * numPosts);
      const userId = users[userInd].id;
      const postId = posts[postInd].id;

      const response = await request.post(endpoint).send({
        userId,
        postId,
      }).set("Authorization", `Bearer ${tokens[userInd]}`);
      expect(response.status).toBe(201);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.postId).toBe(postId);
      expect(response.body.data.date_liked).toBeDefined();
      expect(response.body.data.id).toBeDefined();
    });

    describe("Respond 400", () => {
      it("invalid userId body", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const postInd = Math.floor(Math.random() * numPosts);
        const userId = "INVALID";
        const postId = posts[postInd].id;

        const response = await request.post(endpoint).send({
          userId,
          postId,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(400);
      });

      it("invalid postId body", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const postInd = Math.floor(Math.random() * numPosts);
        const userId = users[userInd].id;
        const postId = "INVALID";

        const response = await request.post(endpoint).send({
          userId,
          postId,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("invalid userId", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const postInd = Math.floor(Math.random() * numPosts);
        const userId = faker.datatype.uuid();
        const postId = posts[postInd].id;

        const response = await request.post(endpoint).send({
          userId,
          postId,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(404);
      });

      it("invalid postId", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const postInd = Math.floor(Math.random() * numPosts);
        const userId = users[userInd].id;
        const postId = faker.datatype.uuid();

        const response = await request.post(endpoint).send({
          userId,
          postId,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(404);
      });
    });
  });

  describe("DELETE request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numPostLikes);
      const postLike = postLikes[index];
      const tokenIndex = index % numUsers;
      const response = await request.delete(`${endpoint}/${postLike.id}`).set("Authorization", `Bearer ${tokens[tokenIndex]}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.userId).toBe(postLike.userId);
      expect(response.body.data.postId).toBe(postLike.postId);
      const response_date_liked = new Date(response.body.data.date_liked);
      expect(response_date_liked).toMatchObject(postLike.date_liked);
      expect(response.body.data.id).toBe(postLike.id);
    });

    it("Respond 400 on invalid postLike ID", async () => {
      const response = await request
        .delete(`${endpoint}/invalid}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing postLike ID", async () => {
      const response = await request
        .delete(`${endpoint}/${faker.datatype.uuid()}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    // await postLikeDao.deleteAll();
    // await postDao.deleteAll();
    // await userDao.deleteAll();
  });
});