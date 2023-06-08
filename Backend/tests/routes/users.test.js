import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import supertest from "supertest";
import { verifyPassword } from "../../util/password.js";
import { PrismaClient } from "@prisma/client";
import { createToken } from "../../routes/token.js";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import { userDao } from "../../routes/users.js";
import app from "../../index.js";

const prisma = new PrismaClient();

const endpoint = "/users";
const request = new supertest(app);

describe(`Test ${endpoint}`, () => {
  const numUsers = 5;
  let users;
  let nonexisting_id;
  let nonexisting_token;
  let tokens;

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
            users.push(user);
            tokens.push(token);
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
        nonexisting_token = createToken({user:_user.id, role:"NONADMIN"});
        await userDao.delete(_user.id);
        
        nonexisting_id = _user.id;
  });

  describe("GET request", () => {
    it("Respond 200", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(200);
      // expect(response.body.data.length).toBeGreaterThanOrEqual(numUsers);
    });

    it("Respond 200 with username", async () => {
      const response = await request
        .get(endpoint)
        .set("Authorization", `Bearer ${tokens[0]}`)
        .send({'username':users[0].username})
        
      expect(response.status).toBe(200);
      //expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it("Respond 200 with email", async () => {
      const response = await request
        .get(endpoint)
        .send({'email':users[0].email})
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(200);
      //expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

  });

  describe("POST request", () => {
    it("Respond 201", async () => {
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
        })
        
    
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe(first_name);
      expect(response.body.data.last_name).toBe(last_name);
      expect(response.body.data.email).toBe(email);
      expect(verifyPassword(password, response.body.data.password)).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    it("Respond 201 (role not provided)", async () => {
      const first_name = faker.name.firstName();
      const last_name = faker.name.lastName();
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = faker.internet.password(6);

      const response = await request.post(endpoint).send({
        first_name, 
        last_name, 
        username, 
        email, 
        password, 
      });
    
      expect(response.status).toBe(201);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.first_name).toBe(first_name);
      expect(response.body.data.last_name).toBe(last_name);
      expect(response.body.data.email).toBe(email);
      expect(verifyPassword(password, response.body.data.password)).toBe(true);
      expect(response.body.data.role).toBe(null);
      expect(response.body.data.id).toBeDefined();
    });

    describe("Respond 400", () => {
      describe("First name testing", () => {
        it("Null first name", async () => {
          const first_name = null;
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Undefined first name", async () => {
          const first_name = undefined;
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Empty first name", async () => {
          const first_name = "";
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
      });
      
      describe("Last name testing", () => {
        it("Null last name", async () => {
          const first_name = faker.name.firstName();
          const last_name = null;
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Undefined first name", async () => {
          const first_name = faker.name.firstName();
          const last_name = undefined;
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Empty last name", async () => {
          const first_name = faker.name.firstName();
          const last_name = "";
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
      })

      describe("Email testing", () => {
        it("Null email", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = null;
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Undefined email", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = undefined;
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Empty email", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = "";
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Invalid email", async () => {
          const email = faker.lorem.sentence();
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const password = faker.internet.password(6);
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Duplicate email", async () => {
          let first_name = faker.name.firstName();
          let last_name = faker.name.lastName();
          let username = faker.internet.userName();
          let email = faker.internet.email();
          let password = faker.internet.password(6);

          let response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
          
          first_name = faker.name.firstName();
          last_name = faker.name.lastName();
          username = faker.internet.userName();
          password = faker.internet.password(6);
          response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
          expect(response.status).toBe(400);
        });
      });

      describe("Password testing", () => {
        it("Null password", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = null;
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Undefined password", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = undefined;
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Empty password", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = "";
  
          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
          });
        
          expect(response.status).toBe(400);
        });
      });

      describe("Role testing", ()=> {
        // it("Undefined role", async () => {
        //   const first_name = faker.name.firstName();
        //   const last_name = faker.name.lastName();
        //   const username = faker.internet.userName();
        //   const email = faker.internet.email();
        //   const password = faker.internet.password(6);
        //   const role = undefined;

        //   const response = await request.post(endpoint).send({
        //     first_name, 
        //     last_name, 
        //     username, 
        //     email, 
        //     password, 
        //     role
        //   });
        
        //   expect(response.status).toBe(400);
        // });
  
        it("Empty role", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
          const role = "";

          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
            role
          });
        
          expect(response.status).toBe(400);
        });
  
        it("Invalid role", async () => {
          const first_name = faker.name.firstName();
          const last_name = faker.name.lastName();
          const username = faker.internet.userName();
          const email = faker.internet.email();
          const password = faker.internet.password(6);
          const role = faker.word.noun(1);

          const response = await request.post(endpoint).send({
            first_name, 
            last_name, 
            username, 
            email, 
            password, 
            role
          });
        
          expect(response.status).toBe(400);
        });
      });
    });
  });


  describe("GET request given ID", () => {
    it("Respond 200 with valid id", async() => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];
      const response = await request
        .get(endpoint + `/${user.id}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(200);
    });

    it("Respond 400 with invalid id", async() => {
      const response = await request
        .get(endpoint + `/${nonexisting_id}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(404);
    });
  });

  describe("PUT request", () => {

    it("Respond 200 with input", async () => {
      const index = Math.floor(Math.random() * numUsers);
      const user = users[index];

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
        .put(`${endpoint}/${user.id}`)
        .set("Authorization", `Bearer ${tokens[index]}`)
        .send({
          first_name, 
          last_name, 
          username,
          password,
          role
        });
    
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(user.id);
      expect(response.body.data.first_name).toBe(first_name);
      expect(response.body.data.last_name).toBe(last_name);
      expect(response.body.data.email).toBe(user.email);
    });

  });

  describe("DELETE request", () => {

    it("Respond 401 if user id is invalid", async () => {
      const response = await request
        .delete(`${endpoint}/invalid}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      
      expect(response.status).toBe(400);
    });

    it("Respond 404 if user does not exist", async () => {
      const response = await request
        .delete(`${endpoint}/${nonexisting_id}`)
        .set("Authorization", `Bearer ${tokens[0]}`)
      expect(response.status).toBe(404);
    });
  });

  afterAll(async () => {
    // await userDao.deleteAll();
  });
});
