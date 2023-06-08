import express from "express";
import { factory } from "../util/debug.js";
import Stripe from 'stripe';
import { config } from '../Constants.js';
import {checkPermission} from "./token.js";

const debug = factory(import.meta.url);
const router = express.Router();
const endpoint = "/payments";
const BASE_URL = config.frontend_url;
const STRIPE_SECRET = process.env.STRIPE_SECRET;

const stripe = Stripe(STRIPE_SECRET);

router.post(`${endpoint}/setuplink`, checkPermission, async (req, res, next) => {
    const { id } = req.body;
    try {
        const accountLink = await stripe.accountLinks.create({
            account: id,
            refresh_url: `${BASE_URL}/profile-basics`, //switch when going into prod //'http://localhost:5173/profile'
            return_url:  `${BASE_URL}/profile-basics`,
            type:'account_onboarding'
        });
        res.send(accountLink);
    } catch (err) {
        next(err);
    }
});

router.post(`${endpoint}/stripeconnected`, checkPermission, async (req, res, next) => {
    const { id } = req.body;
    try {
        const account = await stripe.account.retrieve(id);
        res.send(account);
    } catch (err) {
        next(err);
    }
});

router.post(`${endpoint}/product`, checkPermission, async (req, res, next) => {
    const { username } = req.body;
    try {
        const product = await stripe.products.create({name:`${username}'s commission`});
        res.send(product);
    } catch (err) {
        next(err);
    }
});

router.post(`${endpoint}/price`, checkPermission, async (req, res, next) => {
    const { amount, product_id } = req.body;
    try {
        const price = await stripe.prices.create({unit_amount:Math.ceil(amount), currency:'usd', product:product_id});
        res.send(price);
    } catch (err) {
        next(err);
    }
});

router.post(`${endpoint}/createSession`, checkPermission, async (req, res, next) => {
    const { price_id, quantity, connected_id } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            success_url:  `${BASE_URL}/payment-processed`,
            cancel_url:  `${BASE_URL}/payment-failed`,
            line_items: [
              {price: price_id, quantity:quantity},
            ],
            mode: 'payment',
            payment_intent_data: {
                transfer_data: {
                    destination: connected_id,
                },
            },
        });
        res.send(session);
    } catch (err) {
        next(err);
    }
});

router.post(`${endpoint}/createPaymentLink`, checkPermission, async (req, res, next) => {
    const { price_id, quantity, connected_id } = req.body;
    try {
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{price:price_id, quantity:quantity},],
            transfer_data: {destination:connected_id},
            after_completion: {
                redirect: {
                    url: `${BASE_URL}/payment-processed` //update when we have a better idea of where we are redirecting to
                },
                type:"redirect",
            },
            invoice_creation: { enabled:true }
        });
        res.send(paymentLink);
    } catch (err) {
        next(err);
    }
});

// router.post(`${endpoint}`, async (req, res, next) => {
//     const { amount, currency, connected_account_id } = req.body;

//     const customer = await stripe.customers.create();
//     const ephKey = await stripe.ephemeralKeys.create(
//         {customer:customer.id},
//         {apiVersion:'2022-11-15'}
//     );

//     const paymentIntent = await stripe.paymentIntents.create({
//         amount:amount,
//         currency:currency,
//         customer:customer.id,
//         automatic_payment_methods: {
//             enabled: true,
//         },
//         transfer_data: {
//             destination: connected_account_id
//         }
//     });

//     res.json({
//         pyamentIntent: paymentIntent.client_secret,
//         ephemeralKey: ephKey.secret,
//         customer:customer.id,
//         publishableKey: "pk_test_51Mm0HnEbadkDfDP6s16PqxjCmeJ06GqBRL37rw859khJTxKqZWOrEu3yjWuYbG5d2VnH3UiigVdjCU1ik54lSvJo0086a9iv8w"
//     });
// });

export default router;