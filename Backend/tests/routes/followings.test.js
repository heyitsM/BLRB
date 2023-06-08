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
import app from "../../index.js";
import { followingDao } from "../../routes/followings.js";

const endpoint = "/followings";
const request = new supertest(app);

const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  const numUsers2 = 5;
  const numFollowings = 10;
  let users;
  let users2;
  let followings;
  let tokens;

  beforeAll(async () => {
    // await userDao.deleteAll();
  });

  beforeEach(async () => {
    // await followingDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    users2 = [];
    followings = [];
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
    // create users2
    for (let index = 0; index < numUsers2; index++) {
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
      users2.push(user);
    }
    // create followings
    for (let index = 0; index < numFollowings; index++) {
      // fields: follower_id, blrbo_id
      const userInd = index % numUsers;
      const userInd2 = index % numUsers2;
      const follower_id = users[userInd].id;
      const blrbo_id = users2[userInd2].id;
      const following = await followingDao.create({
        follower_id,
        blrbo_id,
      });
      followings.push(following);
    }
  });

  describe("GET request", () => {
    it("Respond 200", async () => {
      const response = await request.get(endpoint).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(numFollowings);
    });

    it("Respond 200 searching for given follower_id", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request.get(`${endpoint}?follower_id=${user.id}`).set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it("Respond 200 searching for given blrbo_id", async () => {
      const index = Math.floor(Math.random() * numUsers2);
      const user = users2[index];
      const response = await request.get(`${endpoint}?blrbo_id=${user.id}`).set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("GET request given ID", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numFollowings);
      const following = followings[index];
      const response = await request.get(`${endpoint}/${following.id}`).set("Authorization", `Bearer ${tokens[index % numUsers]}`);;

      expect(response.status).toBe(200);
      expect(response.body.data.follower_id).toBe(following.follower_id);
      expect(response.body.data.blrbo_id).toBe(following.blrbo_id);
      const response_date_followed = new Date(response.body.data.date_followed);
      expect(response_date_followed).toMatchObject(following.date_followed);
      expect(response.body.data.id).toBe(following.id);
    });

    it("Respond 400 on invalid post ID", async () => {
      const response = await request.get(`${endpoint}/invalid}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing following ID", async () => {
      const response = await request.get(`${endpoint}/${faker.datatype.uuid()}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userInd2 = Math.floor(Math.random() * numUsers2);
      const follower_id = users[userInd].id;
      const blrbo_id = users2[userInd2].id;

      const response = await request.post(endpoint).send({
        follower_id,
        blrbo_id,
      }).set("Authorization", `Bearer ${tokens[userInd]}`);
      expect(response.status).toBe(201);
      expect(response.body.data.follower_id).toBe(follower_id);
      expect(response.body.data.blrbo_id).toBe(blrbo_id);
      expect(response.body.data.date_followed).toBeDefined();
      expect(response.body.data.id).toBeDefined();
    });

    describe("Respond 400", () => {
      it("invalid follower_id body", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userInd2 = Math.floor(Math.random() * numUsers2);
        const follower_id = "INVALID";
        const blrbo_id = users2[userInd2].id;

        const response = await request.post(endpoint).send({
          follower_id,
          blrbo_id,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(400);
      });

      it("invalid blrbo_id body", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userInd2 = Math.floor(Math.random() * numUsers2);
        const follower_id = users[userInd].id;
        const blrbo_id = "INVALID";

        const response = await request.post(endpoint).send({
          follower_id,
          blrbo_id,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("invalid follower_id", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userInd2 = Math.floor(Math.random() * numUsers2);
        const follower_id = faker.datatype.uuid();
        const blrbo_id = users2[userInd2].id;

        const response = await request.post(endpoint).send({
          follower_id,
          blrbo_id,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(404);
      });

      it("invalid blrbo_id", async () => {
        const userInd = Math.floor(Math.random() * numUsers);
        const userInd2 = Math.floor(Math.random() * numUsers2);
        const follower_id = users[userInd].id;
        const blrbo_id = faker.datatype.uuid();

        const response = await request.post(endpoint).send({
          follower_id,
          blrbo_id,
        }).set("Authorization", `Bearer ${tokens[userInd]}`);
        expect(response.status).toBe(404);
      });
    });
  });

  describe("DELETE request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numFollowings);
      const following = followings[index];
      const response = await request.delete(`${endpoint}/${following.id}`).set("Authorization", `Bearer ${tokens[index % numUsers]}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.follower_id).toBe(following.follower_id);
      expect(response.body.data.blrbo_id).toBe(following.blrbo_id);
      const response_date_followed = new Date(response.body.data.date_followed);
      expect(response_date_followed).toMatchObject(following.date_followed);
      expect(response.body.data.id).toBe(following.id);
    });

    it("Respond 400 on invalid following ID", async () => {
      const response = await request
        .delete(`${endpoint}/invalid}`)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing following ID", async () => {
      const response = await request
        .delete(`${endpoint}/${faker.datatype.uuid()}`)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    // await followingDao.deleteAll();
    // await userDao.deleteAll();
  });
});