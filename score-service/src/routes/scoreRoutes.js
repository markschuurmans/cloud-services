import express from 'express';
import { analyzeScore, getRanking } from '../controllers/scoreController.js';
import authMiddleware from '../middleware/authMiddleware.js';

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
router.post('/scores/analyze', authMiddleware, analyzeScore);

/**
 * @swagger
 * /api/scores/ranking/{compId}:
 *   get:
 *     summary: Retrieve ranking for a specific competition
 *     tags: [Scores]
 *     parameters:
 *       - in: path
 *         name: compId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ordered list of rankings
 */
router.get('/scores/ranking/:compId', getRanking);

export default router;
