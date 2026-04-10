import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     JobLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of the JobLog document
 *         targetId:
 *           type: string
 *           description: ID of the target this log is related to
 *         action:
 *           type: string
 *           description: The finalization action executed (e.g. deadline_triggered)
 *         status:
 *           type: string
 *           enum: [success, failed]
 *           description: Result of the automated action
 *         details:
 *           type: string
 *           description: Stringified JSON containing extra information or errors
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const jobLogSchema = new mongoose.Schema({
  targetId: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  details: {
    type: String
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

const JobLog = mongoose.model('JobLog', jobLogSchema);

export default JobLog;
