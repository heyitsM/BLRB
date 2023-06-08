import express from "express";
import RecruiterInfoDao from "../data/RecruiterInfoDao.js";
import { factory } from "../util/debug.js";
import ApiError from "../util/ApiError.js";
import * as dotenv from "dotenv";
import {checkPermission} from "./token.js";

dotenv.config();
const DB_URL = process.env.DATABASE_URL;
const debug = factory(import.meta.url);
const router = express.Router();
export const recruiterInfoDao = new RecruiterInfoDao();
const endpoint = "/recruiterInfos";

//get all by sending nothing in body
//can send in company, position, and company_email as query parameters if you want
router.get(`${endpoint}`, checkPermission, async (req, res, next) => {
    try {
        const { company, position, company_email } = req.query;
        const recruiterInfos = await recruiterInfoDao.readAll({company, position, company_email});
        res.json({
            status:200,
            message: `Successfully retrieved ${recruiterInfos.length} recruiterInfos!`,
            data:recruiterInfos
        })
    } catch (err) {
        next(err);
    }
});

//get by sending id in as param
router.get(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recruiterInfo = await recruiterInfoDao.read(id);
        res.json({
            status:200,
            message:"Successfully retrieved the following recruiter info document",
            data:recruiterInfo
        });
    } catch (err) {
        next(err)
    }
});

router.post(`${endpoint}`, checkPermission, async (req, res, next) => {
    try {
        const { id, company, position, company_email } = req.body;
        const recruiterInfo = await recruiterInfoDao.create({ id, company, position, company_email });
        res.status(201).json({
            status:201,
            message: "Successfully created the following recruiter info document",
            data:recruiterInfo
        });
    } catch (err) {
        next(err);
    }
});

router.put(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { company, position, company_email } = req.body
        const recruiterInfo = await recruiterInfoDao.update({id, company, position, company_email});
        res.json({
            status:201,
            message: "Successfully updated the following recruiter info document",
            data:recruiterInfo
        });
    } catch (err) {
        next(err);
    }
});

router.delete(`${endpoint}/:id`, checkPermission, async (req, res, next) => {
    try {
        const { id } = req.params;
        const recruiterInfo = await recruiterInfoDao.delete(id);
        res.json({
            status:200,
            message:"Deleted the following recruiter info document",
            data: recruiterInfo
        });
    } catch (err) {
        next(err)
    }
});

router.delete(`${endpoint}`, checkPermission, async (req, res, next) => {
    try {
        const recruiterInfos = await recruiterInfoDao.deleteAll({});
        res.json({
            status:200,
            message:"Successfully deleted all recruiter info documents!"
        });
    } catch (err) {
        next(err)
    }
});

export default router;