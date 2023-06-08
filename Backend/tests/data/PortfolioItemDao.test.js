import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import PortfolioItemDao from "../../data/PortfolioItemDao.js";
import PortfolioDao from "../../data/PortfolioDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();

const portfolioItemDao = new PortfolioItemDao();
const portfolioDao = new PortfolioDao();
const userDao = new UserDao();


describe("Test PortfolioDao", () => {
  const numPortfolioItems = 5;
  let user;
  let portfolio;
  let portfolioItems;

  beforeAll(async () => {
    await prisma.$connect();
    // await portfolioItemDao.deleteAll({});
  });

  beforeEach(async () => {
    portfolioItems = [];
    //await portfolioItemDao.deleteAll({});
    //await portfolioDao.deleteAll({});
    //await userDao.deleteAll({});
    const first_name = faker.name.firstName();
    const last_name = faker.name.lastName();
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password(6);
    // only professional artists will have a portfolio
    let role = "PROFESSIONAL";
    user = await userDao.create({ first_name, last_name, username, email, password, role });
    const userId = user.id;
    portfolio = await portfolioDao.create({ userId });
    const portfolioId = portfolio.id;
    for (let index = 0; index < numPortfolioItems; index++) {
      const title = faker.name.firstName();
      const description = faker.name.lastName();
      const tags = ["watercolor", "realism"]; 
      const img = faker.image.imageUrl();
      // if can use prisma uncomment below
      // const portfolioItem = await portfolioItemDao.create({ 
      //   data: {
      //   portfolioId,
      //   title,
      //   description,
      //   tags,
      //   img
      //   }
      // });

      const portfolioItem = await portfolioItemDao.create({ 
        userId,
        title,
        description,
        tags,
        img
      });

      portfolioItems.push(portfolioItem);
    }
  });

  it("test create()", async () => {
    const userId = user.id;
    const title = faker.name.firstName();
    const description = faker.name.lastName();
    const tags = ["watercolor", "realism"]; 
    const img = faker.image.imageUrl();
    const _portfolioItem = await portfolioItemDao.create({ userId, title, description, tags, img });
    expect(_portfolioItem.title).toBe(title);
    expect(_portfolioItem.description).toBe(description);
  });

  it("test readAll()", async () => {
    const portfolioItems = await portfolioItemDao.readAll({});
    expect(portfolioItems.length).toBe(portfolioItems.length);
  });

  it("test readAll() given a userId", async () => {
    const _portfolioItems = await portfolioItemDao.readAll({ userId: user.id });
    expect(_portfolioItems.length).toBeGreaterThanOrEqual(1);
  });


  it("test read() given valid ID", async () => {
    const index = Math.floor(Math.random() * numPortfolioItems);
    const portfolioItem = portfolioItems[index];
    const _portfolioItem = await portfolioItemDao.read(portfolioItem.id);
    expect(_portfolioItem.title).toBe(portfolioItem.title);
    expect(_portfolioItem.description).toBe(portfolioItem.description);
  });

  it("test read() given invalid ID", async () => {
    try {
      await portfolioItemDao.read("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  // it("test update() given valid ID", async () => {
  //   const index = Math.floor(Math.random() * numPortfolioItems);
  //   const portfolioItem = portfolioItems[index];
  //   const title = faker.random.word();
  //   const description = faker.lorem.sentence();
  //   const _portfolioItem = await portfolioItemDao.update({
  //     id: portfolioItem.id,
  //     title,
  //     description,
  //   });

  //   expect(_portfolioItem.title).toBe(title);
  //   expect(_portfolioItem.description).toBe(description);
  //   expect(_portfolioItem.id).toBe(user.id);
  //   expect(_portfolioItem.role).toBe(role);
  // });


  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numPortfolioItems);
    const portfolioItem = portfolioItems[index];
    const _portfolioItem = await portfolioItemDao.delete(portfolioItem.id);
    expect(_portfolioItem.title).toBe(portfolioItem.title);
    expect(_portfolioItem.description).toBe(portfolioItem.description);
    expect(_portfolioItem.id).toBe(portfolioItem.id);
    expect(_portfolioItem.img).toBe(portfolioItem.img);
  });

  afterAll(async () => {
    // await userDao.deleteAll();
    // await portfolioItemDao.deleteAll({});
  });
});
