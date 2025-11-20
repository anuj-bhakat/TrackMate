import express from "express";
import { similarityCheck } from "../controllers/similarityController.js";

const router = express.Router();

// POST /similarity
router.post("/", similarityCheck);

export default router;
