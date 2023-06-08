import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;
import FollowingDao from "../../data/FollowingDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const followingDao = new FollowingDao();
const userDao = new UserDao();

// const roles = ["RECRUITER", "PROFESSIONALY", "FOR_FUN"];
const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];

describe("Test PostDao", () => {
  const numUsers = 5;
  const numUsers2 = 5;
  const numFollowings = 10;
  let users;
  let users2;
  let followings;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    // await followingDao.deleteAll();
    // await userDao.deleteAll();

    users = [];
    users2 = [];
    followings = [];
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

  it("test create()", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const userInd2 = Math.floor(Math.random() * numUsers2);
    const follower_id = users[userInd].id;
    const blrbo_id = users2[userInd2].id;
    const _following = await followingDao.create({
      follower_id,
      blrbo_id,
    });
    expect(_following.follower_id).toBe(follower_id);
    expect(_following.blrbo_id).toBe(blrbo_id);
    expect(_following.date_followed).toBeDefined();
  });

  describe("test create() throws error", () => {
    it("valid uuid but non existant follower_id", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userInd2 = Math.floor(Math.random() * numUsers2);
      const follower_id = "INVALID";
      const blrbo_id = users2[userInd2].id;

      try {
        const _following = await followingDao.create({
          follower_id,
          blrbo_id,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("invalid follower_id", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userInd2 = Math.floor(Math.random() * numUsers2);
      const follower_id = faker.datatype.uuid();
      const blrbo_id = users2[userInd2].id;

      try {
        const _following = await followingDao.create({
          follower_id,
          blrbo_id,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("valid uuid but non existant blrbo_id", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userInd2 = Math.floor(Math.random() * numUsers2);
      const follower_id = users[userInd].id;
      const blrbo_id = faker.datatype.uuid();
      
      try {
        const _following = await followingDao.create({
          follower_id,
          blrbo_id,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("invalid blrbo_id", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userInd2 = Math.floor(Math.random() * numUsers2);
      const follower_id = users[userInd].id;
      const blrbo_id = "INVALID";
      
      try {
        const _following = await followingDao.create({
          follower_id,
          blrbo_id,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

  });

  it("test read()", async () => {
    // fields: follower_id, blrbo_id, date_followed
    const index = Math.floor(Math.random() * numUsers2);
    const following = followings[index];
    const _following = await followingDao.read(following.id);
    expect(_following.follower_id).toBe(following.follower_id);
    expect(_following.blrbo_id).toBe(following.blrbo_id);
    expect(_following.date_followed).toMatchObject(following.date_followed);
    expect(_following.id).toBe(following.id);
  });
  
  it("test read() given invalid ID", async () => {
    try {
      await followingDao.read("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await followingDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test readAll()", async () => {
    const followings = await followingDao.readAll({});
    expect(followings.length).toBeGreaterThanOrEqual(numFollowings);
  });

  it("test readAll() given follower_id", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const follower_id = users[userInd].id;
    const _followings = await followingDao.readAll({ follower_id });
    expect(_followings.length).toBe(2);
  });

  it("test readAll() given blrbo_id", async () => {
    const userInd2 = Math.floor(Math.random() * numUsers2);
    const blrbo_id = users2[userInd2].id;
    const _followings = await followingDao.readAll({ blrbo_id });
    expect(_followings.length).toBe(2);
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numFollowings);
    const following = followings[index];
    const _following = await followingDao.delete(following.id);

    expect(_following.follower_id).toBe(following.follower_id);
    expect(_following.blrbo_id).toBe(following.blrbo_id);
    expect(_following.date_followed).toMatchObject(following.date_followed);
    expect(_following.id).toBe(following.id);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await followingDao.delete("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await followingDao.delete(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  afterAll(async () => {
    // await userDao.deleteAll();
    await prisma.$disconnect();
  });
});