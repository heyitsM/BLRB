import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { verifyPassword } from "../../util/password.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const userDao = new UserDao();

describe("Test UserDao", () => {
    const numUsers = 3;
    let users;
    let nonexisting_id;

    beforeAll(async () => {
        await prisma.$connect();
        //await userDao.deleteAll({});
    });

    beforeEach(async () => {
        //await userDao.deleteAll();
        users = [];
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
    });

    it("test create()", async () => {
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
        expect(_user.first_name).toBe(first_name);
        expect(_user.last_name).toBe(last_name);
        expect(_user.username).toBe(username);
        expect(_user.email).toBe(email);
        expect(verifyPassword(password, _user.password)).toBe(true);
        expect(_user.id).toBeDefined();
        if (role === "PROFESSIONAL") {
            role = "PROFESSIONALY"; // because there's a typo in the db schema but I don't want to mess with everyone's code right now
        } else if (role === "FORFUN") {
            role = "FOR_FUN";
        }
        expect(_user.role).toBe(role);
    });

    it("test create() without given role", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        const _user = await userDao.create({first_name, last_name, username, email, password });

        expect(_user.first_name).toBe(first_name);
        expect(_user.last_name).toBe(last_name);
        expect(_user.username).toBe(username);
        expect(_user.email).toBe(email);
        expect(verifyPassword(password, _user.password)).toBe(true);
        expect(_user.id).toBeDefined();
        expect(_user.role).toBe(null);
    });

    describe("test create() throws error", () => {
        it("empty first_name", async () => {
            try {
                const first_name = "";
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty last_name", async () =>{
            try {
                const first_name = faker.name.firstName();
                const last_name = "";
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null first name", async () => {
            try {
                const first_name = null;
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null last name", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = null;
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("undefined first name", async () => {
            try {
                const first_name = undefined;
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("undefined last name", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = undefined;
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty email", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = "";
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null email", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = null;
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("undefined email", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = undefined;
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("invalid email", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.lorem.sentence();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("test email is not unique", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });

                const second_first_name = faker.name.firstName();
                const second_last_name = faker.name.lastName();
                const second_username = faker.name.firstName();
                const second_password = faker.internet.password(6);
                await userDao.create({first_name:second_first_name, last_name:second_last_name, username:second_username, email:email, password:second_password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty username", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = "";
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null username", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = null;
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("undefined email", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = undefined;
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("test username is not unique", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                await userDao.create({first_name, last_name, username, email, password });

                const second_first_name = faker.name.firstName();
                const second_last_name = faker.name.lastName();
                const second_email = faker.internet.email();
                const second_password = faker.internet.password(6);
                await userDao.create({first_name:second_first_name, last_name:second_last_name, username:username, email:second_email, password:second_password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty password", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = "";
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null password", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = null;
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("undefined password", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = undefined;
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("short password", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(5);
                await userDao.create({first_name, last_name, username, email, password });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("test role is null", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                const role = null;
                await userDao.create({first_name, last_name, username, email, password, role });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("test role is undefined", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                const role = undefined;
                await userDao.create({first_name, last_name, username, email, password, role });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("test role is empty", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                const role = "";
                await userDao.create({first_name, last_name, username, email, password, role });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("test role is invalid", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                const role = faker.random.word();
                await userDao.create({first_name, last_name, username, email, password, role });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });
    });

    //may be unreliable because we are not using local db when testing
    it("test readAll()", async () => {
        const users = await userDao.readAll({});
        //greater than or equal to because there are more users in the db- changing
        expect(users.length).toBeGreaterThanOrEqual(users.length);
    });

    it("test readAll() given a username", async () => {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        const _users = await userDao.readAll({ username: user.username });
        expect(_users.length).toBe(1);
    });

    it("test readAll() given an email", async () => {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        const _users = await userDao.readAll({ email: user.email });
        expect(_users.length).toBe(1);
    });

    it("test readAll() given a role", async () => {
        const roles = ["RECRUITER", "PROFESSIONAL", "FORFUN"];

        for (let role of roles) {
            const count = users.reduce((total, user) => {
                if (user.role === role) {
                    total += 1;
                }
                return total;
            }, 0);

            const _users = await userDao.readAll({ role });
            expect(_users.length).toBeGreaterThanOrEqual(count);
        }
    });

    it("test read() given valid ID", async () => {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        const _user = await userDao.read(user.id);

        expect(_user.first_name).toBe(user.first_name);
        expect(_user.last_name).toBe(user.last_name);
        expect(_user.username).toBe(user.username);
        expect(_user.email).toBe(user.email);
        expect(_user.password).toBe(user.password); // should I be returning a hashed password? or non hashed
        expect(_user.id).toBe(user.id);
        expect(_user.role).toBe(user.role);
    });

    it("test read() given invalid ID", async () => {
        try {
            await userDao.read("invalid");
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    //may or may not work
    it("test read() given valid but non-existing ID", async () => {
        try {
            await userDao.read(nonexisting_id);
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    it("test update() given valid ID", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
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

        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        let id = user.id;
        const _user = await userDao.update({
            id:id,
            first_name, 
            last_name, 
            email, 
            password, 
            role 
        });

        if (role === "PROFESSIONAL") {
            role = "PROFESSIONALY"; // because there's a typo in the db schema but I don't want to mess with everyone's code right now
        } else if (role === "FORFUN") {
            role = "FOR_FUN";
        }

        expect(_user.first_name).toBe(first_name);
        expect(_user.last_name).toBe(last_name);
        expect(_user.email).toBe(email);
        expect(verifyPassword(password, _user.password)).toBe(true);
        expect(_user.id).toBe(user.id);
        expect(_user.role).toBe(role);
    });

    it("test update() given invalid ID", async () => {
        try {
            await userDao.update({ id: "invalid" });
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test update() given valid but non-existing ID", async () => {
        try {
            await userDao.update({ id: nonexisting_id });
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    it("test update() given invalid name", async () => {
        try {
            const index = Math.floor(Math.random() * numUsers);
            const user = users[index];
            const first_name = "";
            await userDao.update({
                id: user.id,
                first_name,
            });
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test update() given invalid email", async () => {
        try {
            const index = Math.floor(Math.random() * numUsers);
            const user = users[index];
            const email = faker.name.fullName();
            await userDao.update({
                id: user.id,
                email,
            });
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test update() given duplicate email", async () => {
        try {
            const index1 = Math.floor(Math.random() * numUsers);
            const user1 = users[index1];
            const index2 = (index1 + 1) % numUsers;
            const user2 = users[index2];
            await userDao.update({
                id: user1.id,
                email: user2.email,
            });
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test update() given invalid password", async () => {
        try {
            const index = Math.floor(Math.random() * numUsers);
            const user = users[index];
            const password = faker.internet.password(5);
            await userDao.update({
                id: user.id,
                password,
            });
        } catch (err) {
        expect(err.status).toBe(400);
        }
    });

    it("test update() given invalid role", async () => {
        try {
            const index = Math.floor(Math.random() * numUsers);
            const user = users[index];
            const role = faker.random.word();
            await userDao.update({
                id: user.id,
                role,
            });
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test delete() given valid ID", async () => {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        const _user = await userDao.delete(user.id);

        expect(_user.first_name).toBe(user.first_name);
        expect(_user.last_name).toBe(user.last_name);
        expect(_user.username).toBe(user.username);
        expect(_user.email).toBe(user.email);
        expect(_user.password).toBe(user.password);
        expect(_user.id).toBe(user.id);
        expect(_user.role).toBe(user.role);
    });

    it("test delete() given invalid ID", async () => {
        try {
            await userDao.delete("invalid");
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test delete() given valid but non-existing ID", async () => {
        try {
            await userDao.delete(nonexisting_id);
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    afterAll(async () => {
        // await userDao.deleteAll({});
        await prisma.$disconnect();
    });
});