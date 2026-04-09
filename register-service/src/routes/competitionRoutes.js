import express from 'express';
import { 
  createCompetition, 
  getCompetitions, 
  getCompetitionById, 
  updateCompetitionStatus 
} from '../controllers/competitionController.js';
import { 
  registerForCompetition, 
  getRegistrationsForCompetition 
} from '../controllers/registrationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Competitions
 *   description: Competition management and registration
 */

/**
 * @swagger
 * /api/competitions:
 *   post:
 *     summary: Create a new competition
 *     tags: [Competitions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Competition created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competition'
 *       403:
 *         description: Forbidden
 */
router.post('/', authMiddleware, createCompetition);

/**
 * @swagger
 * /api/competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: List of competitions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Competition'
 */
router.get('/', getCompetitions);

/**
 * @swagger
 * /api/competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Competition details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Competition'
 *       404:
 *         description: Competition not found
 */
router.get('/:id', getCompetitionById);

/**
 * @swagger
 * /api/competitions/{id}/status:
 *   patch:
 *     summary: Update competition status (Internal endpoint for Clock Service)
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Competition ID
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
 *               $ref: '#/components/schemas/Competition'
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Competition not found
 */
router.patch('/:id/status', updateCompetitionStatus);

/**
 * @swagger
 * /api/competitions/{id}/register:
 *   post:
 *     summary: Register for a competition
 *     tags: [Competitions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Competition ID
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
 *         description: Competition not found
 */
router.post('/:id/register', authMiddleware, registerForCompetition);

/**
 * @swagger
 * /api/competitions/{id}/registrations:
 *   get:
 *     summary: Get all registrations for a competition
 *     tags: [Competitions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Competition ID
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
router.get('/:id/registrations', authMiddleware, getRegistrationsForCompetition);

export default router;
