import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import UserDao from "./UserDao.js";

dotenv.config();
const debug = factory(import.meta.url);

const validString = z.string();
const validAcceptingCommissions = z.boolean({
  required_error: "accepting_commissions is required",
  invalid_type_error: "accepting_commissions must be a boolean",
});

const validUuid = z.string().uuid("Invalid uuid!");
// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const userDao = new UserDao();

class ProfessionalArtistInfoDao {
  // return the created professional artist info
  // throws ApiError when commission_rules or accepting_commissions is invalid
  async create({ id, commission_rules, accepting_commissions, stripeAccountID, pdf_link }) {
    let result;
    debug("Validating the id..");
    result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(404, "invalid ID!");
    }
    try {
      await userDao.read(id);
    } catch (err) {
      throw new ApiError(404, "Artist user resource not found!")
    }

    if (commission_rules) {
      debug("Validating the commission_rules..");
      result = validString.safeParse(commission_rules);
      if (!result.success) {
        throw new ApiError(400, "Invalid commission_rules!");
      }
    }

    if (pdf_link) {
      debug("Validating the pdf_link..");
      result = validString.safeParse(pdf_link);
      if (!result.success) {
        throw new ApiError(400, "Invalid pdf_link!");
      }
    }
    
    if (accepting_commissions) {
      debug("Validating the accepting_commissions..");
      result = validAcceptingCommissions.safeParse(accepting_commissions);
      if (!result.success) {
        throw new ApiError(400, "Invalid accepting_commissions!");
      }
    }

    debug("Creating the professional artist info document..");

    const info = await prisma.professionalArtistInfo.create({
      data: { id, commission_rules, accepting_commissions, stripeAccountID, pdf_link },
    });
    return info;
  }

  // return all infos
  async readAll({ commission_rules, accepting_commissions, stripeAccountID, pdf_link }) {
    let filter = {};

    if (commission_rules) {
      debug("Validating the commission_rules..");
      filter.commission_rules = commission_rules;
    }

    if (pdf_link) {
      debug("Validating the pdf_link");
      filter.pdf_link = pdf_link;
    }

    if (accepting_commissions) {
      debug("Validating the accepting_commissions..");
      filter.accepting_commissions = accepting_commissions;
    }

    if (stripeAccountID) {
      debug("Validating the stripeAccountID..");
      filter.stripeAccountID = stripeAccountID;
    }

    debug("Reading all info documents..");
    const info = await prisma.professionalArtistInfo.findMany({
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
    const info = await prisma.professionalArtistInfo.findUnique({
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
  async update({ id, commission_rules, accepting_commissions, pdf_link }) {
    debug("Validating the info id...");
    let result;
    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!");
    }

    if (commission_rules !== undefined) {
      debug("Validating the price..");
      result = validString.safeParse(commission_rules);
      if (!result.success) {
        throw new ApiError(400, "Invalid commission_rules!");
      }
    }

    if (pdf_link !== undefined && pdf_link !== null) {
      debug("Validating the pdf_link..");
      result = validString.safeParse(pdf_link);
      if (!result.success) {
        throw new ApiError(400, "Invalid pdf_link!");
      }
    }

    if (accepting_commissions !== undefined) {
      debug("Validating the price..");
      result = validAcceptingCommissions.safeParse(accepting_commissions);
      if (!result.success) {
        throw new ApiError(400, "Invalid accepting_commissions!");
      }
    }

    debug("Updating the info document..");
    const info = await prisma.professionalArtistInfo.update({
      where: {
        id: id,
      },
      data: { commission_rules, accepting_commissions, pdf_link },
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
    const info = await prisma.professionalArtistInfo.delete({
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
    await prisma.professionalArtistInfo.deleteMany({});
  }
}

export default ProfessionalArtistInfoDao;
