import express from 'express';
import { 
  getTargets,
  getTargetById,
  updateTargetStatus,
  getActiveTargets
} from '../controllers/competitionController.js';
import { 
  registerForTarget,
  getRegistrationsForTarget
} from '../controllers/registrationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TargetRegistrations
 *   description: Target enrollment and participant registrations
 */

/**
 * @swagger
 * /api/targets:
 *   get:
 *     summary: Get all targets with participant counts
 *     tags: [TargetRegistrations]
 *     responses:
 *       200:
 *         description: List of targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', getTargets);

/**
 * @swagger
 * /api/targets/active:
 *   get:
 *     summary: Get all active targets with participant counts
 *     tags: [TargetRegistrations]
 *     responses:
 *       200:
 *         description: List of active targets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/active', getActiveTargets);

/**
 * @swagger
 * /api/targets/{id}:
 *   get:
 *     summary: Get target by ID with participant counts
 *     tags: [TargetRegistrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Target ID
 *     responses:
 *       200:
 *         description: Target details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Target not found
 */
router.get('/:id', getTargetById);

/**
 * @swagger
 * /api/targets/{id}/status:
 *   patch:
 *     summary: Update target status (Internal endpoint for Clock Service)
 *     tags: [TargetRegistrations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Target ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, active, finished]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Target not found
 */
router.patch('/:id/status', updateTargetStatus);

/**
 * @swagger
 * /api/targets/{id}/register:
 *   post:
 *     summary: Register for a target
 *     tags: [TargetRegistrations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Target ID
 *     responses:
 *       201:
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       400:
 *         description: Registration closed or already registered
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Target not found
 */
router.post('/:id/register', authMiddleware, registerForTarget);

/**
 * @swagger
 * /api/targets/{id}/registrations:
 *   get:
 *     summary: Get all registrations for a target
 *     tags: [TargetRegistrations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Target ID
 *     responses:
 *       200:
 *         description: List of registrations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Registration'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden. Only owners can view registrations.
 */
router.get('/:id/registrations', authMiddleware, getRegistrationsForTarget);

export default router;
