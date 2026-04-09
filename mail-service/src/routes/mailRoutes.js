import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    sendCompetitionEndMail,
    sendRegistrationMail,
    sendScoreResultMail,
    sendWinnerMail,
} from "../controllers/mailController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mail
 *   description: Internal mail delivery endpoints
 */

/**
 * @swagger
 * /mail/registration:
 *   post:
 *     summary: Send registration confirmation mail
 *     tags: [Mail]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientEmail, displayName, competitionTitle]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               competitionTitle:
 *                 type: string
 *     responses:
 *       202:
 *         description: Mail queued
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/mail/registration", authMiddleware, sendRegistrationMail);

/**
 * @swagger
 * /mail/competition-end:
 *   post:
 *     summary: Send deadline/competition end notification mail
 *     tags: [Mail]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientEmail, displayName, competitionTitle]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               competitionTitle:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       202:
 *         description: Mail queued
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/mail/competition-end", authMiddleware, sendCompetitionEndMail);

/**
 * @swagger
 * /mail/score-result:
 *   post:
 *     summary: Send score result mail to participant
 *     tags: [Mail]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientEmail, displayName, competitionTitle, score]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               competitionTitle:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       202:
 *         description: Mail queued
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/mail/score-result", authMiddleware, sendScoreResultMail);

/**
 * @swagger
 * /mail/winner:
 *   post:
 *     summary: Send winner announcement mail
 *     tags: [Mail]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientEmail, displayName, competitionTitle, score]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               competitionTitle:
 *                 type: string
 *               score:
 *                 type: number
 *     responses:
 *       202:
 *         description: Mail queued
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/mail/winner", authMiddleware, sendWinnerMail);

export default router;
