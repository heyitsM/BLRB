import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import ProfessionalArtistInfoDao from "../../data/ProfessionalArtistInfoDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const professionalArtistInfoDao = new ProfessionalArtistInfoDao();
const userDao = new UserDao();

describe("Test CommissionDao", () => {
  const numUsers = 5;
  const numInfos = 4;
  let users;
  let infos;

  beforeAll(async () => {
    await prisma.$connect();
    // await professionalArtistInfoDao.deleteAll();
  });

  beforeEach(async () => {
    // await professionalArtistInfoDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    infos = [];
    // create users
    for (let index = 0; index < numUsers; index++) {
      const first_name = faker.name.firstName();
      const last_name = faker.name.lastName();
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      // let role = "PROFESSIONALY";
      let role = "PROFESSIONAL";
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
    // create infos
    for (let index = 0; index < numInfos; index++) {
      // fields: id, commission_rules, accepting_commissions, stripeAccountID
      const id = users[index].id;
      const accepting_commissions = faker.datatype.boolean();
      const commission_rules = faker.lorem.sentence();
      const stripeAccountID = faker.datatype.uuid();

      const info = await professionalArtistInfoDao.create({
          id,
          commission_rules,
          accepting_commissions,
          stripeAccountID,
      });
      infos.push(info);
    }
  });

  it("test create()", async () => {
    const id = users[numUsers - 1].id;
    const accepting_commissions = faker.datatype.boolean();
    const commission_rules = faker.lorem.sentence();
    const stripeAccountID = faker.datatype.uuid();

    const _info = await professionalArtistInfoDao.create({
      id,
      commission_rules,
      accepting_commissions,
      stripeAccountID,
    });
    expect(_info.accepting_commissions).toBe(accepting_commissions);
    expect(_info.commission_rules).toBe(commission_rules);
    expect(_info.stripeAccountID).toBe(stripeAccountID);
    expect(_info.id).toBe(id);
  });

  describe("test create() throws error", () => {
    it("invalid id", async () => {
      const id = faker.datatype.uuid();
      const accepting_commissions = faker.datatype.boolean();
      const commission_rules = faker.lorem.sentence();
      const stripeAccountID = faker.datatype.uuid();
      try {
        await professionalArtistInfoDao.create({
          data: {
            id,
            commission_rules,
            accepting_commissions,
            stripeAccountID,
          },
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("invalid commission_rules", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const accepting_commissions = faker.datatype.boolean();
      const commission_rules = faker.datatype.float();
      const stripeAccountID = faker.datatype.uuid();
      try {
        await professionalArtistInfoDao.create({
          id: info.id,
          commission_rules,
          accepting_commissions,
          stripeAccountID,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("invalid accepting_commissions", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const accepting_commissions = "true";
      const commission_rules = faker.lorem.sentence();
      const stripeAccountID = faker.datatype.uuid();
      try {
        await professionalArtistInfoDao.create({
          id: info.id,
          commission_rules,
          accepting_commissions,
          stripeAccountID,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test read()", async () => {
    const index = Math.floor(Math.random() * numInfos);
    const info = infos[index];
    const _info = await professionalArtistInfoDao.read(info.id);

    expect(_info.accepting_commissions).toBe(info.accepting_commissions);
    expect(_info.commission_rules).toBe(info.commission_rules);
    expect(_info.stripeAccountID).toBe(info.stripeAccountID);
    expect(_info.id).toBe(info.id);
  });

  it("test read() given invalid ID", async () => {
    try {
      await professionalArtistInfoDao.read("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await professionalArtistInfoDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test update()", async () => {
    const index = Math.floor(Math.random() * numInfos);
    const info = infos[index];
    const accepting_commissions = faker.datatype.boolean();
    const commission_rules = faker.lorem.sentence();

    const _info = await professionalArtistInfoDao.update({
      id: info.id,
      accepting_commissions,
      commission_rules,
    });
    // ensure all others stay the same
    expect(_info.stripeAccountID).toBe(info.stripeAccountID);
    expect(_info.id).toBe(info.id);
    // changes made to:
    expect(_info.accepting_commissions).toBe(accepting_commissions);
    expect(_info.commission_rules).toBe(commission_rules);
  });

  describe("test update() throws error", () => {
    it("non existant user id", async () => {
      const id = faker.datatype.uuid();
      const accepting_commissions = faker.datatype.boolean();
      const commission_rules = faker.lorem.sentence();
      try {
        await professionalArtistInfoDao.update({
          id,
          accepting_commissions,
          commission_rules,
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("accepting_commissions non boolean", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const accepting_commissions = "true";
      try {
        await professionalArtistInfoDao.update({
          id: info.id,
          accepting_commissions,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("commission_rules non string", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const commission_rules = faker.datatype.float();
      try {
        await professionalArtistInfoDao.update({
          id: info.id,
          commission_rules,
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numInfos);
    const info = infos[index];
    const _info = await professionalArtistInfoDao.delete(info.id);

    expect(_info.accepting_commissions).toBe(info.accepting_commissions);
    expect(_info.commission_rules).toBe(info.commission_rules);
    expect(_info.stripeAccountID).toBe(info.stripeAccountID);
    expect(_info.id).toBe(info.id);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await professionalArtistInfoDao.delete("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await professionalArtistInfoDao.delete(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  afterAll(async () => {
    // await professionalArtistInfoDao.deleteAll();
    // await userDao.deleteAll();
    await prisma.$disconnect();
  });
});
