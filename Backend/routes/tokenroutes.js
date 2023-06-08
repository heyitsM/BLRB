import { createToken, checkPermission, decodeToken } from "./token.js";
import express from "express";
const router = express.Router();

const endpoint = '/tokens';

router.get(`${endpoint}/:token`, checkPermission, (req, res, next) => {
    try {
      const { token } = req.params;
      const id = decodeToken(token);
      res.send({
        status:200,
        message: "Decoded valid token",
        body: id
      });
    } catch (err) {
      next(err);
    }
});

export default router;