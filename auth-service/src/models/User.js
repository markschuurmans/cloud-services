import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID door MongoDB gegenereerd
 *         email:
 *           type: string
 *           format: email
 *           description: Uniek e-mailadres van de gebruiker
 *         role:
 *           type: string
 *           enum: [participant, owner]
 *           description: Rol van de gebruiker. Participant is een deelnemer en owner is een eigenaar van een target
 *         displayName:
 *           type: string
 *           description: Weergavenaam van de gebruiker
 *         isActive:
 *           type: boolean
 *           description: Geeft aan of account actief is
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['participant', 'owner'],
    default: 'participant'
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
