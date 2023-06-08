import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import supertest from "supertest";
import { PrismaClient } from "@prisma/client";
import { createToken } from "../../routes/token.js";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import { userDao } from "../../routes/users.js";
import { profileDAO } from "../../routes/profiles.js";
import app from "../../index.js";

const prisma = new PrismaClient();

const endpoint = "/profiles";
const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  let users;
  let tokens;
  let nonexisting_id;
  let nonexisting_token;

  beforeAll(async () => {
    await prisma.$connect();
    // await userDao.deleteAll({});
  });

  beforeEach(async () => {
    //await userDao.deleteAll();
    users = [];
    tokens = [];
        for (let index = 0; index < numUsers; index++) {
            const first_name = faker.name.firstName();
            const last_name = faker.name.lastName();
            const username = faker.internet.userName();
            const email = faker.internet.email();
            const password = faker.internet.password(6);
            let role_decider = Math.random();
            let role = "";
            if (role_decider < 0.3) {
                role = "RECRUITER";
            } else if (role_decider < 0.6) {
                role = "FORFUN";
            } else {
                role = "PROFESSIONAL";
            }
            const user = await userDao.create({first_name, last_name, username, email, password, role});
            const token = createToken({user:user.id, role:"NONADMIN"});
            tokens.push(token);
            users.push(user);
        }

        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const _user = await userDao.create({first_name, last_name, username, email, password, role});
        await userDao.delete(_user.id);
        nonexisting_id = _user.id;
        nonexisting_token = createToken({user:_user.id, role:"NONADMIN"});
  });

  describe("GET request", () => {
    it("Respond 200", async () => {
        const response = await request
            .get(endpoint)
            .set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
    });

    it("Respond 200 with display_name", async () => {
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const user = users[0];
        const _profile = await profileDAO.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });

        const response = await request
            .get(endpoint)
            .send({'display_name':users[0].display_name})
            .set("Authorization", `Bearer ${tokens[0]}`);

        expect(response.status).toBe(200);
    });

    it("Respond 200 with use_display_name", async () => {
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const user = users[0];
        const _profile = await profileDAO.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });

        const response = await request
            .get(endpoint)
            .send({'use_display_name':users[0].use_display_name })
            .set("Authorization", `Bearer ${tokens[0]}`);
            
        expect(response.status).toBe(200);
    });

    it("Respond 200 with bio", async () => {
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const user = users[0];
        const _profile = await profileDAO.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });

        const response = await request
            .get(endpoint)
            .send({'bio':users[0].bio})
            .set("Authorization", `Bearer ${tokens[0]}`);
            
        expect(response.status).toBe(200);
    });

    it("Respond 200 with tag", async () => {
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const user = users[0];
        const _profile = await profileDAO.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });

        const response = await request
            .get(endpoint)
            .send({'tag':users[0].tags})
            .set("Authorization", `Bearer ${tokens[0]}`);
            
        expect(response.status).toBe(200);
    });

  });

  describe("GET /search request", () => {
    it("Respond 200", async () => {
        const response = await request.get(`${endpoint}/search/?partial=disp&tags=elementary`).set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
    });
  });

  describe("POST request", () => {
    it("Respond 201 with disp name and bio", async () => {
        let index = Math.floor(Math.random() * numUsers);
        let user = users[index];
        let display_name = "name";
        let bio = "bio";

        const response = await request
            .post(`${endpoint}`)
            .set("Authorization", `Bearer ${tokens[0]}`)
            .send({user_id:user.id, display_name, bio})
        
        expect(response.status).toBe(201)
    });

    it("Respond 201 with disp name and bio and img and tags", async () => {
        let index = Math.floor(Math.random() * numUsers);
        let user = users[index];
        let display_name = "name";
        let bio = "bio";
        let img = "img";
        let tags = ["tag1", "tag2", "tag3"]

        const response = await request
            .post(`${endpoint}`)
            .set("Authorization", `Bearer ${tokens[0]}`)
            .send({user_id:user.id, display_name, bio, img, tags})
        
        expect(response.status).toBe(201)
    });

    it("Respond 400 with invalid user_id", async () => {
        let display_name = "name";
        let bio = "bio";
        const response = await request
            .post(`${endpoint}`)
            .set("Authorization", `Bearer ${tokens[0]}`)
            .send({user_id:"invalid", display_name, bio})
        expect(response.status).toBe(400);
    });

    it("Respond 404 with valid but nonexistent user_id", async () => {
        let display_name = "name";
        let bio = "bio";
        const response = await request
            .post(`${endpoint}`)
            .set("Authorization", `Bearer ${tokens[0]}`)
            .send({user_id:nonexisting_id, display_name, bio})
        expect(response.status).toBe(404);
    });
  });

  describe("DELETE request", () => {
    it("Return 200 on delete by id", async () => {
        let response = await request
            .get(endpoint)
            .set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(200);
        expect(response.body.data.length).toBeGreaterThan(0);
        let first = response.body.data[0];
        response = await request
            .delete(`${endpoint}/${first.userId}`)
            .set("Authorization", `Bearer ${tokens[0]}`);
        expect(response.status).toBe(201);
    })
  });

  afterAll(async () => {
    // await userDao.deleteAll();
  });
});