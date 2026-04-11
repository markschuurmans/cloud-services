import express from "express";
import {
    sendCompetitionEndMail,
    sendRegistrationMail,
    sendScoreResultMail,
    sendWinnerMail,
    notifyTargetEnd,
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
 *             required: [recipientEmail, displayName, targetTitle]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               targetTitle:
 *                 type: string
 *     responses:
 *       202:
 *         description: Mail queued
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 */
router.post("/mail/registration", sendRegistrationMail);

/**
 * @swagger
 * /mail/target-end:
 *   post:
 *     summary: Send deadline/target end notification mail
 *     tags: [Mail]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientEmail, displayName, targetTitle]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               targetTitle:
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
router.post("/mail/target-end", sendCompetitionEndMail);

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
 *             required: [recipientEmail, displayName, targetTitle, score]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               targetTitle:
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
router.post("/mail/score-result", sendScoreResultMail);

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
 *             required: [recipientEmail, displayName, targetTitle, score]
 *             properties:
 *               recipientEmail:
 *                 type: string
 *                 format: email
 *               displayName:
 *                 type: string
 *               targetTitle:
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
router.post("/mail/winner", sendWinnerMail);

export default router;

/**
 * @swagger
 * /api/mail/target/{targetId}/notify:
 *   post:
 *     summary: Trigger mass notifications for a target end
 *     tags: [Mail]
 *     parameters:
 *       - in: path
 *         name: targetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Notification process initiated
 */
router.post("/mail/target/:targetId/notify", notifyTargetEnd);
