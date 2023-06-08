import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import UserDao from "./UserDao.js";

dotenv.config();
// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);
const userDao = new UserDao();

const statuses = new Set([
  "REQUESTED",
  "PENDING",
  "REJECTED",
  "ACCEPTED",
  "PAID",
  "COMPLETED",
]);
const validRequiredString = z
  .string()
  .min(1, "Missing requried string attribute!");
const validNotes = z.string();
const validPrice = z
  .number()
  .nonnegative({ message: "price must be greater than or equal to 0" });
const validUuid = z.string().uuid("Invalid uuid!");

class CommissionDao {
  // return the created commission
  // throws ApiError when notes, description, artist_id, or commissioner_id is invalid
  async create({
    artist_id,
    commissioner_id,
    title,
    description,
    notes,
    price,
  }) {
    let result;
    debug("Validating the artist_id..");
    result = validUuid.safeParse(artist_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid artist id!");
    }
    try {
      await userDao.read(artist_id);
    } catch (err) {
      throw new ApiError(404, "Artist resource not found!");
    }

    debug("Validating the commissioner_id..");
    result = validUuid.safeParse(commissioner_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid commissioner id!");
    }
    try {
      await userDao.read(commissioner_id);
    } catch (err) {
      throw new ApiError(404, "Commissioner resource not found!");
    }

    debug("Validating the title..");
    result = validRequiredString.safeParse(title);
    if (!result.success) {
      throw new ApiError(400, "Invalid title!");
    }

    debug("Validating the description..");
    result = validRequiredString.safeParse(description);
    if (!result.success) {
      throw new ApiError(400, "Invalid description!");
    }

    if (notes) {
      debug("Validating the notes...");
      result = validNotes.safeParse(notes);
      if (!result.success) {
        throw new ApiError(400, "Invalid notes!");
      }
    }

    if (price) {
      debug("Validating the price..");
      result = validPrice.safeParse(price);
      if (!result.success) {
        throw new ApiError(400, "Invalid Price!");
      }
    }

    debug("Creating the commission document..");

    const commission = await prisma.commission.create({
      data: { artist_id, commissioner_id, title, description, notes, price },
    });
    return commission;
  }

  // return all commissions
  // throws ApiError if status is not REQUESTED, PENDING, REJECTED, ACCEPTED, PAID, COMPLETED (or the lowercase versions)
  async readAll({ artist_id, commissioner_id, status }) {
    let filter = {};
    if (artist_id) {
      filter.artist_id = artist_id;
    }
    if (commissioner_id) {
      filter.commissioner_id = commissioner_id;
    }

    if (status !== undefined && status !== null) {
      if (statuses.has(status.toUpperCase())) {
        filter.status = status.toUpperCase();
      } else {
        throw new ApiError(
          400,
          `status must be REQUESTED, PENDING, REJECTED, ACCEPTED, PAID, OR COMPLETED.`
        );
      }
    }

    debug("Reading all commission documents..");
    const commissions = await prisma.commission.findMany({
      where: filter,
    });
    return commissions;
  }

  // return the commission with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the commission id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the commission document..");
    const commission = await prisma.commission.findUnique({
      where: {
        id: id,
      },
    });
    if (!commission) {
      throw new ApiError(404, "Resource not found!");
    }

    return commission;
  }

  // return the updated commission
  // throws ApiError if params are invalid or resource does not exist in our database
  // TODO: add apierror if id is invalid
  async update({ id, price, status }) {
    debug("Validating the commission id...");
    let result;
    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!");
    }

    if (price !== undefined) {
      debug("Validating the price..");
      result = validPrice.safeParse(price);
      if (!result.success) {
        throw new ApiError(400, "Invalid Price!");
      }
    }

    if (status !== undefined && status !== null) {
      if (statuses.has(status.toUpperCase())) {
        status = status.toUpperCase();
      } else {
        throw new ApiError(
          400,
          `status must be REQUESTED, PENDING, REJECTED, ACCEPTED, PAID, OR COMPLETED.`
        );
      }
    }

    debug("Updating the commission document..");
    const commission = await prisma.commission.update({
      where: {
        id: id,
      },
      data: { price, status },
    });

    if (!commission) {
      throw new ApiError(404, "Resource not found!");
    }

    return commission;
  }

  // return the deleted commission
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the commission id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid Commission ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Commission resource not found!");
    }

    debug("Deleting the commission document..");
    const commission = await prisma.commission.delete({
      where: {
        id: id,
      },
    });
    if (!commission) {
      throw new ApiError(404, "Commission resource not found!");
    }

    return commission;
  }

  async deleteAll() {
    debug("Deleting all commission documents..");
    await prisma.commission.deleteMany({});
  }
}

export default CommissionDao;
