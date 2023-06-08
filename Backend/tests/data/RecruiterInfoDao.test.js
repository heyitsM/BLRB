import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import RecruiterInfoDao from "../../data/RecruiterInfoDao";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const recruiterInfoDao = new RecruiterInfoDao();
const userDao = new UserDao();

describe("Test RecruiterInfoDao", () => {
  const numUsers = 5;
  const numInfos = 4;
  let users;
  let infos;

  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    users = [];
    infos = [];
    // create users
    for (let index = 0; index < numUsers; index++) {
      const first_name = faker.name.firstName();
      const last_name = faker.name.lastName();
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
      let role = "RECRUITER";
      const user = await prisma.user.create({
        data: {
          first_name,
          last_name,
          username,
          email,
          password,
          role,
        },
      });
      users.push(user);
    }
    // create infos
    for (let index = 0; index < numInfos; index++) {
      // fields: id, commission_rules, accepting_commissions, stripeAccountID
      const id = users[index].id;
      const company = faker.company.name();
      const position = faker.commerce.department();
      const company_email = faker.internet.email();

      const info = await prisma.recruiterInfo.create({
        data: {
          id,
          company,
          position,
          company_email
        },
      });
      infos.push(info);
    }
  });

  it("test create()", async () => {
    const id = users[numUsers - 1].id;
    const company = faker.company.name();
    const position = faker.commerce.department();
    const company_email = faker.internet.email();

    const _info = await recruiterInfoDao.create({
      id,
      company,
      position,
      company_email
    });

    expect(_info.company).toBe(company);
    expect(_info.position).toBe(position);
    expect(_info.company_email).toBe(company_email);
    expect(_info.id).toBe(id);
  });

  it("test create() without company email", async () => {
    const id = users[numUsers - 1].id;
    const company = faker.company.name();
    const position = faker.commerce.department();

    const _info = await recruiterInfoDao.create({
      id,
      company,
      position,
    });

    expect(_info.company).toBe(company);
    expect(_info.position).toBe(position);
    expect(_info.company_email).toBe(null);
    expect(_info.id).toBe(id);
  });

  describe("test create() throws error", () => {
    it("invalid id", async () => {
      try {
        const company = faker.company.name();
        const position = faker.commerce.department();
        const company_email = faker.internet.email();

        const _info = await recruiterInfoDao.create({
            id:"invalid",
            company,
            position,
            company_email
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("valid but not found id", async () => {
      try {
        const id = faker.datatype.uuid();
        const company = faker.company.name();
        const position = faker.commerce.department();
        const company_email = faker.internet.email();

        const _info = await recruiterInfoDao.create({
            id,
            company,
            position,
            company_email
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("company not provided", async () => {
        try {
          const id = users[numUsers - 1].id;
          const position = faker.commerce.department();
          const company_email = faker.internet.email();
  
          const _info = await recruiterInfoDao.create({
              id,
              position,
              company_email
          });
        } catch (err) {
          expect(err.status).toBe(400);
        }
    });

    it("position not provided", async () => {
        try {
          const id = users[numUsers - 1].id;
          const company_email = faker.internet.email();
          const company = faker.company.name();

          const _info = await recruiterInfoDao.create({
              id,
              company,
              company_email
          });
        } catch (err) {
          expect(err.status).toBe(400);
        }
    });

    it("bad email", async () => {
        try {
          const id = users[numUsers - 1].id;
          const company_email = faker.company.name();
          const company = faker.company.name();
          const position = faker.commerce.department();

          const _info = await recruiterInfoDao.create({
              id,
              company,
              company_email,
              position
          });
        } catch (err) {
          expect(err.status).toBe(400);
        }
    });

  });

  it("test read()", async () => {
    const index = Math.floor(Math.random() * numInfos);
    const info = infos[index];
    const _info = await recruiterInfoDao.read(info.id);

    expect(_info.company).toBe(info.company);
    expect(_info.company_email).toBe(info.company_email);
    expect(_info.position).toBe(info.position);
    expect(_info.id).toBe(info.id);
  });

  it("test read() given invalid ID", async () => {
    try {
      await recruiterInfoDao.read("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test read() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await recruiterInfoDao.read(valid_id);
    } catch (err) {
      expect(err.status).toBe(404);
    }
  });

  it("test update()", async () => {
    const index = Math.floor(Math.random() * numInfos);
    const info = infos[index];

    const company = faker.company.name();
    const company_email = faker.internet.email();

    const _info = await recruiterInfoDao.update({
      id: info.id,
      company,
      company_email
    });
    // ensure all others stay the same
    expect(_info.position).toBe(info.position);
    expect(_info.id).toBe(info.id);
    // changes made to:
    expect(_info.company).toBe(company);
    expect(_info.company_email).toBe(company_email);
  });

  describe("test update() throws error", () => {
    it("non existant user id", async () => {
      const id = faker.datatype.uuid();
      const company = faker.company.name();
      const company_email = faker.internet.email();
      
      try {
        await recruiterInfoDao.update({
          id,
          company,
          company_email
        });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("bad email", async () => {
      //TODO do this once you fix email in the dao
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const company = faker.company.name();
      const company_email = faker.company.name();
      
      try {
        await recruiterInfoDao.update({
          id:info.id,
          company,
          company_email
        });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numInfos);
    const info = infos[index];
    const _info = await recruiterInfoDao.delete(info.id);

    expect(_info.company).toBe(info.company);
    expect(_info.position).toBe(info.position);
    expect(_info.company_email).toBe(info.company_email);
    expect(_info.id).toBe(info.id);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await recruiterInfoDao.delete("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid but non-existing ID", async () => {
    try {
      const valid_id = faker.datatype.uuid();
      await recruiterInfoDao.delete(valid_id);
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
