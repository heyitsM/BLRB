import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import CommissionDao from "../../data/CommissionDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const commissionDao = new CommissionDao();
const userDao = new UserDao();
const statuses = [
  "REQUESTED",
  "PENDING",
  "REJECTED",
  "ACCEPTED",
  "PAID",
  "COMPLETED",
];
// const roles = ["RECRUITER", "PROFESSIONALY", "FOR_FUN"];
const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];

describe("Test CommissionDao", () => {
  const numUsers = 5;
  const numCommissions = 5;
  let users;
  let commissions;

  beforeAll(async () => {
    await prisma.$connect();
    // await commissionDao.deleteAll();
  });

  beforeEach(async () => {
    // await commissionDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    commissions = [];
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
    // create commissions
    for (let index = 0; index < numCommissions; index++) {
      // fields: artist_id, commissioner_id, title, description, notes, price, status
      const user1 = Math.floor(Math.random() * numUsers);
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = users[user2].id;
      const title = faker.lorem.words();
      const description = faker.lorem.sentence();
      const notes = faker.lorem.sentence(6);
      const price = faker.datatype.float({ min: 0 });
      const ind = Math.floor(Math.random() * statuses.length);
      const status = statuses[ind];

      const commission = await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
          status,
      });
      commissions.push(commission);
    }
  });

  // you cannot give a status upon creation
  it("test create()", async () => {
    const user1 = Math.floor(Math.random() * numUsers);
    const user2 = Math.floor(Math.random() * numUsers);
    const artist_id = users[user1].id;
    const commissioner_id = users[user2].id;
    const title = faker.lorem.words();
    const description = faker.lorem.sentence();
    const notes = faker.lorem.sentence(6);
    const price = faker.datatype.float({ min: 0 });
    const _commission = await commissionDao.create({
      artist_id,
      commissioner_id,
      title,
      description,
      notes,
      price,
    });
    expect(_commission.artist_id).toBe(artist_id);
    expect(_commission.commissioner_id).toBe(commissioner_id);
    expect(_commission.title).toBe(title);
    expect(_commission.description).toBe(description);
    expect(_commission.notes).toBe(notes);
    expect(_commission.price).toBe(price);
    expect(_commission.status).toBe("REQUESTED");
    expect(_commission.id).toBeDefined();
  });

  describe("test create() throws error", () => {
    it("invalid artist_id", async () => {
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = faker.datatype.uuid();
      const commissioner_id = users[user2].id;
      const title = faker.lorem.words();
      const description = faker.lorem.sentence();
      const notes = faker.lorem.sentence(6);
      const price = faker.datatype.float({ min: 0 });
      try {
        const _commission = await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("invalid commissioner_id", async () => {
      const user1 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = faker.datatype.uuid();
      const title = faker.lorem.words();
      const description = faker.lorem.sentence();
      const notes = faker.lorem.sentence(6);
      const price = faker.datatype.float({ min: 0 });
      try {
        await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("missing title", async () => {
      const user1 = Math.floor(Math.random() * numUsers);
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = users[user2].id;
      const title = "";
      const description = faker.lorem.sentence();
      const notes = faker.lorem.sentence(6);
      const price = faker.datatype.float({ min: 0 });
      try {
        await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("missing description", async () => {
      const user1 = Math.floor(Math.random() * numUsers);
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = users[user2].id;
      const title = faker.lorem.words();
      const description = "";
      const notes = faker.lorem.sentence(6);
      const price = faker.datatype.float({ min: 0 });
      try {
        await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("non string notes", async () => {
      const user1 = Math.floor(Math.random() * numUsers);
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = users[user2].id;
      const title = faker.lorem.words();
      const description = faker.lorem.sentence();
      const notes = faker.datatype.float();
      const price = faker.datatype.float({ min: 0 });
      try {
        await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("negative price", async () => {
      const user1 = Math.floor(Math.random() * numUsers);
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = users[user2].id;
      const title = faker.lorem.words();
      const description = faker.lorem.sentence();
      const notes = faker.datatype.float();
      const price = faker.datatype.float({ max: -1, min: -5 });
      try {
        await commissionDao.create({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test read()", async () => {
    const index = Math.floor(Math.random() * numCommissions);
    const commission = commissions[index];
    const _commission = await commissionDao.read(commission.id);
    expect(_commission.artist_id).toBe(commission.artist_id);
    expect(_commission.commissioner_id).toBe(commission.commissioner_id);
    expect(_commission.title).toBe(commission.title);
    expect(_commission.description).toBe(commission.description);
    expect(_commission.notes).toBe(commission.notes);
    expect(_commission.price).toBe(commission.price);
    expect(_commission.status).toBe(commission.status);
    expect(_commission.id).toBe(commission.id);
  });

  it("test read() given invalid ID", async () => {
    try {
      await commissionDao.read("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await commissionDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test update()", async () => {
    const index = Math.floor(Math.random() * numCommissions);
    const commission = commissions[index];
    const price = faker.datatype.float({ min: 0 });
    const status_ind = Math.floor(Math.random() * statuses.length);
    const status = statuses[status_ind];
    const _commission = await commissionDao.update({
      id: commission.id,
      price,
      status,
    });
    // ensure all others stay the same
    expect(_commission.artist_id).toBe(commission.artist_id);
    expect(_commission.commissioner_id).toBe(commission.commissioner_id);
    expect(_commission.title).toBe(commission.title);
    expect(_commission.description).toBe(commission.description);
    expect(_commission.notes).toBe(commission.notes);
    expect(_commission.id).toBeDefined(commission.id);
    // changes made to:
    expect(_commission.price).toBe(price);
    expect(_commission.status).toBe(status);
  });

  describe("test update() throws error", () => {
    it("test invalid id", async () => {
      const id = faker.datatype.uuid();
      const price = faker.datatype.float({ min: 0 });
      const status_ind = Math.floor(Math.random() * statuses.length);
      const status = statuses[status_ind];
      try {
        await commissionDao.update({ id, price, status });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("negative price", async () => {
      const index = Math.floor(Math.random() * numCommissions);
      const commission = commissions[index];
      const price = faker.datatype.float({ min: 0 }) * -1;
      try {
        await commissionDao.update({ id: commission.id, price });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("invalid status", async () => {
      const index = Math.floor(Math.random() * numCommissions);
      const commission = commissions[index];
      const status = "INVALID";
      try {
        await commissionDao.update({ id: commission.id, status });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numCommissions);
    const commission = commissions[index];
    const _commission = await commissionDao.delete(commission.id);

    expect(_commission.artist_id).toBe(commission.artist_id);
    expect(_commission.commissioner_id).toBe(commission.commissioner_id);
    expect(_commission.title).toBe(commission.title);
    expect(_commission.description).toBe(commission.description);
    expect(_commission.notes).toBe(commission.notes);
    expect(_commission.price).toBe(commission.price);
    expect(_commission.status).toBe(commission.status);
    expect(_commission.id).toBeDefined();
  });

  it("test delete() given invalid ID", async () => {
    try {
      await commissionDao.delete("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await commissionDao.delete(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  afterAll(async () => {
    // await commissionDao.deleteAll();
    // await userDao.deleteAll();
    await prisma.$disconnect();
  });
});
