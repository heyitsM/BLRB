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

const endpoint = "/posts";
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
  let users;
  let posts;
  let tokens;

  beforeAll(async () => {
    // await postDao.deleteAll();
  });

  beforeEach(async () => {
    await postDao.deleteAll();
    await userDao.deleteAll();
    users = [];
    posts = [];
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
      tokens.push(token);
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
  });

  describe("GET request", () => {
    it("Respond 200", async () => {
      const response = await request.get(endpoint).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(numPosts);
    });

    it("Respond 200 searching for given userId", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request.get(`${endpoint}?userId=${user.id}`).set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("Respond 200 searching for given pattial body", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const body = posts[index].body;
      const partial_body = body.slice(0, body.length - 2);
      const response = await request.get(`${endpoint}?body=${partial_body}`).set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("Respond 200 searching for given tags", async () => {
      const tagInd1 = Math.floor(Math.random() * select_tags.length);
      const tagInd2 = Math.floor(Math.random() * select_tags.length);
      const test_tags = [select_tags[tagInd1], select_tags[tagInd2]];
      const response = await request.get(`${endpoint}?tags=${test_tags}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET request given ID", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const response = await request.get(`${endpoint}/${post.id}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.userId).toBe(post.userId);
      expect(response.body.data.img).toBe(post.img);
      expect(response.body.data.body).toBe(post.body);
      const response_date_created = new Date(response.body.data.date_created);
      expect(response_date_created).toMatchObject(post.date_created);
      expect(response.body.data.num_likes).toBe(post.num_likes);
      expect(response.body.data.tags).toMatchObject(post.tags);
      expect(response.body.data.id).toBe(post.id);
    });

    it("Respond 400 on invalid post ID", async () => {
      const response = await request.get(`${endpoint}/invalid}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing post ID", async () => {
      const response = await request.get(`${endpoint}/${faker.datatype.uuid()}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  
  describe("POST request", () => {
    it("Respond 201", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userId = users[userInd].id;
      const body = faker.lorem.sentence();
      const img = faker.image.imageUrl();
      const tags = select_tags;
      const response = await request.post(endpoint).send({
        userId,
        body,
        img,
        tags,
      }).set("Authorization", `Bearer ${tokens[userInd]}`);
      expect(response.status).toBe(201);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.body).toBe(body);
      expect(response.body.data.num_likes).toBe(0);
      expect(response.body.data.date_created).toBeDefined();
      expect(response.body.data.img).toBe(img);
      expect(response.body.data.tags).toMatchObject(tags);
      expect(response.body.data.id).toBeDefined();
    });

    describe("Respond 400", () => {
      it("missing body", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userId = users[userInd].id;
        const body = "";
        const img = faker.image.imageUrl();
        const tags = select_tags;
        const response = await request.post(endpoint).send({
          userId,
          body,
          img,
          tags,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);;
        expect(response.status).toBe(400);
      });
  
      it("non string img", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userId = users[userInd].id;
        const body = faker.lorem.sentence();
        const img = faker.datatype.number();
        const tags = select_tags;
        const response = await request.post(endpoint).send({
          userId,
          body,
          img,
          tags,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(400);
      });
  
      it("non array tags", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userId = users[userInd].id;
        const body = faker.lorem.sentence();
        const img = faker.image.imageUrl();
        const tags = faker.lorem.sentence();
        const response = await request.post(endpoint).send({
          userId,
          body,
          img,
          tags,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("invalid userId", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userId = faker.datatype.uuid();
        const body = faker.lorem.sentence();
        const img = faker.image.imageUrl();
        const tags = select_tags;
        const response = await request.post(endpoint).send({
          userId,
          body,
          img,
          tags,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(404);
      });
    });
  });

  describe("PUT request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const num_likes = faker.datatype.number({ min: 1 });
      
      const response = await request.put(`${endpoint}/${post.id}`).send({
        num_likes,
      }).set("Authorization", `Bearer ${tokens[index]}`);

      expect(response.status).toBe(200);
      // ensure all others stay the same
      expect(response.body.data.userId).toBe(post.userId);
      expect(response.body.data.img).toBe(post.img);
      expect(response.body.data.body).toBe(post.body);
      const response_date_created = new Date(response.body.data.date_created);
      expect(response_date_created).toMatchObject(post.date_created);
      expect(response.body.data.tags).toMatchObject(post.tags);
      expect(response.body.data.id).toBe(post.id);
      // changes made to:
      expect(response.body.data.num_likes).toBe(num_likes);
    });

    describe("Respond 400", () => {  
      it("negative likes", async () => {
        const index = Math.floor(Math.random() * numPosts);
        const post = posts[index];
        const num_likes = faker.datatype.number({ min: 0 }) * -1;
        const response = await request.put(`${endpoint}/${post.id}`).send({
          num_likes,
        }).set("Authorization", `Bearer ${tokens[index]}`);
  
        expect(response.status).toBe(400);
      });

      it("non int likes", async () => {
        const index = Math.floor(Math.random() * numPosts);
        const post = posts[index];
        const num_likes = faker.datatype.float({ min: 0 });
        const response = await request.put(`${endpoint}/${post.id}`).send({
          num_likes,
        }).set("Authorization", `Bearer ${tokens[index]}`);
  
        expect(response.status).toBe(400);
      });
  
      it("non number likes", async () => {
        const index = Math.floor(Math.random() * numPosts);
        const post = posts[index];
        const num_likes = "INVALID";
        const response = await request.put(`${endpoint}/${post.id}`).send({
          num_likes,
        }).set("Authorization", `Bearer ${tokens[index]}`);
  
        expect(response.status).toBe(400);
      });

      it("non string img", async () => {
        const index = Math.floor(Math.random() * numPosts);
        const post = posts[index];
        const img = faker.datatype.number();
        const response = await request.put(`${endpoint}/${post.id}`).send({
          img,
        }).set("Authorization", `Bearer ${tokens[index]}`);
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("test invalid id", async () => {
        const id = faker.datatype.uuid();
        const num_likes = faker.datatype.number({ min: 0 });
        const response = await request.put(`${endpoint}/${id}`).send({
          num_likes,
        }).set("Authorization", `Bearer ${tokens[0]}`);
  
        expect(response.status).toBe(404);
      });
    });
  });

  describe("DELETE request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const response = await request.delete(`${endpoint}/${post.id}`).set("Authorization", `Bearer ${tokens[index]}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.userId).toBe(post.userId);
      expect(response.body.data.img).toBe(post.img);
      expect(response.body.data.body).toBe(post.body);
      const response_date_created = new Date(response.body.data.date_created);
      expect(response_date_created).toMatchObject(post.date_created);
      expect(response.body.data.num_likes).toBe(post.num_likes);
      expect(response.body.data.tags).toMatchObject(post.tags);
      expect(response.body.data.id).toBe(post.id);
    });

    it("Respond 400 on invalid post ID", async () => {
      const response = await request
        .delete(`${endpoint}/invalid}`)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing post ID", async () => {
      const response = await request
        .delete(`${endpoint}/${faker.datatype.uuid()}`)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    // await postDao.deleteAll();
    // await userDao.deleteAll();
  });
});