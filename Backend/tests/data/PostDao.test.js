import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import PostDao from "../../data/PostDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

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
  let users;
  let posts;

  beforeAll(async () => {
    await prisma.$connect();
    // await postDao.deleteAll();
  });

  beforeEach(async () => {
    // await postDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    posts = [];
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
  });

  it("test create()", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const userId = users[userInd].id;
    const body = faker.lorem.sentence();
    const img = faker.image.imageUrl();
    const tags = select_tags;
    const _post = await postDao.create({
      userId,
      body,
      img,
      tags,
    });
    expect(_post.userId).toBe(userId);
    expect(_post.body).toBe(body);
    expect(_post.num_likes).toBe(0);
    expect(_post.date_created).toBeDefined();
    expect(_post.img).toBe(img);
    expect(_post.tags).toMatchObject(tags);
    expect(_post.id).toBeDefined();
  });

  describe("test create() throws error", () => {
    it("invalid userId", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userId = "INVALID";
      const body = faker.lorem.sentence();
      const img = faker.image.imageUrl();
      const tags = select_tags;
      
      try {
        const _post = await postDao.create({
          userId,
          body,
          img,
          tags,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("valid userId but non existant user", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userId = faker.datatype.uuid();
      const body = faker.lorem.sentence();
      const img = faker.image.imageUrl();
      const tags = select_tags;
      
      try {
        const _post = await postDao.create({
          userId,
          body,
          img,
          tags,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("missing body", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userId = users[userInd].id;
      const body = "";
      const img = faker.image.imageUrl();
      const tags = select_tags;
      
      try {
        const _post = await postDao.create({
          userId,
          body,
          img,
          tags,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non string img", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userId = users[userInd].id;
      const body = faker.lorem.sentence();
      const img = faker.datatype.number();
      const tags = select_tags;
      
      try {
        const _post = await postDao.create({
          userId,
          body,
          img,
          tags,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non array tags", async () => {
      const userInd = Math.floor(Math.random() * numUsers);
      const userId = users[userInd].id;
      const body = faker.lorem.sentence();
      const img = faker.image.imageUrl();
      const tags = faker.lorem.sentence();
      
      try {
        const _post = await postDao.create({
          userId,
          body,
          img,
          tags,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test read()", async () => {
  // fields: userId, img, body, date_created, num_likes, tags

    const index = Math.floor(Math.random() * numPosts);
    const post = posts[index];
    const _post = await postDao.read(post.id);
    expect(_post.userId).toBe(post.userId);
    expect(_post.img).toBe(post.img);
    expect(_post.body).toBe(post.body);
    expect(_post.date_created).toMatchObject(post.date_created);
    expect(_post.num_likes).toBe(post.num_likes);
    expect(_post.tags).toMatchObject(post.tags);
    expect(_post.id).toBe(post.id);
  });

  it("test read() given invalid ID", async () => {
    try {
      await postDao.read("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await postDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test readAll()", async () => {
    const _posts = await postDao.readAll({});
    expect(_posts.length).toBeGreaterThanOrEqual(numPosts);
  });

  it("test readAll() given userId", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const userId = users[userInd].id;
    const _posts = await postDao.readAll({ userId });
    expect(_posts.length).toBeGreaterThanOrEqual(1);
  });

  it("test readAll() given partial body", async () => {
    const postInd = Math.floor(Math.random() * numPosts);
    const body = posts[postInd].body;
    const partial_body = body.slice(0, body.length - 2);
    const _posts = await postDao.readAll({ body: partial_body });
    expect(_posts.length).toBeGreaterThanOrEqual(1);
  });

  it("test readAll() given tags", async () => {
    const userInd = Math.floor(Math.random() * numUsers);
    const userId = users[userInd].id;
    const tagInd1 = Math.floor(Math.random() * select_tags.length);
    const tagInd2 = Math.floor(Math.random() * select_tags.length);
    const test_tags = [select_tags[tagInd1], select_tags[tagInd2]];
    const _posts = await postDao.readAll({ tags: test_tags });
    expect(_posts.length).toBeGreaterThanOrEqual(1);
    for (const _post of _posts) {
      const intersection = test_tags.filter(tag => _post.tags.includes(tag));
      if (intersection.length > 0) {
        expect(_post.tags).toBeDefined();
      } else {
        expect(_post.tags).not.toBeDefined();
      }
    }
  });

  it("test update()", async () => {
    const index = Math.floor(Math.random() * numPosts);
    const img = faker.image.imageUrl();
    const post = posts[index];
    const num_likes = faker.datatype.number({ min: 1 });
    const _post = await postDao.update({
      id: post.id,
      img,
      num_likes,
    });
    // ensure all others stay the same
    expect(_post.userId).toBe(post.userId);
    expect(_post.body).toBe(post.body);
    expect(_post.date_created).toMatchObject(post.date_created);
    expect(_post.tags).toMatchObject(post.tags);
    expect(_post.id).toBe(post.id);
    // changes made to:
    expect(_post.num_likes).toBe(num_likes);
    expect(_post.img).toBe(img);
  });

  describe("test update() throws error", () => {
    it("test invalid id", async () => {
      const id = faker.datatype.uuid();
      const num_likes = faker.datatype.number({ min: 0 });
      try {
        await postDao.update({ id, num_likes });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("negative likes", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const num_likes = faker.datatype.number({ min: 0 }) * -1;
      try {
        await postDao.update({ id: post.id, num_likes });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non int likes", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const num_likes = faker.datatype.float({ min: 0 });
      try {
        await postDao.update({ id: post.id, num_likes });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non number likes", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const num_likes = "INVALID";
      try {
        await postDao.update({ id: post.id, num_likes });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non string img", async () => {
      const index = Math.floor(Math.random() * numPosts);
      const post = posts[index];
      const img = faker.datatype.number();
      
      try {
        await postDao.update({ id: post.id, img });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numPosts);
    const post = posts[index];
    const _post = await postDao.delete(post.id);

    expect(_post.userId).toBe(post.userId);
    expect(_post.img).toBe(post.img);
    expect(_post.body).toBe(post.body);
    expect(_post.date_created).toMatchObject(post.date_created);
    expect(_post.num_likes).toBe(post.num_likes);
    expect(_post.tags).toMatchObject(post.tags);
    expect(_post.id).toBe(post.id);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await postDao.delete("INVALID");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await postDao.delete(valid_id);
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