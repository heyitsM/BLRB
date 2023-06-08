import express from "express";
import { factory } from "../util/debug.js";
import NodeMailer from "nodemailer";
import { config } from '../Constants.js';
import {checkPermission} from "./token.js";
import 
    { creation, 
        requeststarted, 
        requestdenied, 
        requestaccepted, 
        paymentconfirmed, 
        paymentcanceled, 
        commissioncomplete
    } from "../util/email.js";

const debug = factory(import.meta.url);
const router = express.Router();
let transporter;

if (process.env.NODE_ENV === "development") {
    const EMAIL_DEV_SECRET = process.env.EMAIL_DEV_SECRET;
    const EMAIL_DEV = process.env.EMAIL_DEV
    transporter = NodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: EMAIL_DEV,
          pass: EMAIL_DEV_SECRET
        }
    });
} else {
    //in production
    const EMAIL_SECRET = process.env.EMAIL_SECRET;
    const EMAIL = process.env.EMAIL;
    transporter = NodeMailer.createTransport({
        // host: "smtp.ethereal.email",
        // port: 587,
        service: 'gmail',
        secure: true, // true for 465, false for other ports
        auth: {
            user: EMAIL, // put in env file
            pass: EMAIL_SECRET, // put in env file
        },
    });
}

//send this on creation of user
//drop this in user creation api function
router.post(`/usercreation`, checkPermission, async (req, res, next) => {
    const { email, name } = req.body;
    try {
        const html = creation(name, email);
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "User Signup", // Subject line
            text: `${name} created an account with email ${email}!`, // plain text body
            html: html, // html body
        });

        res.json({
            status:200,
            message:'Successfully sent user creation email',
        });
    } catch (err) {
        next(err);
    }
});

// send this on commission request sending
// sends an email to commissioner and artist
// probably drop this in whatever api function that is handling commission creation from form
router.post(`/requeststarted`, checkPermission, async (req, res, next) => {
    const { req_name, req_email, pro_name, pro_email, commission_id } = req.body;
    try {
        const html = requeststarted(req_name, req_email, pro_name, pro_email, commission_id);
        //sent to commissioner
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: req_email, // list of receivers
            subject: `Commission Request Initiated!`, // Subject line
            text: `You requested a commission ${commission_id} from ${pro_name}. Check out your dashboard for status updates and further details!`, // plain text body
            html: html[0]
        });
        //sent to artist- get more commission info potentially
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: pro_email, // list of receivers
            subject: `${req_name} Requested a Commission!`, // Subject line
            text: `${req_name} requested a commission ${commission_id} from you! Go check out your dashboard for further details `, // plain text body
            html: html[1]
        });
        res.json({
            status:200,
            message:'Successfully sent request started emails!',
        });
    } catch (err) {
        next(err);
    }
});

//send this on denial by artist of commission request
//sends an email to the commissioner
// action after artist denies commission
router.post(`/requestdenied`, checkPermission, async (req, res, next) => {
    const { req_name, req_email, pro_name, pro_email, commission_id } = req.body;
    try {
        const html = requestdenied(req_name, req_email, pro_name, pro_email, commission_id);
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: pro_email, // list of receivers
            subject: `Commission Request Denied!`, // Subject line
            text: `You denied commission ${commission_id} from ${req_name}.`, // plain text body
            html: html[0]
        });
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: req_email, // list of receivers
            subject: `Commission Request Denied!`, // Subject line
            text: `Your requested commission ${commission_id} for ${pro_name} was denied.`, // plain text body
            html: html[1]
        });
        res.json({
            status:200,
            message:'Successfully sent request denied email!',
        });
    } catch (err) {
        next(err);
    }
});

// send an email to commissioner that notifies them that the commission was accepted and the price was set by the artist
// send an email to artist that notifies them of that they accepted and what price they set
// action after artist accepts commission and sets price
router.post(`/requestaccepted`, checkPermission, async (req, res, next) => {
    const { req_name, req_email, pro_name, pro_email, price, commission_id } = req.body;
    try {
        const html = requestaccepted(req_name, req_email, pro_name, pro_email, price, commission_id);
        //email to commissioner notifying them that the commission was accepted and that the price was set to whatever amount
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: req_email, // list of receivers
            subject: `Commission Request Accepted and Price Set!`, // Subject line
            text: `${pro_name} accepted your commission ${commission_id} and set the price at ${price}. Please go to your dashboard to either accept the price or cancel the commission.`, // plain text body
            html: html[0]
        });

        //email to artist verifying that they accepted the commission and that they set the price to a specific amount
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: pro_email, // list of receivers
            subject: `Commission Request Accepted and Price Set!`, // Subject line
            text: `You accepted a commission ${commission_id} from ${req_name} and set the price at ${price}`, // plain text body
            html: html[1]
        });

        res.json({
            status:200,
            message:'Successfully sent both request accepted emails!',
        });
    } catch (err) {
        next(err);
    }
});

//send email to commissioner and artist to notify them of payment confirmation
//email to artist should tell them to take next steps
//some sort of callback after we get routed back to our page from stripe
router.post(`/paymentconfirmed`, checkPermission, async (req, res, next) => {
    const { req_name, req_email, pro_name, pro_email, commission_id, price } = req.body;
    try {
        //email to commissioner notifying them that the payment was confirmed 
        const html = paymentconfirmed(req_name, req_email, pro_name, pro_email, commission_id, price);
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: req_email, // list of receivers
            subject: `Commission Payment Confirmed`, // Subject line
            text: `You paid ${price} for the commission ${commission_id} from ${pro_name}! They will now begin to fulfill the commission request, and will reach out soon.`, // plain text body
            html: html[0]
        });

        //email to artist notifying them that the payment was confirmed and that they can now take next steps
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: pro_email, // list of receivers
            subject: `Commission Payment Confirmed`, // Subject line
            text: `${req_name} paid ${price} for the commission ${commission_id}! Please now begin to take next steps- begin fulfilling the commission, and get in touch.`, // plain text body
            html: html[1]
        });

        res.json({
            status:200,
            message:'Successfully sent payment confirmed emails!',
        });
    } catch (err) {
        next(err);
    }
});

//send email to artist to notify them that after the price was set, the commissioner decided to cancel the request
// (most likely due to issues with price)
// maybe will be result of cancel button on a commission
router.post(`/paymentcanceled`, checkPermission, async (req, res, next) => {
    const { req_name, req_email, pro_name, pro_email, commission_id } = req.body;
    try {
        //email to commissioner notifying them that the payment was confirmed 
        const html = paymentcanceled(req_name, req_email, pro_name, pro_email, commission_id);
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: req_email, // list of receivers
            subject: `Commission Cancelled`, // Subject line
            text: `You cancelled the commission ${commission_id} from ${pro_name} after the price was set.`, // plain text body
            html: html[0]
        });

        //email to artist notifying them that the payment was confirmed and that they can now take next steps
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: pro_email, // list of receivers
            subject: `Commission Cancelled`, // Subject line
            text: `${req_name} cancelled their commission ${commission_id}.`, // plain text body
            html: html[1]
        });
        res.json({
            status:200,
            message:'Successfully sent payment canceled emails!',
        });
    } catch (err) {
        next(err);
    }
});

router.post(`/commissioncomplete`, checkPermission, async (req, res, next) => {
    const { req_name, req_email, pro_name, pro_email, commission_id } = req.body;
    try {
        const html = commissioncomplete(req_name, req_email, pro_name, pro_email, commission_id);
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: pro_email, // list of receivers
            subject: `Commission Complete`, // Subject line
            text: `You completed ${req_name}'s commission ${commission_id}! Check your commissions tab for more information`, // plain text body
            html: html[1]
        });

        //email to commissioner notifying them that the payment was confirmed 
        await transporter.sendMail({
            from: '"COMM" <commu8cy@gmail.com>', // sender address
            to: req_email, // list of receivers
            subject: `Commission Complete`, // Subject line
            text: `${pro_name} completed your commission ${commission_id}! Check your commissions tab for more information`, // plain text body
            html: html[0]
        });

        res.json({
            status:200,
            message:'Successfully sent commission complete email!',
        });
    } catch (err) {
        next(err);
    }
});

export default router;