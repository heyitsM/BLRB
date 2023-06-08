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
import { recruiterInfoDao } from "../../routes/recruiterInfos.js";
import app from "../../index.js";

const endpoint = "/recruiterInfos";
const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  const numInfos = 4;
  let users;
  let infos;
  let tokens;

  beforeEach(async () => {
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
      let role = "RECRUITER";
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
    // create infos
    for (let index = 0; index < numInfos; index++) {
      // fields: id, commission_rules, accepting_commissions, stripeAccountID
      const id = users[index].id;
      const company = faker.company.name();
      const position = faker.commerce.department();
      const company_email = faker.internet.email();

      const info = await recruiterInfoDao.create({
          id,
          company,
          position,
          company_email
      });
      infos.push(info);
    }
  });

  describe("GET request", () => {
    describe("GET w/o id", () => {
      it("Respond 200", async () => {
        const response = await request.get(endpoint).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
      });

      it("Respond 200 searching for company", async () => {
        const info = infos[0];
        const response = await request.get(
          `${endpoint}?company=${info.company}`
        ).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
      });

      it("Respond 200 searching for position", async () => {
        const info = infos[0];
        const response = await request.get(
          `${endpoint}?position=${info.position}`
        ).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
      });

      it("Respond 200 searching for company_email", async () => {
        const info = infos[0];
        const response = await request.get(
          `${endpoint}?company_email=${info.company_email}`
        ).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
      });
    });

    describe("GET w/ id", () => {
      it("Respond 200", async () => {
        const user = users[0];
        const info = infos[0];
        const response = await request.get(`${endpoint}/${user.id}`).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
        expect(response.body.data.company).toBe(info.company);
        expect(response.body.data.position).toBe(info.position);
        expect(response.body.data.company_email).toBe(info.company_email);
        expect(response.body.data.id).toBe(user.id);
        expect(response.body.data.id).toBe(info.id);
      });

      describe("Respond on errors", () => {
        it("Respond 400 on invalid user id", async () => {
          const response = await request.get(`${endpoint}/invalid}`).set("Authorization", `Bearer ${tokens[0]}`);
          expect(response.status).toBe(400);
        });

        it("Respond 404 on valid but unused user id", async () => {
          const response = await request.get(
            `${endpoint}/${faker.datatype.uuid()}`
          ).set("Authorization", `Bearer ${tokens[0]}`);
          expect(response.status).toBe(404);
        });
      })
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const id = users[numUsers-1].id;
      const company = faker.company.name();
      const position = faker.commerce.department();
      const company_email = faker.internet.email();

      const response = await request.post(endpoint).send({
        id,
        company,
        position,
        company_email
      }).set("Authorization", `Bearer ${tokens[numUsers-1]}`);

      expect(response.status).toBe(201);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.company).toBe(company);
      expect(response.body.data.position).toBe(position);
      expect(response.body.data.company_email).toBe(company_email);
    });

    it("Respond 201 without company_email", async () => {
      const id = users[numUsers-1].id;
      const company = faker.company.name();
      const position = faker.commerce.department();

      const response = await request.post(endpoint).send({
        id,
        company,
        position,
      }).set("Authorization", `Bearer ${tokens[numUsers-1]}`);
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBe(id);
      expect(response.body.data.company).toBe(company);
      expect(response.body.data.position).toBe(position);
      expect(response.body.data.company_email).toBe(null);
    });

    describe("Respond on errors", () => {
      it("Respond 400 on invalid id", async () => {
        const id = "invalid";
        const company = faker.company.name();
        const position = faker.commerce.department();
        const company_email = faker.internet.email();

        const response = await request.post(endpoint).send({
          id,
          company,
          position,
          company_email
        }).set("Authorization", `Bearer ${tokens[numUsers - 1]}`);
        expect(response.status).toBe(400);
        
      });

      it("Respond 404 on valid but not found id", async () => {
        const id = faker.datatype.uuid();
        const company = faker.company.name();
        const position = faker.commerce.department();
        const company_email = faker.internet.email();

        const response = await request.post(endpoint).send({
          id,
          company,
          position,
          company_email
        }).set("Authorization", `Bearer ${tokens[numUsers - 1]}`);
        expect(response.status).toBe(404);
      });
  
      it("Respond 400 on company not provided", async () => {
        const id = users[numUsers-1].id;
        // const company = faker.company.name();
        const position = faker.commerce.department();
        const company_email = faker.internet.email();

        const response = await request.post(endpoint).send({
          id,
          position,
          company_email
        }).set("Authorization", `Bearer ${tokens[numUsers - 1]}`);
        expect(response.status).toBe(400);
      });
  
      it("Respond 400 on position not provided", async () => {
        const id = users[numUsers-1].id;
        const company = faker.company.name();
        // const position = faker.commerce.department();
        const company_email = faker.internet.email();

        const response = await request.post(endpoint).send({
          id,
          company,
          company_email
        }).set("Authorization", `Bearer ${tokens[numUsers - 1]}`);
        expect(response.status).toBe(400);
      });
  
      it("Respond 400 on bad email", async () => {
        const id = users[numUsers-1].id;
        const company = faker.company.name();
        const position = faker.commerce.department();
        const company_email = faker.commerce.department();

        const response = await request.post(endpoint).send({
          id,
          company,
          position,
          company_email
        }).set("Authorization", `Bearer ${tokens[numUsers - 1]}`);
        expect(response.status).toBe(400);
      });
    });
  });

  describe("PUT request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numInfos);
      const info = infos[index];
      const company_email = faker.internet.email();

      const response = await request.put(`${endpoint}/${info.id}`).send({
        company_email
      }).set("Authorization", `Bearer ${tokens[index]}`);

      expect(response.status).toBe(200);
      expect(response.body.data.company_email).toBe(company_email);
      expect(response.body.data.company).toBe(info.company);
      expect(response.body.data.position).toBe(info.position);
    });

    describe("Respond on errors", () => {
      it("Respond 400 on invalid id", async () => {
        const company_email = faker.internet.email();
        const response = await request.put(`${endpoint}/invalid`).send({
          company_email
        }).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(400);
      });

      it("Respond 404 on valid id not found", async () => {
        const id = faker.datatype.uuid();
        const company_email = faker.internet.email();
        const response = await request.put(`${endpoint}/${id}`).send({
          company_email
        }).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(404);
      });

      it("Respond 400 on non string company", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const company = 42;

        const response = await request.put(`${endpoint}/${info.id}`).send({
          company
        }).set("Authorization", `Bearer ${tokens[index]}`);

        expect(response.status).toBe(400);
      });

      it("Respond 400 on non string position", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const position = 42;

        const response = await request.put(`${endpoint}/${info.id}`).send({
          position
        }).set("Authorization", `Bearer ${tokens[index]}`);

        expect(response.status).toBe(400);
      });

      it("Respond 400 on invalid email", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const company_email = 42;

        const response = await request.put(`${endpoint}/${info.id}`).send({
          company_email
        }).set("Authorization", `Bearer ${tokens[index]}`);

        expect(response.status).toBe(400);
      });
    });
  });

  describe("DELETE request", () => {
    describe("DELETE w/ id", () => {
      it("Respond 200", async () => {
        const index = Math.floor(Math.random() * numInfos);
        const info = infos[index];
        const response = await request.delete(`${endpoint}/${info.id}`).set("Authorization", `Bearer ${tokens[index]}`);
        expect(response.status).toBe(200);
        expect(response.body.data.company).toBe(info.company);
        expect(response.body.data.company_email).toBe(info.company_email);
        expect(response.body.data.position).toBe(info.position);
        expect(response.body.data.id).toBe(info.id);
      });

      it("Respond 400 on invalid id", async () => {
        const response = await request.delete(`${endpoint}/invalid`).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(400);
      });

      it("Respond 404 for valid but nonexisting id", async () => {
        const response = await request.delete(
          `${endpoint}/${faker.datatype.uuid()}`
        ).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(404);
      });
    });

  });
  
});
