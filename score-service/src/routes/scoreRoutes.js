import express from 'express';
import { analyzeScore, getRanking, getScoresByUser, finalizeTargetScoring } from '../controllers/scoreController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Scores
 *   description: Score calculation and ranking management
 */

/**
 * @swagger
 * /api/scores/analyze:
 *   post:
 *     summary: Calculate the score of a submission
 *     tags: [Scores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submissionId:
 *                 type: string
 *                 description: ObjectId of the submission to analyze
 *     responses:
 *       201:
 *         description: Analysis successful and score generated
 *       400:
 *         description: Missing parameters
 *       409:
 *         description: Score already calculated
 */
router.post('/scores/analyze', analyzeScore);

/**
 * @swagger
 * /api/scores/ranking/target/{targetId}:
 *   get:
 *     summary: Retrieve ranking for a specific target
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ordered list of rankings
 */
router.get('/scores/ranking/target/:targetId', getRanking);

/**
 * @swagger
 * /api/scores/user/{userId}:
 *   get:
 *     summary: Retrieve scores for a specific user
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user scores
 */
router.get('/scores/user/:userId', getScoresByUser);

export default router;

/**
 * @swagger
 * /api/scores/target/{id}/finalize:
 *   post:
 *     summary: Finalize scoring for a target
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scoring finalized
 */
router.post('/scores/target/:id/finalize', finalizeTargetScoring);
