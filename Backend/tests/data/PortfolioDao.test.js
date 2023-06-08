import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import PortfolioDao from "../../data/PortfolioDao.js";
import PortfolioItemDao from "../../data/PortfolioItemDao.js";
import UserDao from "../../data/UserDao.js";

const prisma = new PrismaClient();
// run inside `async` function

const portfolioItemDao = new PortfolioItemDao();
const portfolioDao = new PortfolioDao();
const userDao = new UserDao();

describe("Test PortfolioDao", () => {
  const numUsers = 5;
  let users;
  let portfolios;

  beforeAll(async () => {
    await prisma.$connect();
    // await portfolioItemDao.deleteAll({});
    // await portfolioDao.deleteAll({});
  });

  beforeEach(async () => {
    // await portfolioDao.deleteAll({});
    // await userDao.deleteAll({});
    users = [];
    portfolios = [];
    for (let index = 0; index < numUsers; index++) {
      const first_name = faker.name.firstName();
      const last_name = faker.name.lastName();
      const email = faker.internet.email();
      const username = faker.internet.userName();
      const password = faker.internet.password(6);
      // only professional artists will have a portfolio
      let role = "PROFESSIONAL";
      
      const user = await userDao.create({ first_name, last_name, username, email, password, role });
      const portfolio = await portfolioDao.create({ userId: user.id });
      users.push(user);
      portfolios.push(portfolio)
    }
  });

  it("test create()", async () => {
    const first_name = faker.name.firstName();
    const last_name = faker.name.lastName();
    const email = faker.internet.email();
    const username = faker.internet.userName();
    const password = faker.internet.password(6);
    // only professional artists will have a portfolio
    let role = "PROFESSIONAL";
    const user = await userDao.create({ first_name, last_name, username, email, password, role });
    const userId = user.id;
    const _portfolio = await portfolioDao.create({ userId });
    expect(_portfolio.userId).toBe(userId);
  });

  describe("test create() throws error", () => {
    it("no userId", async () => {
      try {
        await portfolioDao.create({});
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("invalid userId", async () => {
      try {
        const userId = faker.random.word();
        await portfolioDao.create({ userId });
      } catch (err) {
        expect(err.status).toBe(400);
      }
    });

    it("existing userId", async () => {
      try {
        const index = Math.floor(Math.random() * numUsers);
        const user = users[index];
        await portfolioDao.create({ userId: user.id });
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });
  });

  it("test readAll()", async () => {
    const portfolios = await portfolioDao.readAll({});
    expect(portfolios.length).toBe(portfolios.length);
  });

  it("test readAll() given a userId", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const user = users[index];
    const _users = await portfolioDao.readAll({ userId: user.id });
    expect(_users.length).toBeGreaterThanOrEqual(1);
  });

  it("test read() given valid ID", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const portfolio = portfolios[index];
    const _portfolio = await portfolioDao.read(portfolio.id);
    expect(_portfolio.userId).toBe(portfolio.userId);
    expect(_portfolio.items).toBe(portfolio.items);
  });

  it("test read() given invalid ID", async () => {
    try {
      await portfolioDao.read("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  it("test delete() given valid ID", async () => {
    const index = Math.floor(Math.random() * numUsers);
    const portfolio = portfolios[index];
    const _portfolio = await portfolioDao.delete(portfolio.id);
    expect(_portfolio.userId).toBe(portfolio.userId);
  });

  it("test delete() given invalid ID", async () => {
    try {
      await portfolioDao.delete("invalid");
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });

  afterAll(async () => {
    // await portfolioDao.deleteAll({});
  });
});
