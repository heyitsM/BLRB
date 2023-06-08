import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { factory } from "../util/debug.js";
import { hashPassword } from "../util/password.js";
import { UserRole } from "../util/UserRole.js";
import { PrismaClient } from "@prisma/client";
import TagDao from "./TagDao.js";
import UserDao from "./UserDao.js";
import { config } from "../Constants.js";

// const prisma = new PrismaClient();
import prisma from "../util/db.js";

const debug = factory(import.meta.url);
const tagDao = new TagDao();
const userDao = new UserDao();


const validUuid = z.string().uuid("Invalid uuid!");
const validName = z.string().min(1, "Missing name attribute!");
const validBio = z.string().min(1, "Missing bio attribute!");
const validImg = z.string().min(1, "Missing image attribute!");   //TODO: figure out image string validation- maybe path indicators or something
const validateTag = z.string().min(1, "Missing tag attribute!");

class ProfileDao {
  // return the created profile
  // throws ApiError when id/user, display_name, or bio is invalid or not present
  // throws ApiError when img is present and invalid, or when a profile already exists for that user
  async create({ user_id, display_name, bio, use_display_name, img, tags }) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(user_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }

    const us = await prisma.user.findFirst({
      where: {
        id:user_id,
      },
    });

    if (!us) {
      throw new ApiError(404, "User resource not found!");
    }

    debug("Checking to see if profile for this user already exists...");
    const prof = await this.read({ user_id });
    if (prof) {
      throw new ApiError(400, "A profile already exists for this user!");
    }

    debug("Validating display name and use_display_name if passed...");
    if (display_name !== undefined && display_name !== null) {
      let result = validName.safeParse(display_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Display Name!");
      }
    } else {
      if (use_display_name === true) {
        throw new ApiError(400, "Cannot use display name when display name is not sent");
      }
    }

    if (use_display_name !== null && use_display_name !== undefined && typeof use_display_name !== "boolean") {
      throw new ApiError(400, "Invalid use_display_name");
    }

    debug("Validating bio if passed...");
    if (bio !== undefined && bio !== null) {
      let result = validBio.safeParse(bio);
      if (!result.success) {
          throw new ApiError(400, "Invalid Bio");
        
      }
    }

    debug("Validating img if passed...")
    if (img !== undefined && img !== null) {
      let result = validImg.safeParse(img);
      if (!result.success) {
        throw new ApiError(400, "Bad Image Input");
      }
    }
    
    //create profile w/o tags
    debug("Creating profile without tags...");
    let profile = await prisma.profile.create({
      data: { userId:user_id, display_name, bio, use_display_name, profile_pic:img},
    });

    let i = 0;

    //create all tags if they don't exist, and link them to user, or update current ones to link to user
    debug("Creating tags if they don't exist, and connecting them all to the profile...");
    for (i in tags) {
      // let exists = await tagDao.read({ tag_info:tags[i] });
      let new_tag = await prisma.tag.upsert({
        where: { tag_info:tags[i] },
        update: { 
          users: {
            connect:{ id:profile['id'] }
          }
        },
        create: {
          tag_info: tags[i],
          users: {
            connect: { id: profile['id'] }
          }
        },
      });
    }

    debug("Getting final profile...");
    profile = await this.read({ user_id });

    return profile;
  }
  
  // returns the related profile or null if there isn't any
  // throws ApiError if invalid user id
  async read({ user_id }) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(user_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }

    const us = prisma.user.findFirst({
      where: {
        id:user_id,
      },
    });

    if (!us) {
      throw new ApiError(404, "User resource not found!");
    }

    debug("Finding the profile...");
    const profile = await prisma.profile.findFirst({
      where: {
        userId:user_id,
      },
      include: {
        tags: true,
      },
    });
    
    return profile;
  }

  //ONE TAG FOR NOW
  // returns a list of the related profiles
  // throws ApiError when display_name, bio, tag, or img are present and invalid
  // tag must be a string- find all profiles related to that one tag
  async readAll({ display_name, bio, use_display_name, tags_array, img }) {
    // validate display_name, bio, use_display_name, img

    debug("Validating the display_name");
    if (display_name !== undefined && display_name !== null) {
      let result = validName.safeParse(display_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Display Name!");
      }
    }

    debug("Validating the bio...");
    if (bio !== undefined && bio !== null) {
      let result = validBio.safeParse(bio);
      if (!result.success) {
          throw new ApiError(400, "Invalid Bio");
      }
    }

    debug("Validating the use_display_name param");
    if (use_display_name !== undefined && use_display_name !== null) {
      if (typeof use_display_name !== "boolean") {
        throw new ApiError(400, "use_display_name must be boolean");
      }
    }

    // debug("Validating the tag... ");
    // if (tag !== undefined && tag !== null) {
    //   let result = validateTag.safeParse(tag);
    //   if (!result.success) {
    //     throw new ApiError(400, "tag must be a non empty string- only one tag may be filtered on for now");
    //   }
    // }

    debug("Validating the img...");
    if (img !== undefined && img !== null) {
      let result = validImg.safeParse(img);
      if (!result.success) {
        throw new ApiError(400, "Bad Image Input");
      }
    }

    const profile_pic = img;

    debug("Finding the profiles...");
    
    const profiles = await prisma.profile.findMany({
      where: {
        display_name:display_name,
        bio:bio,
        use_display_name:use_display_name,
        profile_pic:profile_pic,
        tags: {
          some: {
            tag_info: {
              in: tags_array
            }
          }
        }
      },
      include: {
        tags: true,
      },
    });
    return profiles
  }

  async search({partial, tags}) {
    if (partial !== undefined && partial !== "") {
      let result = validName.safeParse(partial);
      if (!result.success) {
        throw new ApiError(400, "Invalid partial");
      }
    }

    if (tags !== undefined) {
      let success = Array.isArray(tags);
      if (!success) {
        throw new ApiError(400, "Invalid Tags list!");
      }
    }
    

    if (tags !== undefined && partial) {
      
      let profiles = await prisma.profile.findMany({
        where: {
          user: {
            username: {
              contains:partial,
              mode:"insensitive"
            },
          },
          tags: {
            some: {
              tag_info: {
                in: tags
              }
            }
          }
        },
        include:{
          user:true,
          tags:true,
        }
      });

      const moreProfiles = await prisma.profile.findMany({
        where: {
          display_name: {
            contains: partial,
            mode:"insensitive"
          },
          tags: {
            some: {
              tag_info: {
                in: tags
              }
            }
          }
        },
        include:{
          user:true,
          tags:true,
        }
      });
      

      let i = 0;
      let toReturn = [];
      // let toReturnDispName = [];
      let found_users = [];

      for (i = 0; i < profiles.length; i++) {
        let cur_tags = profiles[i]["tags"];
        let k = 0;
        let will_return = true;
        let raw_comp = [];
        for (k = 0; k < cur_tags.length; k++) {
          raw_comp.push(cur_tags[k]["tag_info"])
        }

        for (k = 0; k < tags.length; k++) {
          if (!raw_comp.includes(tags[k])) {
            will_return = false;
          }
        }

        if (will_return) {
          toReturn.push(profiles[i]);
          found_users.push(profiles[i]["user"]["id"]);
        }
      }

      for (i = 0; i < moreProfiles.length; i++) {
        let cur_tags = moreProfiles[i]["tags"];
        let k = 0;
        let will_return = true;
        let raw_comp = [];

        for (k = 0; k < cur_tags.length; k++) {
          raw_comp.push(cur_tags[k]["tag_info"])
        }

        for (k = 0; k < tags.length; k++) {
          if (!raw_comp.includes(tags[k])) {
            will_return = false;
          }
        }

        if (will_return) {
          let cur_id = moreProfiles[i]["user"]["id"];
          let not_found = !found_users.includes(cur_id);
          if (not_found) {
            toReturn.push(moreProfiles[i]);
            found_users.push(moreProfiles[i]["user"]["id"]);
          }
        }
      }

      return toReturn;
    } else if (partial) {
      const profiles = await prisma.profile.findMany({
        where: {
          user: {
            username: {
              contains: partial,
              mode:"insensitive"
            }
          }
        },
        include: {
          user:true,
          tags:true,
        }
      });

      let toReturn = [];
      let found_users = [];

      for (let i = 0; i < profiles.length; i++) {
        toReturn.push(profiles[i]);
        found_users.push(profiles[i]["user"]["id"]);
      }

      const moreProfiles = await prisma.profile.findMany({
        where: {
          display_name: {
            contains:partial,
            mode:"insensitive"
          }
        },
        include: {
          user: true,
          tags: true,
        },
      });

      for (let i = 0; i < moreProfiles.length; i++) {
        let not_found = !found_users.includes(moreProfiles[i]["user"]["id"]);
        if (not_found) {
          toReturn.push(moreProfiles[i]);
          found_users.push(moreProfiles[i]["user"]["id"]);
        }
      }

      // toReturn = profiles.concat(moreProfiles);

      return toReturn;

    } else if (tags !== undefined) {
      const profiles = await prisma.profile.findMany({
        where: {
          tags: {
            some: {
              tag_info: {
                in: tags
              }
            },
          }
        },
        include:{
          user:true,
          tags:true,
        }
      });

      let i = 0;
      let toReturn = [];

      for (i = 0; i < profiles.length; i++) {
        let cur_tags = profiles[i]["tags"];
        let k = 0;
        let will_return = true;
        let raw_comp = [];
        for (k = 0; k < cur_tags.length; k++) {
          raw_comp.push(cur_tags[k]["tag_info"])
        }

        for (k = 0; k < tags.length; k++) {
          if (!raw_comp.includes(tags[k])) {
            will_return = false;
          }
        }

        if (will_return) {
          toReturn.push(profiles[i]);
        }
      }
      return toReturn;
    } else {
      throw new ApiError(400, "Invalid search");
    }
  }

  // updates profile data- display_name, bio, use_display_name, img, and tags
  // if you are updating tags, MUST ALSO pass tag_connect parameter to let us know if the assorted tags are to be added or removed
  // throws ApiError if display_name (str), bio (str), use_display_name (bool), img, or tags are invalid
  // ALSO throws ApiError if tags are present and tag_connect (bool) is not- true means adding them to the profile, false means removing
  // Throws ApiError if you try to remove (false) tags that don't exist
  // returns updated user
  async update({ user_id, display_name, bio, use_display_name, img, tags, tag_connect }) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(user_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }
    const us = await prisma.user.findFirst({
      where: {
        id:user_id,
      },
    });

    if (us === null || us === undefined) {
      throw new ApiError(404, "User resource not found!");
    }

    debug("Validating the display_name");
    if (display_name !== undefined) {
      let result = validName.safeParse(display_name);
      if (!result.success) {
        throw new ApiError(400, "Invalid Display Name!");
      }
    }

    debug("Validating the bio...");
    if (bio !== undefined) {
      let result = validBio.safeParse(bio);
      if (!result.success) {
        if (!result.success) {
          throw new ApiError(400, "Invalid Bio");
        }
      }
    }

    debug("Validating the use_display_name param");
    if (use_display_name !== undefined) {
      if (typeof use_display_name !== "boolean") {
        throw new ApiError(400, "use_display_name must be boolean");
      }
    }

    debug("Validating the tags... ");
    if (tags && Array.isArray(tags) && tags.length !== 0) {
      let i = 0;
      for (i in tags) {
        if (tags[i] !== undefined) {
          let result = validateTag.safeParse(tags[i]);
          if (!result.success) {
            throw new ApiError(400, "tag must be a non empty string");
          }
        }
      }
      if (tag_connect === undefined || typeof tag_connect !== "boolean") {
        throw new ApiError(400, "If tags are included, tag_connect must be specified either true (connect the tags) or false (disconnect the tags)"); //change code here maybe
      }
    }

    debug("Validating the img...");
    if (img !== undefined && img !== null) {
      let result = validImg.safeParse(img);
      if (!result.success) {
        throw new ApiError(400, "Bad Image Input");
      }
    }

    // updating tags
    let profile = await this.read({ user_id });

    if (profile === null || profile === undefined) {
      throw new ApiError(404, "Profile resource not found!");
    }

    let i = 0;
    debug("Adding/updating tags...");
    for (i in tags) {
      let exists = await tagDao.read({ tag_info:tags[i] });
      if (tag_connect) {
        let new_tag = await prisma.tag.upsert({
          where: { tag_info:tags[i]},
          update: { 
            users: {
              connect:{id:profile['id']}
            }
          },
          create: {
            tag_info: tags[i],
            users: {
              connect: {id: profile['id']}
            }
          },
        });
      } else {
        try {
          let new_tag = await prisma.tag.update({
            where: { tag_info:tags[i] },
            data: {
              users: {
                disconnect: {id:profile['id']}
              },
            },
          });
        } catch (err) {
          throw new ApiError(404, "Cannot disconnect a tag that doesn't exist");
        }
      }
    }

    //updating other information given
    debug("Updating any other profile information...");
    const return_profile = await prisma.profile.update({
      where: {
        userId: user_id,
      },
      data: {
        display_name: display_name,
        bio: bio,
        use_display_name: use_display_name,
        profile_pic:img,
      },
      include: {
        tags: true,
      },
    });

    debug("Returning profile doc...");
    if (!return_profile) {
      const returnable = await this.read({ user_id });
      return returnable;
    }

    return return_profile;
  }

  // deletes profile data by user_id
  // throws apiError if invalid userId or resource isn't found
  // returns deleted user
  async delete(user_id) {
    debug("Validating the user id...");
    const result = validUuid.safeParse(user_id);
    if (!result.success) {
      throw new ApiError(400, "Invalid User ID!");
    }

    debug("Reading the user document..");
    const user = await prisma.user.findFirst({
      where: {
        id: user_id,
      },
    }); // User.findById(id);
    if (!user) {
      throw new ApiError(404, "User resource not found!");
    }
    
    const prof = this.read({ user_id });
    if (!prof) {
      throw new ApiError(404, "Profile resource not found!");
    }

    debug("Deleting the profile...");
    const profile = await prisma.profile.delete({
      where: {
        userId:user_id,
      },
      include: {
        tags: true,
      },
    });


    return profile;
  }

  //deletes all profiles
  async deleteAll() {
    await prisma.profile.deleteMany({});
    debug("Deleting all user documents..");
    await prisma.user.deleteMany({});
  }

}

export default ProfileDao;
