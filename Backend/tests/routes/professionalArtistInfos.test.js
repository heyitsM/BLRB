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
import { professionalArtistInfoDao } from "../../routes/professionalArtistInfos.js";
import app from "../../index.js";

const endpoint = "/professionalArtistInfos";
const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  const numInfos = 4;
  let users;
  let infos;
  let tokens;

  beforeAll(async () => {
    // await professionalArtistInfoDao.deleteAll();
  });

  beforeEach(async () => {
    // await professionalArtistInfoDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    infos = [];
    tokens = [];
    // create users
    for (let index = 0; index < numUsers; index++) {
      const first_name = faker.name.firstName();
      const last_name = faker.name.lastName();
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);
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
      let token = createToken({user:user.id, role:"NONADMIN"});
      tokens.push(token);
    }
    // create infos
    for (let index = 0; index < numInfos; index++) {
      // fields: id, commission_rules, accepting_commissions, stripeAccountID
      const id = users[index].id;
      let accepting_commissions = faker.datatype.boolean();
      // there is at least one true and at least one false
      if (index === 1) {
        accepting_commissions = true;
      }
      if (index === 0) {
        accepting_commissions = false;
      }
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

  describe("GET request", () => {
    it("Respond 200", async () => {
      const response = await request.get(endpoint).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(numInfos);
    });

    it("Respond 200 searching for given accepting_commissions", async () => {
      const accepting_commissions = true;
      const response = await request.get(
        `${endpoint}?accepting_commissions=${accepting_commissions}`
      ).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET request given ID", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const response = await request.get(`${endpoint}/${info.id}`).set("Authorization", `Bearer ${tokens[0]}`);

      expect(response.status).toBe(200);
      expect(response.body.data.accepting_commissions).toBe(
        info.accepting_commissions
      );
      expect(response.body.data.commission_rules).toBe(info.commission_rules);
      expect(response.body.data.stripeAccountID).toBe(info.stripeAccountID);
      expect(response.body.data.id).toBe(info.id);
    });

    it("Respond 400 on invalid commission ID", async () => {
      const response = await request.get(`${endpoint}/invalid}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });

    it("Respond 404 for valid but non existing commission ID", async () => {
      const response = await request.get(
        `${endpoint}/${faker.datatype.uuid()}`
      ).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const id = users[numUsers - 1].id;
      const accepting_commissions = faker.datatype.boolean();
      const commission_rules = faker.lorem.sentence();
      const stripeAccountID = faker.datatype.uuid();

      const response = await request.post(endpoint).send({
        id,
        commission_rules,
        accepting_commissions,
        stripeAccountID,
      }).set("Authorization", `Bearer ${tokens[numUsers - 1]}`);
      expect(response.status).toBe(201);
      expect(response.body.data.accepting_commissions).toBe(accepting_commissions);
      expect(response.body.data.commission_rules).toBe(commission_rules);
      expect(response.body.data.stripeAccountID).toBe(stripeAccountID);
      expect(response.body.data.id).toBe(id);
    });

    describe("Respond 400", () => {
      it("invalid commission_rules", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const accepting_commissions = faker.datatype.boolean();
        const commission_rules = faker.datatype.float();
        const stripeAccountID = faker.datatype.uuid();
        const response = await request.post(endpoint).send({
          id: info.id,
          commission_rules,
          accepting_commissions,
          stripeAccountID,
        }).set("Authorization", `Bearer ${tokens[index]}`);
        expect(response.status).toBe(400);
      });
  
      it("invalid accepting_commissions", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const accepting_commissions = "nonbool";
        const commission_rules = faker.lorem.sentence();
        const stripeAccountID = faker.datatype.uuid();
        const response = await request.post(endpoint).send({
          id: info.id,
          commission_rules,
          accepting_commissions,
          stripeAccountID,
        }).set("Authorization", `Bearer ${tokens[index]}`);
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("invalid id", async () => {
        const id = faker.datatype.uuid();
        const accepting_commissions = faker.datatype.boolean();
        const commission_rules = faker.lorem.sentence();
        const stripeAccountID = faker.datatype.uuid();
        const response = await request.post(endpoint).send({
          id,
          commission_rules,
          accepting_commissions,
          stripeAccountID,
        }).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(404);
      });
    });
  });

  describe("PUT request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const accepting_commissions = faker.datatype.boolean();
      const commission_rules = faker.lorem.sentence();

      const response = await request.put(`${endpoint}/${info.id}`).send({
        id: info.id,
        accepting_commissions,
        commission_rules,
      }).set("Authorization", `Bearer ${tokens[index]}`);

      expect(response.status).toBe(200);
      // ensure all others stay the same
      // ensure all others stay the same
      expect(response.body.data.stripeAccountID).toBe(info.stripeAccountID);
      expect(response.body.data.id).toBe(info.id);
      // changes made to:
      expect(response.body.data.accepting_commissions).toBe(
        accepting_commissions
      );
      expect(response.body.data.commission_rules).toBe(commission_rules);
    });

    describe("Respond 400", () => {
      it("accepting_commissions non boolean", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const accepting_commissions = "true";
        const response = await request
          .put(`${endpoint}/${info.id}`)
          .send({
            accepting_commissions,
          })
          .set("Authorization", `Bearer ${tokens[index]}`);
        expect(response.status).toBe(400);
      });
  
      it("commission_rules non string", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const commission_rules = faker.datatype.float();
        const response = await request
          .put(`${endpoint}/${info.id}`)
          .send({
            commission_rules,
          })
          .set("Authorization", `Bearer ${tokens[index]}`);
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("non existant user id", async () => {
        const id = faker.datatype.uuid();
        const accepting_commissions = faker.datatype.boolean();
        const commission_rules = faker.lorem.sentence();
        const response = await request
          .put(`${endpoint}/${id}`)
          .send({
            accepting_commissions,
            commission_rules,
          })
          .set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(404);
      });
    });
  });

  describe("DELETE request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const response = await request.delete(`${endpoint}/${info.id}`).set("Authorization", `Bearer ${tokens[index]}`);

      expect(response.status).toBe(200);
      expect(response.body.data.accepting_commissions).toBe(
        info.accepting_commissions
      );
      expect(response.body.data.commission_rules).toBe(info.commission_rules);
      expect(response.body.data.stripeAccountID).toBe(info.stripeAccountID);
      expect(response.body.data.id).toBe(info.id);
    });
    it("Respond 400 on invalid commission ID", async () => {
      const response = await request.delete(`${endpoint}/invalid}`).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(400);
    });

    it("Respond 404 for valid but non existing commission ID", async () => {
      const response = await request.delete(
        `${endpoint}/${faker.datatype.uuid()}`
      ).set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    // await professionalArtistInfoDao.deleteAll();
    // await userDao.deleteAll();
  });
});
