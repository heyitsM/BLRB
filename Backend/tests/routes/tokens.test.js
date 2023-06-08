import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { createToken, decodeToken } from "../../routes/token.js";
import jsonWebToken from "jsonwebtoken";


dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import { userDao } from "../../routes/users.js";
import app from "../../index.js";

const endpoint = "/users";
const request = new supertest(app);

describe(`Test tokens`, () => {
    let validTokens;
    let numValid = 1;

    let validButNotExistingTokens;
    let numValidButNotExisting = 1;

    let invalidTokens;
    let numInvalid = 1;

    let expiredTokens;
    let numExpired = 1;

    let adminTokens;
    let numAdmin = 1;

    let users;
    let firstPassword;

    beforeEach(async () => {
        validTokens = [];
        validButNotExistingTokens = [];
        invalidTokens = [];
        expiredTokens = [];
        adminTokens = [];
        users = [];

        for (let i = 0; i < numValid; i++) {
            const first_name = faker.name.firstName();
            const last_name = faker.name.lastName();
            const username = faker.internet.userName();
            const email = faker.internet.email();
            const password = faker.internet.password(6);
            if (i === 0) {
                firstPassword = password;
            }
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
            users.push(user);
            validTokens.push(token);
        }

        for (let i = 0; i < numExpired; i++) {
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
            const token = jsonWebToken.sign(
                {
                    id:user.id, 
                    role:"NONADMIN"
                }, 
                process.env.JWT_SECRET, 
                {
                    algorithm: "HS256",
                    expiresIn: "0d",
                }
            );
            users.push(user);
            expiredTokens.push(token);
        }

        for (let i = 0; i < numAdmin; i++) {
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
            const token = jsonWebToken.sign(
                {
                    id:user.id, 
                    role:"ADMIN"
                }, 
                process.env.JWT_SECRET, 
                {
                    algorithm: "HS256",
                    expiresIn: "1d",
                }
              );
            users.push(user);
            adminTokens.push(token);
        }

        for (let i = 0; i < numValidButNotExisting; i++) {
            const token = jsonWebToken.sign(
                {
                    id:faker.datatype.uuid(), 
                    role:"NONADMIN"
                }, 
                process.env.JWT_SECRET, 
                {
                    algorithm: "HS256",
                    expiresIn: "1d",
                }
            );
            validButNotExistingTokens.push(token);
        }

        for (let i = 0; i < numInvalid; i++) {
            const token = jsonWebToken.sign(
                {
                    id:";asdlkfjaldskjasdf", 
                    role:"NONADMIN"
                }, 
                process.env.JWT_SECRET, 
                {
                    algorithm: "HS256",
                    expiresIn: "1d",
                }
            );
            invalidTokens.push(token);
        }
    });

    describe('User login/creation returns a token', () => {
        it("Respond with a valid token on user creation", async () => {
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

            const response = await request
                .post(endpoint)
                .send({
                first_name, 
                last_name, 
                username, 
                email, 
                password, 
                role
                });

            expect(response.body.token).toBeTruthy();
            let { id } = decodeToken(response.body.token);
            expect(id).toBe(response.body.data.id);
        });

        it("Respond with a valid token on user login", async () => {
            const response = await request
                .post('/login')
                .send({
                    email:users[0].email, 
                    password:firstPassword
                });

            expect(response.status).toBe(201);
            expect(response.body.token).toBeTruthy();
            let { id } = decodeToken(response.body.token);
            expect(id).toBe(response.body.data.userId);
        });
    });

    describe('Valid tokens', () => {
        it("Can GET user with token encoding a valid and existing id", async () => {
            let validToken = validTokens[0];
            const response = await request
                .get(`${endpoint}`)
                .set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(200);
        })

        it("Can GET specific user with token encoding a valid and existing id", async () => {
            let validUser = users[0];
            let validToken = validTokens[0];
            const response = await request
                .get(`${endpoint}/${validUser.id}`)
                .set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(200);
        })

        it("Can PUT user SELF with token encoding a valid and existing id", async () => {
            let validUser = users[0];
            let validToken = validTokens[0];
            const response = await request
                .put(`${endpoint}/${validUser.id}`)
                .send({last_name:"Berger"})
                .set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(200);
        })

        it("Can DELETE user SELF with token encoding a valid but existing id", async () => {
            let validUser = users[0];
            let validToken = validTokens[0];
            const response = await request
                .delete(`${endpoint}/${validUser.id}`)
                .set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(200);
        })

        it("Cannot PUT user OTHER with token encoding a valid and existing id", async () => {
            let validUser = users[1];
            let validToken = validTokens[0];
            const response = await request
                .put(`${endpoint}/${validUser.id}`)
                .send({last_name:"Berger"})
                .set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(403);
        });
        
        it("Cannot DELETE user OTHER with token encoding a valid and existing id", async () => {
            let validUser = users[1];
            let validToken = validTokens[0];
            const response = await request
                .delete(`${endpoint}/${validUser.id}`)
                .set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(403);
        });

        it("Cannot DELETE ALL with token encoding a valid and existing id, with role NONADMIN", async () => {
            let validUser = users[0];
            let validToken = validTokens[0];
            const response = await request.delete(`${endpoint}`).set("Authorization", `Bearer ${validToken}`);
            expect(response.status).toBe(403);
        });
    });

    describe('Invalid tokens', () => {
        it("Cannot GET user with token encoding an invalid id", async () => {
            const response = await request.get(endpoint).set("Authorization", `Bearer ${invalidTokens[0]}`);
            expect(response.status).toBe(403);
        });

        it("Cannot GET specific user with token encoding an invalid id", async () => {
            let validUser = users[0];
            const response = await request
                .get(`${endpoint}/${validUser.id}`)
                .set("Authorization", `Bearer ${invalidTokens[0]}`);
            expect(response.status).toBe(403);
        });

        it("Cannot PUT user with token encoding an invalid id", async () => {
            let validUser = users[0];
            const response = await request
                .put(`${endpoint}/${validUser.id}`)
                .send({last_name:"Berger"})
                .set("Authorization", `Bearer ${invalidTokens[0]}`);
            expect(response.status).toBe(403);
        });

        it("Cannot DELETE user with token encoding an invalid id", async () => {
            let validUser = users[0];
            const response = await request
                .delete(`${endpoint}/${validUser.id}`)
                .set("Authorization", `Bearer ${invalidTokens[0]}`);
            expect(response.status).toBe(403);
        });
        
    });

    describe('Expired tokens', () => {
        it("Cannot GET user with expired token", async () => {
            const response = await request.get(endpoint).set("Authorization", `Bearer ${expiredTokens[0]}`);
            expect(response.status).toBe(401);
        });
    });

    describe('Admin tokens', () => {

    });
});
