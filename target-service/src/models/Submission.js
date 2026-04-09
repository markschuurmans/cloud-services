import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Submission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of ObjectId door MongoDB gegenereerd
 *         targetId:
 *           type: string
 *           description: ObjectId van de Target waaraan deze inzending is gekoppeld
 *         participantId:
 *           type: string
 *           description: ObjectId van de gebruiker (participant) die de foto heeft geüpload
 *         imageUrl:
 *           type: string
 *           description: URL naar de lokaal opgeslagen inzendingfoto
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Status van de inzending (standaard 'pending')
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: Tijdstip van inzending
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const submissionSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Target'
  },
  participantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  imageUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
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

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
