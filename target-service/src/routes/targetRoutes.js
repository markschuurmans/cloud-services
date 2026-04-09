import express from 'express';
import { createTarget, deleteTarget, getTargets, getTargetById } from '../controllers/targetController.js';
import { createSubmission, deleteSubmission, getSubmissions } from '../controllers/submissionController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { upload } from '../config/multer.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Targets
 *   description: Target management and uploads
 */

/**
 * @swagger
 * /api/targets:
 *   post:
 *     summary: Upload a new target
 *     tags: [Targets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               competitionId:
 *                 type: string
 *               title:
 *                 type: string
 *               locationName:
 *                 type: string
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Target created successfully
 *       403:
 *         description: Only owners or admins can create targets
 *       400:
 *         description: Missing required fields
 */
router.post('/targets', authMiddleware, upload.single('image'), createTarget);

/**
 * @swagger
 * /api/targets:
 *   get:
 *     summary: Get targets (optional filter by competitionId)
 *     tags: [Targets]
 *     parameters:
 *       - in: query
 *         name: competitionId
 *         schema:
 *           type: string
 *         description: Filter targets by competitionId
 *     responses:
 *       200:
 *         description: A list of targets
 */
router.get('/targets', getTargets);

/**
 * @swagger
 * /api/targets/{id}:
 *   get:
 *     summary: Get a specific target by ID
 *     tags: [Targets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Target found
 *       404:
 *         description: Target not found
 */
router.get('/targets/:id', getTargetById);

/**
 * @swagger
 * /api/targets/{id}:
 *   delete:
 *     summary: Delete a target
 *     tags: [Targets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Target deleted securely
 *       403:
 *         description: Unauthorized to delete target
 *       404:
 *         description: Target not found
 */
router.delete('/targets/:id', authMiddleware, deleteTarget);

/**
 * @swagger
 * tags:
 *   name: Submissions
 *   description: Submission management and participant uploads
 */

/**
 * @swagger
 * /api/submissions:
 *   post:
 *     summary: Upload a new submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               targetId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Submission created successfully
 *       403:
 *         description: Only participants can submit
 *       400:
 *         description: Missing required fields or deadline passed
 */
router.post('/submissions', authMiddleware, upload.single('image'), createSubmission);

/**
 * @swagger
 * /api/submissions:
 *   get:
 *     summary: Get submissions (optional filter by targetId)
 *     tags: [Submissions]
 *     parameters:
 *       - in: query
 *         name: targetId
 *         schema:
 *           type: string
 *         description: Filter submissions by targetId
 *     responses:
 *       200:
 *         description: A list of submissions
 */
router.get('/submissions', getSubmissions);

/**
 * @swagger
 * /api/submissions/{id}:
 *   delete:
 *     summary: Delete a submission
 *     tags: [Submissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submission deleted securely
 *       403:
 *         description: Unauthorized to delete submission
 *       404:
 *         description: Submission not found
 */
router.delete('/submissions/:id', authMiddleware, deleteSubmission);

export default router;
