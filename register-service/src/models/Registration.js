import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of ObjectId door MongoDB gegenereerd
 *         targetId:
 *           type: string
 *           description: ID van de target
 *         participantId:
 *           type: string
 *           description: ID van de deelnemer
 *         status:
 *           type: string
 *           enum: [registered, cancelled, waitlisted]
 *           description: Huidige status van de inschrijving
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const registrationSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['registered', 'cancelled', 'waitlisted'],
    default: 'registered'
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

registrationSchema.index({ targetId: 1, participantId: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
