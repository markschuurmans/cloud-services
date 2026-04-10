import express from 'express';
import { getRegistrationsByUser } from '../controllers/registrationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

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

export default router;
