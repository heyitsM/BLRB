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
import { commissionDao } from "../../routes/commissions.js";
import app from "../../index.js";

const endpoint = "/commissions";
const request = new supertest(app);

const statuses = [
  "REQUESTED",
  "PENDING",
  "REJECTED",
  "ACCEPTED",
  "PAID",
  "COMPLETED",
];

const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  const numCommissions = 5;
  let users;
  let tokens;
  let commissions;

  beforeAll(async () => {
    // await commissionDao.deleteAll();
  });

  beforeEach(async () => {
    // await commissionDao.deleteAll();
    // await userDao.deleteAll();
    users = [];
    commissions = [];
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
    // create commissions
    for (let index = 0; index < numCommissions; index++) {
      // fields: artist_id, commissioner_id, title, description, notes, price, status
      const user1 = index;
      const user2 = (index + 1) % numUsers;
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

  describe("GET request", () => {
    it("Respond 200", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(numCommissions);
    });

    it("Respond 200 searching for given artist_id", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}?artist_id=${user.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it("Respond 200 searching for given commissioner_id", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(`${endpoint}?commissioner_id=${user.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
    });

    it("Respond 200 searching for given status", async () => {
      const response = await request
        .get(`${endpoint}?status=REQUESTED`)
        .set("Authorization", `Bearer ${tokens[0]}`);
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(numCommissions);
    });
  });

  describe("GET request given ID", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numCommissions);
      const commission = commissions[index];
      const response = await request
        .get(`${endpoint}/${commission.id}`)
        .set("Authorization", `Bearer ${tokens[0]}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.artist_id).toBe(commission.artist_id);
      expect(response.body.data.commissioner_id).toBe(commission.commissioner_id);
      expect(response.body.data.title).toBe(commission.title);
      expect(response.body.data.description).toBe(commission.description);
      expect(response.body.data.notes).toBe(commission.notes);
      expect(response.body.data.price).toBe(commission.price);
      expect(response.body.data.status).toBe(commission.status);
      expect(response.body.data.id).toBe(commission.id);
    });

    it("Respond 400 on invalid commission ID", async () => {
      const response = await request
        .get(`${endpoint}/invalid}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing commission ID", async () => {
      const response = await request
        .get(`${endpoint}/${faker.datatype.uuid()}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(404);
    });
  });

  describe("POST request", () => {
    it("Respond 201", async () => {
      const user1 = Math.floor(Math.random() * numUsers);
      const user2 = Math.floor(Math.random() * numUsers);
      const artist_id = users[user1].id;
      const commissioner_id = users[user2].id;
      const title = faker.lorem.words();
      const description = faker.lorem.sentence();
      const notes = faker.lorem.sentence(6);
      const price = faker.datatype.float({ min: 0 });
      const response = await request
        .post(endpoint)
        .set("Authorization", `Bearer ${tokens[user1]}`)
        .send({
          artist_id,
          commissioner_id,
          title,
          description,
          notes,
          price,
        });
      expect(response.status).toBe(201);
      expect(response.body.data.artist_id).toBe(artist_id);
      expect(response.body.data.commissioner_id).toBe(commissioner_id);
      expect(response.body.data.title).toBe(title);
      expect(response.body.data.description).toBe(description);
      expect(response.body.data.notes).toBe(notes);
      expect(response.body.data.price).toBe(price);
      expect(response.body.data.status).toBe("REQUESTED");
      expect(response.body.data.id).toBeDefined();
    });

    describe("Respond 400", () => {
      it("missing title", async () => {
        const user1 = Math.floor(Math.random() * numUsers);
        const user2 = Math.floor(Math.random() * numUsers);
        const artist_id = users[user1].id;
        const commissioner_id = users[user2].id;
        const title = "";
        const description = faker.lorem.sentence();
        const notes = faker.lorem.sentence(6);
        const price = faker.datatype.float({ min: 0 });
        const response = await request
          .post(endpoint)
          .set("Authorization", `Bearer ${tokens[user1]}`)
          .send({
            artist_id,
            commissioner_id,
            title,
            description,
            notes,
            price,
          });
        expect(response.status).toBe(400);
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
        const response = await request
          .post(endpoint)
          .set("Authorization", `Bearer ${tokens[user1]}`)
          .send({
            artist_id,
            commissioner_id,
            title,
            description,
            notes,
            price,
          });
        expect(response.status).toBe(400);
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
        const response = await request
          .post(endpoint)
          .set("Authorization", `Bearer ${tokens[user1]}`)
          .send({
            artist_id,
            commissioner_id,
            title,
            description,
            notes,
            price,
          });
        expect(response.status).toBe(400);
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
        const response = await request
          .post(endpoint)
          .set("Authorization", `Bearer ${tokens[user1]}`)
          .send({
            artist_id,
            commissioner_id,
            title,
            description,
            notes,
            price,
          });
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("invalid artist_id", async () => {
        const user2 = Math.floor(Math.random() * numUsers);
        const artist_id = faker.datatype.uuid();
        const commissioner_id = users[user2].id;
        const title = faker.lorem.words();
        const description = faker.lorem.sentence();
        const notes = faker.lorem.sentence(6);
        const price = faker.datatype.float({ min: 0 });
        const response = await request
          .post(endpoint)
          .set("Authorization", `Bearer ${tokens[user2]}`)
          .send({
            artist_id,
            commissioner_id,
            title,
            description,
            notes,
            price,
          });
        expect(response.status).toBe(404);
      });
  
      it("invalid commissioner_id", async () => {
        const user1 = Math.floor(Math.random() * numUsers);
        const artist_id = users[user1].id;
        const commissioner_id = faker.datatype.uuid();
        const title = faker.lorem.words();
        const description = faker.lorem.sentence();
        const notes = faker.lorem.sentence(6);
        const price = faker.datatype.float({ min: 0 });
        const response = await request
          .post(endpoint)
          .set("Authorization", `Bearer ${tokens[user1]}`)
          .send({
            artist_id,
            commissioner_id,
            title,
            description,
            notes,
            price,
          });
        expect(response.status).toBe(404);
      });
    });
  });

  describe("PUT request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numCommissions);
      const commission = commissions[index];
      const price = faker.datatype.float({ min: 0 });
      const status_ind = Math.floor(Math.random() * statuses.length);
      const status = statuses[status_ind];
      
      const response = await request
        .put(`${endpoint}/${commission.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`)
        .send({
          price,
          status,
        });

      expect(response.status).toBe(200);
      // ensure all others stay the same
      expect(response.body.data.artist_id).toBe(commission.artist_id);
      expect(response.body.data.commissioner_id).toBe(commission.commissioner_id);
      expect(response.body.data.title).toBe(commission.title);
      expect(response.body.data.description).toBe(commission.description);
      expect(response.body.data.notes).toBe(commission.notes);
      expect(response.body.data.id).toBeDefined(commission.id);
      // changes made to:
      expect(response.body.data.price).toBe(price);
      expect(response.body.data.status).toBe(status);
    });

    describe("Respond 400", () => {  
      it("negative price", async () => {
        const index = Math.floor(Math.random() * numCommissions);
        const commission = commissions[index];
        const price = faker.datatype.float({ min: 0 }) * -1;
        const response = await request
          .put(`${endpoint}/${commission.id}`)
          .set("Authorization", `Bearer ${tokens[index]}`)
          .send({
            price,
          });
  
        expect(response.status).toBe(400);
      });
  
      it("invalid status", async () => {
        const index = Math.floor(Math.random() * numCommissions);
        const commission = commissions[index];
        const status = "INVALID";
        const response = await request
          .put(`${endpoint}/${commission.id}`)
          .set("Authorization", `Bearer ${tokens[index]}`)
          .send({
            status,
          });
  
        expect(response.status).toBe(400);
      });
    });

    describe("Respond 404", () => {
      it("test invalid id", async () => {
        const id = faker.datatype.uuid();
        const price = faker.datatype.float({ min: 0 });
        const status_ind = Math.floor(Math.random() * statuses.length);
        const status = statuses[status_ind];
        const response = await request
          .put(`${endpoint}/${id}`)
          .set("Authorization", `Bearer ${tokens[0]}`)
          .send({
            price,
            status,
          });
  
        expect(response.status).toBe(404);
      });
    });
  });

  describe("DELETE request", () => {
    it("Respond 200", async () => {
      const index = Math.floor(Math.random() * numCommissions);
      const commission = commissions[index];
      const response = await request
        .delete(`${endpoint}/${commission.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.artist_id).toBe(commission.artist_id);
      expect(response.body.data.commissioner_id).toBe(commission.commissioner_id);
      expect(response.body.data.title).toBe(commission.title);
      expect(response.body.data.description).toBe(commission.description);
      expect(response.body.data.notes).toBe(commission.notes);
      expect(response.body.data.price).toBe(commission.price);
      expect(response.body.data.status).toBe(commission.status);
      expect(response.body.data.id).toBe(commission.id);
    });
    it("Respond 400 on invalid commission ID", async () => {
      const response = await request
        .delete(`${endpoint}/invalid}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(400);
    });
  
    it("Respond 404 for valid but non existing commission ID", async () => {
      const response = await request
        .delete(`${endpoint}/${faker.datatype.uuid()}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    // await commissionDao.deleteAll();
    // await userDao.deleteAll();
  });
});
