import { PrismaClient } from "@prisma/client";
import PortfolioDao from "./PortfolioDao.js";
import ApiError from "../util/ApiError.js";
import { factory } from "../util/debug.js";
import TagDao from "./TagDao.js";
import { z } from "zod";
import { config } from "../Constants.js";

// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);
const portfolioDao = new PortfolioDao();
const tagDao = new TagDao();

const validUuid = z.string().uuid("Invalid uuid!");
const validTitle = z.string().min(1, "Missing Title Attribute!");
const validDescription = z.string()

class PortfolioItemDao {
  // portfolio             Portfolio   @relation(fields: [portfolioId], references: [id])
  // portfolioId           String      @unique
  // title                 String
  // description           String?
  // date_added            DateTime    @default(now())
  // tags                  Tag[]
  // img                   String?

  async getPortfolioByUserId(userId) {
    const portfolios = await portfolioDao.readAll({ userId });
    if (portfolios.length === 0) {
      throw new ApiError(404, "User Portfolio Not Found");
    }
    const portfolio = portfolios[0];
    if (!portfolio) {
      throw new ApiError(404, "Resource not found!");
    }
    return portfolio;
  }


  async create({ userId, title, description, img, tags }) {
    const portfolio = await this.getPortfolioByUserId(userId);
    
    debug("Validating the user id...");
    let result = validUuid.safeParse(userId);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }
    debug("Validating the title...");
    result = validTitle.safeParse(title);
    if (!result.success) {
      throw new ApiError(400, "Invalid Title!");
    }
    debug("Validating the description...");
    result = validDescription.safeParse(description);
    if (!result.success) {
      throw new ApiError(400, "Invalid Description!");
    }
    debug("Validating the tags...");
    if (tags !== undefined) {
      let success = Array.isArray(tags);
      if (!success) {
        throw new ApiError(400, "Invalid Tags list!");
      }
    } else {
      tags = [];
    }
    

    const portfolioItem = await prisma.portfolioItem.create({
      data: { 
        portfolioId: portfolio.id,
        title: title,
        description: description,
        tags: tags,
        img: img
       },
    });

    await portfolioDao.addPortfolioItem(userId, portfolioItem.id);
    
    return portfolioItem;
  }

  async read(id) {
    debug("Validating the portfolio item id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Portfolio Item ID!");
    }

    debug("Reading the portfolio item row...");
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: {
        id: id,
      },
    });

    if (!portfolioItem) {
      throw new ApiError(404, "Resource not found!");
    }

    return portfolioItem;
  }

  async readAll({ userId, title, description, img, tags }) {
    let filter = {};
    if (userId) {
      const portfolio = await this.getPortfolioByUserId(userId);
      filter.portfolioId = portfolio.id;
    }
    if (title) {
      filter.title = title;
    }
    if (description) {
      filter.description = description;
    }
    if (tags) {
      filter.tags = tags;
    }
    if (img) {
      filter.img = img;
    }
    debug("Reading all portfolio documents...");
    const portfolios = await prisma.portfolioItem.findMany({ where: filter });
    return portfolios;
  }

  async update({ id, title, description, img, tags }) {  
    debug("Validating the portfolio item id...");
    let result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Portfolio Item ID!");
    }
    if (title !== undefined) {
      debug("Validating the title...");
      result = validTitle.safeParse(title);
      if (!result.success) {
        throw new ApiError(400, "Invalid Title!");
      }
    }
    if (description !== undefined) {
      debug("Validating the description...");
      result = validDescription.safeParse(description);
      if (!result.success) {
        throw new ApiError(400, "Invalid Description!");
      }
    }
    if (img !== undefined) {
      debug("Validating the image...");
      result = validDescription.safeParse(img);
      if (!result.success) {
        throw new ApiError(400, "Invalid Image!");
      }
    }
    
    let portfolioItem = await prisma.portfolioItem.update({
      where: {
        id: id,
      },
      data: {  
        title,
        description,
        img,
        tags,
       }
    });

    
    // if (tags !== undefined) {
    //   debug("Validating the tags...");
    //   let success = Array.isArray(tags);
    //   if (!success) {
    //     throw new ApiError(400, "Invalid Tags list!");
    //   }
    //   const tag_objs = tagDao.readList({tag_list: tags})
    //   portfolioItem = await prisma.portfolioItem.update({
    //     where: {
    //       id: id,
    //     },
    //     data: {
    //       tags: {
    //         connect: tag_objs
    //       }
    //      },
    //      include: {
    //       tags: true
    //      }
    //   });
    // }

    return portfolioItem;
  }

  async delete(id) {
    debug("Validating the portfolio item id...");
    let result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Portfolio Item ID!");
    }

    debug("Deleting the portfolioItem row..");
    const portfolioItem = await prisma.portfolioItem.delete({
      where: {
        id: id,
      },
    });
    if (!portfolioItem) {
      throw new ApiError(404, "Resource not found!");
    }

    return portfolioItem;
  }

  async deleteAll() {
    debug("Deleting all portfolioItem rows..");
    await prisma.portfolioItem.deleteMany({});
  }

}

export default PortfolioItemDao;