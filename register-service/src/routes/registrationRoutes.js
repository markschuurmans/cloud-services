import express from 'express';
import { getRegistrationsByTarget, getRegistrationsByUser, registerForTarget } from '../controllers/registrationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

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
 * /api/registrations/user/{userId}:
 *   get:
 *     summary: Get all registrations for a specific user
 *     tags: [Registrations]
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
 *         description: List of user registrations
 */
router.get('/user/:userId', authMiddleware, getRegistrationsByUser);

/**
 * @swagger
 * /api/registrations/target/{targetId}:
 *   get:
 *     summary: Get all registrations for a specific target
 *     tags: [Registrations]
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
 *         description: List of registrations for the target
 */
router.get('/target/:targetId', authMiddleware, getRegistrationsByTarget);

export default router;
