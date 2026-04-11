import express from "express";
import * as readController from "../controllers/readController.js";

const router = express.Router();

/**
 * @swagger
 * /api/read/leaderboard/{targetId}:
 *   get:
 *     summary: Get the top-10 leaderboard for a target
 *     tags: [Read]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Top 10 leaderboard entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LeaderboardEntry'
 */
router.get("/leaderboard/:targetId", readController.getLeaderboard);

/**
 * @swagger
 * /api/read/participant/{userId}/stats:
 *   get:
 *     summary: Get personal statistics for a participant
 *     tags: [Read]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ParticipantStats'
 */
router.get("/participant/:userId/stats", readController.getParticipantStats);

export default router;
