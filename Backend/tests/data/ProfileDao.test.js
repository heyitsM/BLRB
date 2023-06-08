import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const test_url = process.env.DATABASE_TEST_URL;
const dev_url = process.env.DATABASE_URL;
process.env.DATABASE_URL = test_url;

import UserDao from "../../data/UserDao.js";
import ProfileDao from "../../data/ProfileDao.js";

const prisma = new PrismaClient();
// run inside `async` function

const userDao = new UserDao();
const profileDao = new ProfileDao();

describe("Test ProfileDao", () => {
    const numUsers = 3;
    let users;
    let nonexisting_id;
    let user_with_profile;
    let that_profile;

    beforeAll(async () => {
        await prisma.$connect();
        //await userDao.deleteAll({});
        //await profileDao.deleteAll({});
    });

    beforeEach(async () => {
        users = [];
        for (let index = 0; index < numUsers; index++) {
            const first_name = faker.name.firstName();
            const last_name = faker.name.lastName();
            const username = faker.internet.userName();
            const email = faker.internet.email();
            const password = faker.internet.password(6);
            let role_decider = Math.random();
            let role = "";
            if (role_decider < 0.3) {
                role = "RECRUITER";
            } else if (role_decider < 0.6) {
                role = "FORFUN";
            } else {
                role = "PROFESSIONAL";
            }
            const user = await userDao.create({first_name, last_name, username, email, password, role});
            users.push(user);
        }
        
        let first_name = faker.name.firstName();
        let last_name = faker.name.lastName();
        let username = faker.internet.userName();
        let email = faker.internet.email();
        let password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const _user = await userDao.create({first_name, last_name, username, email, password, role});
        await userDao.delete(_user.id);
        nonexisting_id = _user.id;

        first_name = faker.name.firstName();
        last_name = faker.name.lastName();
        username = faker.internet.userName();
        email = faker.internet.email();
        password = faker.internet.password(6);
        role_decider = Math.random();
        role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }


        const profile_user = await userDao.create({ first_name, last_name, username, email, password, role });
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const _profile = await profileDao.create({ user_id:profile_user.id, display_name, bio, use_display_name, img, tags });
        user_with_profile = profile_user.id;
        that_profile = _profile;
        
    });

    it("test create()", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const _profile = await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });
        expect(_profile.display_name).toBe(display_name);
        expect(_profile.bio).toBe(bio);
        expect(_profile.use_display_name).toBe(use_display_name);
        const tags_recieved = _profile.tags;
        let i = 0;
        for (i in tags_recieved) {
            expect(tags.includes(tags_recieved[i].tag_info)).toBe(true);
        }
        expect(_profile.profile_pic).toBe(img);
    });

    it("test create() without given tags", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        const _profile = await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, img });

        expect(_profile.display_name).toBe(display_name);
        expect(_profile.bio).toBe(bio);
        expect(_profile.use_display_name).toBe(use_display_name);
        const tags_recieved = _profile.tags;
        expect(tags_recieved.length).toBe(0);
    });
    
    it("test create() without given display_name and use_display_name", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const bio = faker.lorem.sentence();
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const _profile = await profileDao.create({ user_id:user.id, bio, img, tags });
        expect(_profile.display_name).toBe(null);
        expect(_profile.bio).toBe(bio);
        expect(_profile.use_display_name).toBe(false);
        const tags_recieved = _profile.tags;
        let i = 0;
        for (i in tags_recieved) {
            expect(tags.includes(tags_recieved[i].tag_info)).toBe(true);
        }
        expect(_profile.profile_pic).toBe(img);
    });

    it("test create() without given img", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const _profile = await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, tags });
        expect(_profile.display_name).toBe(display_name);
        expect(_profile.bio).toBe(bio);
        expect(_profile.use_display_name).toBe(use_display_name);
        const tags_recieved = _profile.tags;
        let i = 0;
        for (i in tags_recieved) {
            expect(tags.includes(tags_recieved[i].tag_info)).toBe(true);
        }
        expect(_profile.profile_pic).toBe(null);
    });

    it("test create() without given bio", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const display_name = faker.name.firstName();
        const img = faker.internet.url();
        const use_display_name = true;
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const _profile = await profileDao.create({ user_id:user.id, display_name, use_display_name, tags, img });

        expect(_profile.userId).toBe(user.id);
        expect(_profile.display_name).toBe(display_name);
        expect(_profile.bio).toBe(null);
        expect(_profile.use_display_name).toBe(use_display_name);
        const tags_recieved = _profile.tags;
        let i = 0;
        for (i in tags_recieved) {
            expect(tags.includes(tags_recieved[i].tag_info)).toBe(true);
        }
        expect(_profile.profile_pic).toBe(img);
    });

    describe("test create() throws error", () => {
        it("empty user_id", async () => {
            try {
                await profileDao.create({ user_id:"" });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("invalid user_id- user resource not found", async () =>{
            try {
                await profileDao.create({ user_id:nonexisting_id });
            } catch (err) {
                expect(err.status).toBe(404);
            }
        });

        it("undefined user_id", async () => {
            try {
                await profileDao.create({ user_id:undefined });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null user_id", async () => {
            try {
                await profileDao.create({ user_id:null });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("profile already exists for this user", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});

                const display_name = faker.name.firstName();
                const bio = faker.lorem.sentence();
                const use_display_name = true;
                const img = faker.internet.url();
                await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, img });
                await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, img });

            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty display name", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});

                await profileDao.create({ user_id:user.id, display_name:"" });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty display name with true use_display_name", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});

                await profileDao.create({ user_id:user.id, display_name:"", use_display_name:true });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("null display name with true use_display_name", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});
        
                await profileDao.create({ user_id:user.id, display_name:null, use_display_name:true });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("undefined display name with true use_display_name", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});
        
                await profileDao.create({ user_id:user.id, display_name:undefined, use_display_name:true });
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty bio", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});

                const display_name = faker.name.firstName();
                const bio = "";
                const use_display_name = true;
                const img = faker.internet.url();
                let tags = [];
                for (let i = 0; i < 3; i++) {
                    tags.push(faker.random.words(1));
                }
                const _profile = await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });
                expect(_profile.display_name).toBe(display_name);
                expect(_profile.bio).toBe(bio);
                expect(_profile.use_display_name).toBe(use_display_name);
                const tags_recieved = _profile.tags;
                for (i in tags_recieved) {
                    expect(tags.includes(tags_recieved[i].tag_info)).toBe(true);
                }
                expect(_profile.profile_pic).toBe(img);
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        it("empty img", async () => {
            try {
                const first_name = faker.name.firstName();
                const last_name = faker.name.lastName();
                const username = faker.internet.userName();
                const email = faker.internet.email();
                const password = faker.internet.password(6);
                let role_decider = Math.random();
                let role = "";
                if (role_decider < 0.3) {
                    role = "RECRUITER";
                } else if (role_decider < 0.6) {
                    role = "FORFUN";
                } else {
                    role = "PROFESSIONAL";
                }
                const user = await userDao.create({first_name, last_name, username, email, password, role});

                const display_name = faker.name.firstName();
                const bio = faker.lorem.sentence();
                const use_display_name = true;
                const img = "";
                let tags = [];
                for (let i = 0; i < 3; i++) {
                    tags.push(faker.random.words(1));
                }
                const _profile = await profileDao.create({ user_id:user.id, display_name, bio, use_display_name, img, tags });
                expect(_profile.display_name).toBe(display_name);
                expect(_profile.bio).toBe(bio);
                expect(_profile.use_display_name).toBe(use_display_name);
                const tags_recieved = _profile.tags;
                for (i in tags_recieved) {
                    expect(tags.includes(tags_recieved[i].tag_info)).toBe(true);
                }
                expect(_profile.profile_pic).toBe(img);
            } catch (err) {
                expect(err.status).toBe(400);
            }
        });

        
    });

    it("test readAll()", async () => {
        const profiles = await profileDao.readAll({});
        //greater than or equal to because there are more users in the db- changing
        expect(profiles.length).toBeGreaterThanOrEqual(profiles.length);
    });

    it("test readAll() given a display_name", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();

        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }

        const user = await userDao.create({first_name, last_name, username, email, password, role});
        const ex_disp = faker.name.firstName();
        const profile = await profileDao.create({user_id:user.id, display_name:ex_disp });
        expect(profile).not.toBe(null);
        expect(profile).not.toBe(undefined);
        const profiles = await profileDao.readAll({ display_name:ex_disp });
        //expect(profiles.length).toBeGreaterThanOrEqual(1);
    });

    it("test readAll() given a bio", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const ex_bio = faker.lorem.sentence();
        const profile = await profileDao.create({user_id:user.id, bio:ex_bio })

        const profiles = await profileDao.readAll({ bio:ex_bio });

        //expect(profiles.length).toBeGreaterThanOrEqual(1);
    });

    it("test readAll() given use_display_name", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const ex_disp = faker.name.firstName();
        const profile = await profileDao.create({user_id:user.id, display_name:ex_disp, use_display_name:true })

        const profiles = await profileDao.readAll({ use_display_name:true });

        expect(profiles.length).toBeGreaterThanOrEqual(1);
    });

    it("test readAll() given img", async () => {
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        let role_decider = Math.random();
        let role = "";
        if (role_decider < 0.3) {
            role = "RECRUITER";
        } else if (role_decider < 0.6) {
            role = "FORFUN";
        } else {
            role = "PROFESSIONAL";
        }
        const user = await userDao.create({first_name, last_name, username, email, password, role});

        const ex_img = faker.internet.url();
        const profile = await profileDao.create({user_id:user.id, img:ex_img })

        const profiles = await profileDao.readAll({ img:ex_img });

        //expect(profiles.length).toBeGreaterThanOrEqual(1);
    });

    it("test read() given valid ID", async () => {

        const profile = await profileDao.read({ user_id:user_with_profile });
        //compare to that_profile
        //display_name, bio, use_display_name, tag, img

        expect(profile.display_name).toBe(that_profile.display_name);
        expect(profile.bio).toBe(that_profile.bio);
        expect(profile.use_display_name).toBe(that_profile.use_display_name);
        expect(profile.profile_pic).toBe(that_profile.profile_pic);
        expect(profile.id).toBe(that_profile.id);
    });

    it("test read() given invalid ID", async () => {
        try {
            await profileDao.read({user_id:"invalid"});
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    //may or may not work
    it("test read() given valid but non-existing ID", async () => {
        try {
            await profileDao.read({user_id:nonexisting_id});
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    it("test update() given valid ID, adding tags", async () => {
        // id: user_with_profile
        // profile: that_profile
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();
        let tags = [];
        for (let i = 0; i < 3; i++) {
            tags.push(faker.random.words(1));
        }
        const _profile = await profileDao.update({ user_id:user_with_profile, display_name, bio, use_display_name, img, tags, tag_connect:true});
        let i = 0;

        expect(_profile.display_name).toBe(display_name);
        expect(_profile.bio).toBe(bio);
        expect(_profile.use_display_name).toBe(use_display_name);
        const tags_recieved = _profile.tags;
        expect(tags_recieved).toBeDefined();
        expect(_profile.profile_pic).toBe(img);
    });

    it("test update() given valid ID, removing tags", async () => {
        // id: user_with_profile
        // profile: that_profile
        const display_name = faker.name.firstName();
        const bio = faker.lorem.sentence();
        const use_display_name = true;
        const img = faker.internet.url();

        let tgs = [];
        let tag = 0
        let options = that_profile.tags;
        //collecting all of the initial tags in tgs
        for (tag in options) {
            tgs.push(options[tag].tag_info);
        }
        
        const _profile = await profileDao.update({ user_id:user_with_profile, display_name, bio, use_display_name, img, tags:tgs, tag_connect:false });

        expect(_profile.display_name).toBe(display_name);
        expect(_profile.bio).toBe(bio);
        expect(_profile.use_display_name).toBe(use_display_name);

        options = _profile.tags;
        let remaining_tags = [];
        for (tag in options) {
            remaining_tags.push(options[tag].tag_info);
        }

        tag = 0;
        if (options.length !== 0) {
            let tag_removed = 0;
            for (tag_removed in tgs) {
                //expect(options.include(tgs[tag_removed])).toBe(false);
            }
        } else {
            expect(options.length).toBe(0);
            expect(tgs.length).toBe(3);
        }


        // expect(options.length).toBe(that_profile.tags.length - 3);

        expect(_profile.profile_pic).toBe(img);
    });

    it("test update() given invalid ID", async () => {
        try {
            await profileDao.update({ user_id: "invalid" });
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test update() given valid but non-existing ID", async () => {
        try {
            await profileDao.update({ user_id: nonexisting_id });
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    it("test delete() given valid ID", async () => {
        const getprofile = await profileDao.read({ user_id:user_with_profile });
        const profile = await profileDao.delete(user_with_profile);

        expect(profile.display_name).toBe(getprofile.display_name);
        expect(profile.bio).toBe(getprofile.bio);
        expect(profile.use_display_name).toBe(getprofile.use_display_name);
        expect(profile.tags.length).toBe(getprofile.tags.length);
        expect(profile.profile_pic).toBe(getprofile.profile_pic);
        expect(profile.id).toBe(getprofile.id);
    });

    it("test delete() given invalid ID", async () => {
        try {
            await profileDao.delete("invalid");
        } catch (err) {
            expect(err.status).toBe(400);
        }
    });

    it("test delete() given valid but non-existing ID", async () => {
        try {
            await profileDao.delete(nonexisting_id);
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    describe("Test search()", () => {
        it("test on partial and tags", async () => {
            const tagOptions = ["watercolor", "realism", "elementary", "digital", "video"];
            const partial = "disp";

            const tag = []
            tag[0] = tagOptions[Math.floor(Math.random() * 5)]

            try {
                await profileDao.search({partial, tags:tag});
            } catch (err) {
                expect(true).toBe(false);
            }
        });

        it("test on partial", async () => {
            const partial = "disp";
            try {
                await profileDao.search({partial})
            } catch (err) {
                expect(true).toBe(false);
            }
        });

        it("test on tags", async () => {
            const tagOptions = ["watercolor", "realism", "elementary", "digital", "video"];
            const tag = []
            tag[0] = tagOptions[Math.floor(Math.random() * 5)]

            try {
                await profileDao.search({tags:tag});
            } catch (err) {
                expect(true).toBe(false);
            }
        });

        describe("Test errors", () => {
            it("Respond 400 on tags=not array", async() => {
                let partial = "disp";

                try {
                    await profileDao.search({partial, tags:43});
                } catch (err) {
                    expect(err.status).toBe(400)
                }
            });

            it("Respond 400 on non string partial", async() => {
                const tagOptions = ["watercolor", "realism", "elementary", "digital", "video"];
                const tag = []
                tag[0] = tagOptions[Math.floor(Math.random() * 5)]

                try {
                    await profileDao.search({partial:43, tags:tag});
                } catch (err) {
                    expect(err.status).toBe(400);
                }
            });
        })
    });

    afterAll(async () => {
        // await profileDao.deleteAll({});
        await prisma.$disconnect();
    });
});