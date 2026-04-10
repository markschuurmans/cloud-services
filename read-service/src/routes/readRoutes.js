import express from "express";
import * as readController from "../controllers/readController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /read/targets/active:
 *   get:
 *     summary: Get all active targets with participant counts
 *     tags: [Read]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActiveTarget'
 */
router.get("/targets/active", authMiddleware, readController.getActiveTargets);

/**
 * @swagger
 * /read/targets/{id}/summary:
 *   get:
 *     summary: Get a full summary of a specific target
 *     tags: [Read]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Target summary including top scores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TargetSummary'
 *       404:
 *         description: Target not found
 */
router.get("/targets/:id/summary", authMiddleware, readController.getTargetSummary);

/**
 * @swagger
 * /read/leaderboard/{targetId}:
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
router.get("/leaderboard/:targetId", authMiddleware, readController.getLeaderboard);

/**
 * @swagger
 * /read/participant/{userId}/stats:
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
router.get("/participant/:userId/stats", authMiddleware, readController.getParticipantStats);

export default router;
