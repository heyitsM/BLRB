import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import UserDao from "./UserDao.js";

dotenv.config();
const debug = factory(import.meta.url);

const validString = z.string();
const validUuid = z.string().uuid("Invalid uuid!");
const validEmail = z.string().email("Invalid Email!");

// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const userDao = new UserDao();
//TODO: get email parser

class RecruiterInfoDao {
  // return the created professional artist info
  // throws ApiError when commission_rules or accepting_commissions is invalid
  async create({ id, company, position, company_email }) {
    let result;
    debug("Validating the id..");
    result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "invalid ID!");
    }
    try {
      await userDao.read(id);
    } catch (err) {
      throw new ApiError(404, "Artist user resource not found!");
    }

    if (company) {
        result = validString.safeParse(company);
        if (!result.success) {
            throw new ApiError(400, "Invalid company!");
        }
    } else {
        throw new ApiError(400, "Must provide a company!");
    }

    if (position) {
        result = validString.safeParse(position);
        if (!result.success) {
            throw new ApiError(400, "Invalid position!");
        }
    } else {
        throw new ApiError(400, "Must provide a position!");
    }

    if (company_email) {
        result = validEmail.safeParse(company_email);
        if (!result.success) {
            throw new ApiError(400, "Invalid company email!");
        }
    }

    debug("Creating the professional artist info document..");

    const info = await prisma.recruiterInfo.create({
      data: { id, company, position, company_email },
    });
    return info;
  }

  // return all infos
  async readAll({ company, position, company_email }) {
    let filter = {};

    if (company) {
      debug("Validating the company..");
      filter.company = company;
    }

    if (position) {
      debug("Validating the position..");
      filter.position = position;
    }

    if (company_email) {
        debug("Validating the company email..");
        filter.company_email = company_email;
    }

    debug("Reading all info documents..");
    const info = await prisma.recruiterInfo.findMany({
      where: filter,
    });
    return info;
  }

  // return the info with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the info document..");
    const info = await prisma.recruiterInfo.findUnique({
      where: {
        id: id,
      },
    });
    if (!info) {
      throw new ApiError(404, "Resource not found!");
    }

    return info;
  }

  // return the updated info
  // throws ApiError if params are invalid or resource does not exist in our database
  // TODO: add apierror if id is invalid
  async update({ id, company, position, company_email }) {
    let result;
    debug("Validating the id..");
    result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "invalid ID!");
    }


    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!");
    }

    if (company !== undefined) {
      debug("Validating the company..");
      result = validString.safeParse(company);
      if (!result.success) {
        throw new ApiError(400, "Invalid company!");
      }
    }

    if (position !== undefined) {
      debug("Validating the position..");
      result = validString.safeParse(position);
      if (!result.success) {
        throw new ApiError(400, "Invalid position!");
      }
    }

    if (company_email !== undefined) {
        debug("Validating the position..");
        result = validEmail.safeParse(company_email);
        if (!result.success) {
            throw new ApiError(400, "Invalid company email!");
        }
    }

    debug("Updating the info document..");
    const info = await prisma.recruiterInfo.update({
      where: {
        id: id,
      },
      data: { company, position, company_email },
    });

    if (!info) {
      throw new ApiError(404, "Resource not found!");
    }

    return info;
  }

  // return the deleted info
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the info id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!");
    }

    debug("Deleting the info document..");
    const info = await prisma.recruiterInfo.delete({
      where: {
        id: id,
      },
    });
    if (!info) {
      throw new ApiError(404, "Resource not found!");
    }

    return info;
  }

  async deleteAll() {
    debug("Deleting all info documents..");
    await prisma.recruiterInfo.deleteMany({});
  }
}

export default RecruiterInfoDao;