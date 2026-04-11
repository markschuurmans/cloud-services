import mongoose from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Target:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of ObjectId door MongoDB gegenereerd
 *         ownerId:
 *           type: string
 *           description: ObjectId van de admin/eigenaar die de target heeft aangemaakt
 *         title:
 *           type: string
 *           description: Titel/naam van de target
 *         description:
 *           type: string
 *           description: Beschrijving van de target
 *         imageUrl:
 *           type: string
 *           description: URL naar de lokaal opgeslagen referentiefoto
 *         deadline:
 *           type: string
 *           format: date-time
 *         locationName:
 *           type: string
 *           description: Optionele naam van de locatie (voor aanwijzingen)
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const targetSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  imageUrl: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    default: null
  },
  locationName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'finished'],
    default: 'active'
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

const Target = mongoose.model('Target', targetSchema);

export default Target;
