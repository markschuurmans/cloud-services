import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Competition:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of ObjectId door MongoDB gegenereerd
 *         title:
 *           type: string
 *           description: Titel van de competitie
 *         description:
 *           type: string
 *           description: Beschrijving van de competitie
 *         ownerId:
 *           type: string
 *           description: De ObjectId van de eigenaar (user met role owner)
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Deadline van de competitie
 *         registrationOpen:
 *           type: boolean
 *           description: Geeft aan of de inschrijving geopend is
 *         status:
 *           type: string
 *           enum: [pending, active, finished]
 *           description: Huidige status van de competitie
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const competitionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  deadline: {
    type: Date,
    required: true
  },
  registrationOpen: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'finished'],
    default: 'pending'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

const Competition = mongoose.model('Competition', competitionSchema);

export default Competition;
