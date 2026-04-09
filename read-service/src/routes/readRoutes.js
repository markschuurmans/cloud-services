import express from "express";
import * as readController from "../controllers/readController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * /read/competitions/active:
 *   get:
 *     summary: Get all active competitions with participant counts
 *     tags: [Read]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of active competitions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActiveCompetition'
 */
router.get("/competitions/active", authMiddleware, readController.getActiveCompetitions);

/**
 * @swagger
 * /read/competitions/{id}/summary:
 *   get:
 *     summary: Get a full summary of a specific competition
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
 *         description: Competition summary including targets and top scores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompetitionSummary'
 *       404:
 *         description: Competition not found
 */
router.get("/competitions/:id/summary", authMiddleware, readController.getCompetitionSummary);

/**
 * @swagger
 * /read/leaderboard/{compId}:
 *   get:
 *     summary: Get the top-10 leaderboard for a competition
 *     tags: [Read]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: compId
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
router.get("/leaderboard/:compId", authMiddleware, readController.getLeaderboard);

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
