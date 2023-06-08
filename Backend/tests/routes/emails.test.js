import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { createToken } from "../../routes/token.js";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import app from "../../index.js";
const request = new supertest(app);

describe(`Test emails`, () => {
    let token;
    let user;
    beforeAll(async () => {
        let temptoken = createToken({user:"user", role:"ADMIN"})
        user = await request.get('/users').set("Authorization", `Bearer ${temptoken}`);
        user = user.body.data[0]
        token = createToken({user:user.id, role:"NONADMIN"});
    });

    it("Test email on account creation", async () => {
        const first_name = faker.name.firstName();
        const email = faker.internet.email();
        const response = await request
            .post('/usercreation')
            .send({'name':first_name, 'email':email})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("Test email on request started", async () => {
        const first_name1 = faker.name.firstName();
        const email1 = faker.internet.email();
        const first_name2 = faker.name.firstName();
        const email2 = faker.internet.email();
        const id = faker.random.word();

        const response = await request
            .post('/requeststarted')
            .send({'req_name':first_name1, 'req_email':email1, 'pro_name':first_name2, 'pro_email':email2, 'commission_id':id})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("Test email on request denied", async () => {
        const first_name1 = faker.name.firstName();
        const email1 = faker.internet.email();
        const first_name2 = faker.name.firstName();
        const email2 = faker.internet.email();
        const id = faker.random.word();

        const response = await request
            .post('/requestdenied')
            .send({'req_name':first_name1, 'req_email':email1, 'pro_name':first_name2, 'pro_email':email2, 'commission_id':id})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("Test email on request accepted", async () => {
        const first_name1 = faker.name.firstName();
        const email1 = faker.internet.email();
        const first_name2 = faker.name.firstName();
        const email2 = faker.internet.email();
        const id = faker.random.word();
        const price = Math.random() * 100;
        const response = await request
            .post('/requestaccepted')
            .send({'price':price, 'req_name':first_name1, 'req_email':email1, 'pro_name':first_name2, 'pro_email':email2, 'commission_id':id})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("Test email on payment confirmed", async () => {
        const first_name1 = faker.name.firstName();
        const email1 = faker.internet.email();
        const first_name2 = faker.name.firstName();
        const email2 = faker.internet.email();
        const id = faker.random.word();
        const price = Math.random() * 100;
        const response = await request
            .post('/paymentconfirmed')
            .send({'price':price, 'req_name':first_name1, 'req_email':email1, 'pro_name':first_name2, 'pro_email':email2, 'commission_id':id})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("Test email on payment canceled", async () => {
        const first_name1 = faker.name.firstName();
        const email1 = faker.internet.email();
        const first_name2 = faker.name.firstName();
        const email2 = faker.internet.email();
        const id = faker.random.word();
        const response = await request
            .post('/paymentcanceled')
            .send({'req_name':first_name1, 'req_email':email1, 'pro_name':first_name2, 'pro_email':email2, 'commission_id':id})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });

    it("Test email on commission complete", async () => {
        const first_name1 = faker.name.firstName();
        const email1 = faker.internet.email();
        const first_name2 = faker.name.firstName();
        const email2 = faker.internet.email();
        const id = faker.random.word();
        const response = await request
            .post('/commissioncomplete')
            .send({'req_name':first_name1, 'req_email':email1, 'pro_name':first_name2, 'pro_email':email2, 'commission_id':id})
            .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(200);
    });
});