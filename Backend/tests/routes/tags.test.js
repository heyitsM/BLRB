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

const endpoint = '/tags';
import app from "../../index.js";
import { tagDAO } from "../../routes/tags.js";

const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
    let token;

    beforeAll(() => {
        token = createToken({user:"user", role:"ADMIN"});
    })
    it("GET returns 200 with no body", async () => {
        const response = await request.get(endpoint).set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("GET returns 200 with tag_info input", async () => {
        const response = await request.get(`${endpoint}?info=Trans`);
        expect(response.status).toBe(200);
    });
});