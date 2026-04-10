import express from 'express';
import { register, login, profile, getUserById } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Nieuwe gebruiker registreren
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - displayName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               displayName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [participant, owner]
 *     responses:
 *       201:
 *         description: Succesvol geregistreerd
 *       400:
 *         description: Ontbrekende velden
 *       409:
 *         description: E-mail is al in gebruik
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inloggen
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Succesvol ingelogd, retourneert JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Ongeldige inloggegevens
 */
router.post('/login', login);

// Protected routes
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Profiel ophalen van ingelogde gebruiker
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profielinformatie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Niet geautoriseerd
 */
router.get('/profile', authMiddleware, profile);

/**
 * @swagger
 * /api/auth/users/{id}:
 *   get:
 *     summary: Gebruiker ophalen bij ID (Interne service call)
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gebruikersinformatie
 *       404:
 *         description: Gebruiker niet gevonden
 */
router.get('/users/:id', authMiddleware, getUserById);

export default router;
