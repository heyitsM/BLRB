import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import TagDao from "../../data/TagDao.js";
import UserDao from "../../data/UserDao.js";
import ProfileDao from "../../data/ProfileDao.js";

const prisma = new PrismaClient();

const tagDao = new TagDao();
const userDao = new UserDao();
const profileDao = new ProfileDao();


describe("Test TagDao", () => {
    const numUsers = 2;
    let users;
    let profiles;
  
    beforeAll(async () => {
      await prisma.$connect();
    });
  
    beforeEach(async () => {
      users = [];
      profiles = [];
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
      for (let index = 0; index < numUsers; index++) {
        // fields: id, commission_rules, accepting_commissions, stripeAccountID
        const id = users[index].id;
        const display_name = faker.random.word();
        const bio = faker.random.words();

        const profile = await profileDao.create({user_id:id, display_name, bio, use_display_name:true});
        profiles.push(profile);
      }
    });

    it("ReadAll functions correctly", async () => {
        const resp = await tagDao.readAll();
        expect(resp.length).toBeGreaterThan(0);
    });

    it("Read functions correctly", async () => {
        let resp = await prisma.tag.findMany();
        resp=resp[0]["tag_info"];
        const results = await tagDao.read({tag_info:resp});
        expect(results["tag_info"]).toBe(resp);
    });

    it("Readlist functions correctly", async () => {
        const resp = await prisma.tag.findMany();
        const selected = Math.ceil(resp.length / 10);
        let getSelected = [];
        for (let i = 0; i < selected; i++) {
            getSelected.push(resp[i]["tag_info"]);
        }
        const results = await tagDao.readList({tag_list:getSelected});
        expect(results.length).toBe(selected);
    });

    it("Read associated users functions correctly", async () => {
        let resp = await prisma.tag.findMany();
        resp=resp[0]["tag_info"];
        const addToProfile = await profileDao.update({user_id:users[0].id, tags:[resp], tag_connect:true});
        const results = await tagDao.readAssociatedUsers({tag_info:resp});
        expect(results["users"].length).toBeGreaterThan(0);
    });

    it("Delete tag functions correctly", async () => {
        let resp = await prisma.tag.findMany();
        resp=resp[0]["tag_info"];
        const results = await tagDao.delete({tag_info:resp});
        expect(results["tag_info"]).toBe(resp);
    });
});