import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Score:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of ObjectId door MongoDB gegenereerd
 *         submissionId:
 *           type: string
 *           description: ObjectId van de inzending waartoe deze score behoort
 *         targetId:
 *           type: string
 *           description: ObjectId van de target
 *         participantId:
 *           type: string
 *           description: ObjectId van de participant
 *         competitionId:
 *           type: string
 *           description: ObjectId van de competitie
 *         imaggaMatchPercent:
 *           type: number
 *           description: De base match score uit Imagga API
 *         timePenaltyFactor:
 *           type: number
 *           description: Factor voor de tijd (tussen 0 en 1)
 *         finalScore:
 *           type: number
 *           description: De definitieve score na factor berekening
 *         targetTags:
 *           type: array
 *           items:
 *             type: string
 *           description: Beknopt overzicht van target tags
 *         submissionTags:
 *           type: array
 *           items:
 *             type: string
 *           description: Beknopt overzicht van submission tags
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const scoreSchema = new mongoose.Schema({
  submissionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  imaggaMatchPercent: {
    type: Number,
    required: true
  },
  timePenaltyFactor: {
    type: Number,
    required: true
  },
  finalScore: {
    type: Number,
    required: true
  },
  targetTags: {
    type: [String],
    default: []
  },
  submissionTags: {
    type: [String],
    default: []
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

const Score = mongoose.model('Score', scoreSchema);

export default Score;
