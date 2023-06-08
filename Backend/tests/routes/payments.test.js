import * as dotenv from "dotenv";
import { describe, it, expect, beforeEach, afterAll, beforeAll } from "vitest";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import app from "../../index.js";
import Stripe from 'stripe';
import { createToken } from "../../routes/token.js";
import { userDao } from "../../routes/users.js";

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET);

const request = new supertest(app);

describe('Testing /payments route', () => {
    let account;    //will be an account that is newly created
    let validaccount; //will be a valid account that can be charged
    let user;
    let usertoken;

    beforeAll(async () => {
        account = await stripe.accounts.create({type: 'standard'});
        const first_name = faker.name.firstName();
        const last_name = faker.name.lastName();
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password(6);
        user = await userDao.create({ first_name, last_name, username, email, password });
        usertoken = createToken({user:user.id, role:"NONADMIN"});
    });

    describe('Testing /setuplink', async () => {
        describe('Testing /setuplink on a valid id', () => {
            it('Respond 200 with a vaild url', async () => {
                const response = await request
                    .post('/payments/setuplink')
                    .set("Authorization", `Bearer ${usertoken}`)
                    .send({
                        id:account.id
                    });
                expect(response.status).toBe(200);
            });
        });
    });
    
    describe('Testing /stripeconnected', async () => {
        describe('Testing /stripeconnected with a valid id', () => {
            it('Respond 200 on a valid id', async () => {
                const response = await request
                    .post('/payments/stripeconnected')
                    .set("Authorization", `Bearer ${usertoken}`)
                    .send({
                        id:account.id
                    });

                expect(response.status).toBe(200);
            });
        });
    });

    describe('Testing /product', async () => {
        describe('Testing /product with valid input', () => {
            it('Respond 200 on username', async () => {
                const username = faker.company.catchPhrase();

                const response = await request
                    .post('/payments/product')
                    .set("Authorization", `Bearer ${usertoken}`)
                    .send({
                        username
                    });

                expect(response.status).toBe(200);
            });
        });
    });

    describe('Testing /price', async () => {
        describe('Testing /price with valid product_id and amount', () => {
            it('Respond 200 on valid product id and amount', async () => {
                const username = faker.company.catchPhrase();
                const amount = Math.random()*100;
                const product = await request
                    .post('/payments/product')
                    .set("Authorization", `Bearer ${usertoken}`)
                    .send({
                        username
                    });

                const response = await request
                    .post('/payments/price')
                    .set("Authorization", `Bearer ${usertoken}`)
                    .send({
                        amount,
                        product_id:product.body.id
                    });

                expect(response.status).toBe(200);
            });
        });
    });

    // describe('Testing /createSession', async () => {
    //     describe('Testing /createSession with valid input', () => {
    //         it('Respond 200 on valid price_id quantity and connected_id', async () => {
    //             const username = faker.company.catchPhrase();
    //             const amount = faker.commerce.price();
    //             const product = await request.post('/product').send({
    //                 username
    //             });

    //             const price = await request.post('/price').send({
    //                 amount,
    //                 product_id:product.id
    //             });

    //             const response = await request.post('/createSession').send({
    //                 price_id:price.id,
    //                 quantity:1,
    //                 connected_id:validaccount.id
    //             });

    //             expect(response.status).toBe(200);
    //         });
    //     });
    // });
    
    // describe('Testing /createPaymentLink', async () => {
    //     describe('Testing /createPaymentLink with valid input', () => {
    //         it('Respond 200 on valid price_id quantity and connected_id', async () => {
    //             const username = faker.company.catchPhrase();
    //             const amount = faker.commerce.price();
    //             const product = await request.post('/product').send({
    //                 username
    //             });

    //             const price = await request.post('/price').send({
    //                 amount,
    //                 product_id:product.id
    //             });

    //             const response = await request.post('/createPaymentLink').send({
    //                 price_id:price.id,
    //                 quantity:1,
    //                 connected_id:validaccount.id
    //             });

    //             expect(response.status).toBe(200);
    //         });
    //     });
    // });
});