import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import { hashPassword } from "../util/password.js";
// import { UserRole } from "../util/UserRole.js";
import { PrismaClient } from "@prisma/client";
import { config } from "../Constants.js";
import Stripe from 'stripe';

const stripe = Stripe(process.env.STRIPE_SECRET);

// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);

// TODO: use zod to validate names
// TODO: ensure correct fields are being accessed in all functions

const validName = z.string().min(1, "Missing name attribute!");
const validEmail = z.string().email("Invalid Email!");
const validPassword = z
  .string()
  .min(6, "Password should be at least 6 characters.");
const validUuid = z.string().uuid("Invalid uuid!");
const validUsername = z.string().min(1, "Missing username attribute!");

class UserDao {
  // return the created user
  // throws ApiError when names, email, or password is invalid
  async create({ first_name, last_name, username, email, password, role }) {
    debug("Validating the name..");
    let result = validName.safeParse(first_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Name!");
    }

    result = validName.safeParse(last_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Name!");
    }

    debug("Validating the email..");
    result = validEmail.safeParse(email);
    if (!result.success) {
      throw new ApiError(400, "Invalid Email!");
    }

    debug("Validating the username...");
    result = validUsername.safeParse(username);
    if (!result.success) {
      throw new ApiError(400, "Invalid username!")
    }
    result = await this.readAll({ username });
    if (result.length > 0) {
      throw new ApiError(400, "Username is already in use!");
    }
    
    result = await this.readAll({ email });
    if (result.length > 0) {
      throw new ApiError(400, "Email already in use!");
    }

    debug("Validating the password..");
    result = validPassword.safeParse(password);
    if (!result.success) {
      throw new ApiError(400, "Password should be at least 6 characters.");
    }

    password = hashPassword(password);

    // if (role !== undefined) {
    //   debug("Validating the role..");
    //   result = validRole.safeParse(role);
    //   if (!result.success) {
    //     throw new ApiError(
    //       400,
    //       `Role must be one of ${Object.values(Role)}.`
    //     );
    //   }
    // }

    //convert string input to the correct role
    if (role !== undefined && role !== null) {
      if (role.toLowerCase() === "professional" || role == "PROFESSIONAL") {
        role = "PROFESSIONALY";
      } else if (role.toLowerCase() === "recruiter" || role == "RECRUITER") {
        role = "RECRUITER";
      } else if (role.toLowerCase() === "forfun" || role == "FORFUN") {
        role = "FOR_FUN";
      } else {
        throw new ApiError(
          400,
          `Role must be RECRUITER, PROFESSIONAL, OR FORFUN.`
          );
      }
    }
    
    debug("Creating the user document..");

    const user = await prisma.user.create({
      data: { first_name, last_name, username, email, password, role },
    });
    return user;
  }

  // return all users
  // throws ApiError if role is not PROFESSIONAL, RECRUITER, or FORFUN (or the lowercase versions)
  async readAll({ username, email, role }) {

    if (role !== undefined && role !== null) {
      if (role.toLowerCase() === "professional" || role == "PROFESSIONAL") {
        role = "PROFESSIONALY";
      } else if (role.toLowerCase() === "recruiter" || role == "RECRUITER") {
        role = "RECRUITER";
      } else if (role.toLowerCase() === "forfun" || role == "FORFUN") {
        role = "FOR_FUN";
      } else {
        throw new ApiError(
          400,
          `Role must be RECRUITER, PROFESSIONAL, OR FORFUN.`
          );
      }
    }

    debug("Reading all user documents..");
    await prisma.$disconnect();
    const users = await prisma.user.findMany({ 
      where: {
        username:username,
        email:email,
        role:role,
      },
      include: {
        professionalArtistInfo:true
      }
    });

    return users;
  }

  // return the user with the given id
  // throws ApiError if id is invalid or resource does not exist in our database
  async read(id) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid ID!");
    }

    debug("Reading the user document..");
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        professionalArtistInfo:true
      }
    }); // User.findById(id);
    if (!user) {
      throw new ApiError(404, "Resource not found!");
    }

    return user;
  }

  // return the updated user
  // throws ApiError if params are invalid or resource does not exist in our database
  // TODO: add apierror if id is invalid
  async update({ id, first_name, last_name, email, password, role }) {
    debug("Validating the user id...");
    let result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }
    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!")
    }

    if (first_name !== undefined) {
      debug("Validating the first name..");
      result = validName.safeParse(first_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Name!");
      }
    }

    if (last_name !== undefined) {
      debug("Validating the last name..");
      result = validName.safeParse(last_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Name!");
      }
    }

    if (email !== undefined) {
      debug("Validating the email..");
      result = validEmail.safeParse(email);
      if (!result.success) {
        throw new ApiError(400, "Invalid Email!");
      }

      result = await this.readAll({ email });
      for (let user in result) {
        if (user.id !== id) {
          throw new ApiError(400, "Email already in use!");
        }
      }
    }

    if (password !== undefined) {
      debug("Validating the password..");
      result = validPassword.safeParse(password);
      if (!result.success) {
        throw new ApiError(400, "Invalid Password!");
      }

      password = hashPassword(password);
    }

    let roleProf = false;
    let obj = "";

    if (role !== undefined && role !== null) {
      if (role.toLowerCase() === "professional" || role === "PROFESSIONAL") {
        role = "PROFESSIONALY";
        const user = await this.read(id);
        if (user.role !== "PROFESSIONALY") {
          const account = await stripe.accounts.create({
            type: 'custom',
            country: 'US',
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true }
            },
            business_type: 'individual',
            external_account: {
              object: 'bank_account',
              country: 'US',
              currency: 'usd',
              routing_number: '110000000',
              account_number: '000123456789'
            },
            tos_acceptance: { date: 1609798905, ip: '8.8.8.8' },
            business_profile: { mcc: 5045, url: `https://comm-u8cy.onrender.com/profiles/${user.username}` },
            individual: {
              first_name: user.first_name,
              last_name: user.last_name,
              phone: '+16505551234',
              email: user.email,
              id_number: '222222222',
              address: {
                line1: '123 State St',
                city: 'Schenectady',
                postal_code: '12345',
                state: 'NY'
              },
              dob: {
                day: 10,
                month: 11,
                year: 1980
              }
            }
          });
          
          try {
            const info = await prisma.professionalArtistInfo.create({
              data: { id, stripeAccountID:account.id },
            });
            obj = info;
          } catch (err) {
            const info = await prisma.professionalArtistInfo.update({
              where: {
                id,
              },
              data: { stripeAccountID:account.id },
            });
            obj = info;
          }
          
        } else {
          const account = await stripe.accounts.create({
            type: 'custom',
            country: 'US',
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true }
            },
            business_type: 'individual',
            external_account: {
              object: 'bank_account',
              country: 'US',
              currency: 'usd',
              routing_number: '110000000',
              account_number: '000123456789'
            },
            tos_acceptance: { date: 1609798905, ip: '8.8.8.8' },
            business_profile: { mcc: 5045, url: `https://comm-u8cy.onrender.com/profiles/${user.username}` },
            individual: {
              first_name: user.first_name,
              last_name: user.last_name,
              phone: '+16505551234',
              email: user.email,
              id_number: '222222222',
              address: {
                line1: '123 State St',
                city: 'Schenectady',
                postal_code: '12345',
                state: 'NY'
              },
              dob: {
                day: 10,
                month: 11,
                year: 1980
              }
            }
          });
          const info = await prisma.professionalArtistInfo.update({
            where: {
              id,
            },
            data: { stripeAccountID:account.id },
          });
          obj = info;
        }
        roleProf = true;
      } else if (role.toLowerCase() === "recruiter" || role == "RECRUITER") {
        role = "RECRUITER";
      } else if (role.toLowerCase() === "forfun" || role == "FORFUN") {
        role = "FOR_FUN";
      } else {
        throw new ApiError(
          400,
          `Role must be RECRUITER, PROFESSIONAL, OR FORFUN.`
          );
      }
    }

    debug("Updating the user document..");
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: { first_name, last_name, email, password, role },
    });

    if (!user) {
      throw new ApiError(404, "Resource not found!");
    }
    if (roleProf) {
      return { user, stripeinfo:obj }
    }
    return user;
  }

  // return the deleted user
  // throws ApiError if id is invalid or resource does not exist
  async delete(id) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }

    try {
      await this.read(id);
    } catch (err) {
      throw new ApiError(404, "Resource not found!")
    }

    debug("Deleting the user document..");
    const user = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new ApiError(404, "Resource not found!");
    }

    return user;
  }

  async deleteAll() {
    await prisma.profile.deleteMany({});
    debug("Deleting all user documents..");
    await prisma.user.deleteMany({});
  }
}

export default UserDao;