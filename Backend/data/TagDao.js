import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import { z } from "zod";
import { hashPassword } from "../util/password.js";
import { UserRole } from "../util/UserRole.js";
import { PrismaClient } from "@prisma/client";
import { config } from "../Constants.js";

const prisma = new PrismaClient();
const debug = factory(import.meta.url);

class TagDao {
    async create({ tag_info, profile_id }) {
        // const tag = await prisma.tag.create({ data: { tag_info }});
        const tag = await prisma.tag.create({
            data: {
                tag_info:tag_info,
                users: {
                    connect: { id: profile_id },
                },
            }
        });

        return tag;
    }

    // async update({ tag_id, profile_id }) {
    //     const tag = await prisma.tag.update({
    //         where: {
    //             id: tag_id,
    //         },
    //         data: {
    //             users: {
    //                 connect: { id: profile_id },
    //             },
    //         }
    //     });
    //     return tag;
    // }

    async read({ tag_info }) {
        const tag = await prisma.tag.findFirst({
            where: {
                tag_info:tag_info,
            },
            include: {
                users: true,
            },
        });
        return tag;
    }

    async readList({ tag_list }) {
        let i = 0;
        let returnable = [];

        for (i in tag_list) {
            const tag = await this.read({tag_info: tag_list[i]});
            returnable.push(tag);
        }

        return returnable;
    }
    
    async readAll() {
        const tags = await prisma.tag.findMany();
        return tags;
    }

    async readAssociatedUsers({ tag_info }) {
        const tag = await prisma.tag.findFirst({
            where: {
                tag_info:tag_info,
            },
            include: {
                users: true,
            },
        });
        return tag;
    }
    
    async delete({ tag_info }) {
        const tag = await prisma.tag.delete({
            where: {
                tag_info:tag_info,
            },
        });
        return tag;
    }

}


// model Tag {
//     id            String   @id @default(uuid())
//     tag_info      String
//     users           Profile[]
//   }

export default TagDao;