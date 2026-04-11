import express from 'express';
import { getStatus, triggerTarget } from '../controllers/clockController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Clock
 *   description: Clock service operations
 */

/**
 * @swagger
 * /api/clock/status:
 *   get:
 *     summary: Retrieve status of the clock service jobs
 *     tags: [Clock]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobsActive:
 *                   type: boolean
 *                 lastRunTime:
 *                   type: string
 *                   format: date-time
 */
router.get('/status', getStatus);
/**
 * @swagger
 * /api/clock/trigger/{id}:
 *   post:
 *     summary: Manually trigger finalization for a specific target
 *     tags: [Clock]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Target ID
 *     responses:
 *       200:
 *         description: Trigger executed successfully
 *       500:
 *         description: Execution failed
 */
router.post('/trigger/:id', triggerTarget);

export default router;
