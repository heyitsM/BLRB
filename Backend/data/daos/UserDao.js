import { z } from "zod";
import { factory } from "../../util/debug.js";
import { hashPassword } from "../../util/Password.js";
import { config } from "../../Constants.js";
import prisma from "../../util/db.js";
import User from "../objects/User.js";
import ApiError from "../../util/ApiError.js";

class UserDao {
    async add(user){
        user.checkInstantiatedBeforeCreate();
        const created = await prisma.User.create({
            data: {
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                username:user.username,
                password:user.password,
                isDeleted:user.isDeleted,
                role:user.role,
                profile: {
                    create: {
                        displayName:user.firstName,
                        portfolio: {
                            create: {
                                
                            }
                        },
                        commissionHandling: {
                            create: {
                                stripeAccountID:"gibberish for now",
                            }
                        }
                    }
                },
                
            },
            include: {
                profile: {
                    include: {
                        portfolio:true,
                        commissionHandling:true
                    }
                }
            }
        });
        user.id = created.id;
        return created;
    }

    async getByUsername(username) {
        const user = await prisma.User.findUnique({
            where: {
                username:username
            }
        });
        
        const newuser = new User({
            'email':user.email, 
            'firstName':user.firstName, 
            'lastName':user.lastName, 
            'username':user.username, 
            'password':user.password, 
            'role':user.role, 
            'id':user.id
        });

        return newuser;
    }

    async getByEmail(email) {
        const user = await prisma.User.findUnique({
            where: {
                email:email
            }
        });
        
        const newuser = new User({
            'email':user.email, 
            'firstName':user.firstName, 
            'lastName':user.lastName, 
            'username':user.username, 
            'password':user.password, 
            'role':user.role, 
            'id':user.id
        });
        return newuser;
    }

    async getById(id) {
        const user = await prisma.User.findUnique({
            where: {
                id:id
            }
        });

        const newuser = new User({
            'email':user.email, 
            'firstName':user.firstName, 
            'lastName':user.lastName, 
            'username':user.username, 
            'password':user.password, 
            'role':user.role, 
            'id':user.id
        });
        return newuser;
    }

    async updateUser(userObj, {email, firstName, lastName, username, password}) {
        userObj.checkInstantiatedBeforeUpdate();

        let filter = {};

        if (email) {
            filter.email=email;
        }
        if (firstName) {
            filter.firstName=firstName;
        }
        if (lastName) {
            filter.lastName = lastName;
        }
        if (username) {
            filter.username = username;
        }
        if (password) {
            filter.password = hashPassword(password);
        }

        const arr = Object.keys(filter);
        if (arr.length === 0) {
            return undefined
        }

        const user = await prisma.User.update({
            where: {
                id:userObj.id
            },
            data: filter
        });


        userObj.email = user.email;
        userObj.firstName = user.firstName;
        userObj.lastName = user.lastName;
        userObj.username = user.username;
        userObj.password = user.password;
        userObj.id = user.id;
        userObj.role = user.role;
    }

    //TO BE USED BY USER
    async deleteUser(userObj) {
        const user = await prisma.User.update({
            where: {
                id:userObj.id
            },
            data: {
                isDeleted:true,
            }
        });

        userObj.isDeleted=true;
    }

    //TO BE USED BY ADMIN, ACTUAL DELETE
    //TODO
    async removeUser(userObj) {
        return;
    }

    //with partial matches, IS A UNION SO WILL DO EACH SEPARATELY
    async getAllUnion({usernames, firstNames, emails, lastNames, roles}) {
        let usernames_found = [];
        let firstNames_found = [];
        let emails_found = [];
        let lastNames_found = [];
        let roles_found = [];

        if (emails !== undefined && emails.length !== 0) {
            emails_found = await this.getAllEmailsFromPartials(emails);
        }

        if (lastNames !== undefined && lastNames.length !== 0) {
            lastNames_found = await this.getAllLastnames(lastNames);
        }

        if (roles !== undefined && roles.length !== 0) {
            roles_found = await this.getAllRoles(roles);
        }
        
        if (usernames !== undefined && usernames.length !== 0 ) {
            usernames_found = await this.getAllUsernamesFromPartials(usernames);
        }
        
        if (firstNames !== undefined && firstNames.length !== 0) {
            firstNames_found = await this.getAllFirstnames(firstNames);
        }
        
        return {'usernames':usernames_found, 'firstNames':firstNames_found, 'lastNames':lastNames_found, 'roles':roles_found}
        
    }

    //with partial matches
    async getAllIntersect({username, firstName, email, lastName, role}) {
        let filter = {};

        if (username) {
            filter.username = {'contains': username};
        }
        if (firstName) {
            filter.firstName = {'contains': firstName};
        }
        if (email) {
            filter.email = {'contains': email};
        }
        if (lastName) {
            filter.lastName = {'contains': lastName};
        }
        if (role) {
            filter.role = {'contains': role};
        }

        if (Object.keys(filter).length === 0) {
            throw new ApiError(400, "Must include at least one of username, firstName, email, lastName, role");
        }
        const resp = await prisma.User.findMany({
            where: filter
        });

        return resp;
    }
    
    //exact match
    async getAllEmails(emails) {
        let users = [];

        for (let i = 0; i < emails.length; i++) {
            const user = this.getByEmail(emails[i]);
            users.push(user);
        }
        return users;
    }

    //partial match
    async getAllEmailsFromPartials(emails) {
        let users = {};

        for (let i = 0; i < emails.length; i++) {
            let found = await prisma.user.findMany({
                where: {
                    email: {
                        contains: emails[i],
                    },
                },
            });

            found = found.map(new User);
            users[emails[i]] = found;
        }

        return users;
    }

    //exact match
    async getAllUsernames(usernames) {
        let users = [];

        for (let i = 0; i < emails.length; i++) {
            const user = this.getByUsername(emails[i]);
            users.push(user);
        }
        return users;
    }

    //partial match
    async getAllUsernamesFromPartials(usernames) {
        let users = {};

        for (let i = 0; i < usernames.length; i++) {
            let found = await prisma.user.findMany({
                where: {
                    username: {
                        contains: usernames[i],
                    },
                },
            });

            found = found.map(new User);
            users[usernames[i]] = found;
        }

        return users;
    }

    //partial match
    async getAllFirstnames(firstNames) {
        let users = {};

        for (let i = 0; i < firstNames.length; i++) {
            let found = await prisma.user.findMany({
                where: {
                    firstName: {
                        contains: firstNames[i],
                    },
                },
            });

            found = found.map(new User);
            users[firstNames[i]] = found;
        }

        return users;
    }

    //partial match
    async getAllLastnames(lastNames) {
        let users = {};

        for (let i = 0; i < lastNames.length; i++) {
            let found = await prisma.user.findMany({
                where: {
                    lastName: {
                        contains: lastNames[i],
                    },
                },
            });

            found = found.map(new User);
            users[lastNames[i]] = found;
        }
        return users;
    }

    //exact match
    async getAllRoles(roles) {
        let users = {};

        for (let i = 0; i < roles.length; i++) {
            let found = await prisma.user.findMany({
                where: {
                    role: roles[i],
                },
            });

            found = found.map(new User);
            users[lastNames[i]] = found;
        }
        return users;
    }

}

export default UserDao;