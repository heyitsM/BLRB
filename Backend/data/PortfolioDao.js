import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import ApiError from "../util/ApiError.js";
import { factory } from "../util/debug.js";
import UserDao from "./UserDao.js";
import { config } from "../Constants.js";

// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);
const userDao = new UserDao();

const validUuid = z.string().uuid("Invalid uuid!");

class PortfolioDao {

  async create({ userId }) {

    debug("Validating the user id...");
    const result = validUuid.safeParse(userId);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }

    debug("Checking to see if user exists");
    try {
      const user = await userDao.read(userId);
    } catch (err) {
      throw new ApiError(404, "Non existant user");
    }

    debug("Checking to see if portfolio exists");
    await this.getPortfolioByUserId(userId);

    debug("Creating the portfolio...");
    const portfolio = await prisma.portfolio.create({
      data: { 
        userId: userId,
        items: {
          connect: []
        }
       },

    });

    return portfolio;
  }

  async getPortfolioByUserId(userId) {
    const portfolios = await this.readAll({ userId });
    if (portfolios.length !== 0) {
      throw new ApiError(404, "User Portfolio Already Exists");
    }
    return portfolios;
  }

  async readAll({ userId }) {
    let filter = {};
    if (userId) {
      filter.userId = userId;
    }

    debug("Reading all portfolio documents...");
    const portfolios = await prisma.portfolio.findMany({ where: filter });
    return portfolios;
  }

  async read(id) {
    debug("Validating the portfolio id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Portfolio ID!");
    }

    debug("Reading the portfolio row...");
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: id,
      },
    });

    if (!portfolio) {
      throw new ApiError(404, "Resource not found!");
    }

    return portfolio;
  }
  async update({userId, items}) {
    debug("Validating the portfolio id...");
    let result = validUuid.safeParse(userId);
    if (!result.success) {
      throw new ApiError(400, "Invalid Portfolio ID!");
    }

    debug("Validating the items...");
    if (items !== undefined) {
      let success = Array.isArray(items);
      if (!success) {
        throw new ApiError(400, "Invalid Portfolio Items list!");
      }
    }

    debug("Updating the portfolio...");
    const portfolio = await prisma.portfolio.update({
      where: {
        userId: userId,
      },
      data: { items },
    });

    if (!portfolio) {
      throw new ApiError(404, "Resource not found!");
    }

    return portfolio;
    
  }

  async addPortfolioItem(userId, portfolioItemId) {
    const portfolio = await prisma.portfolio.update({
      where: {
        userId: userId,
      },
      data: { 
        items: {
          connect: {
            id: portfolioItemId
          }
        }
      },
    });

    if (!portfolio) {
      throw new ApiError(404, "Resource not found!");
    }
    return portfolio;
  }

  async delete(id) {
    debug("Validating the portfolio id...");
    let result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Portfolio ID!");
    }

    debug("Deleting the portfolio row..");
    const portfolio = await prisma.portfolio.delete({
      where: {
        id: id,
      },
    });
    if (!portfolio) {
      throw new ApiError(404, "Resource not found!");
    }

    return portfolio;
  }

  async deleteAll({userId}) {
    if (userId !== undefined) {
      debug("Validating the portfolio id...");
      let result = validUuid.safeParse(userId);
      if (!result.success) {
        throw new ApiError(400, "Invalid Portfolio ID!");
      }
      await prisma.deleteMany({
        where: {
          userId: userId,
        },
      });
      return;
    }

    debug("Deleting all portfolio rows..");
    await prisma.portfolio.deleteMany({});
  }
}

export default PortfolioDao;