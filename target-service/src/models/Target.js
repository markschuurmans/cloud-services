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
 *         competitionId:
 *           type: string
 *           description: ObjectId van de competitie waartoe deze target behoort
 *         ownerId:
 *           type: string
 *           description: ObjectId van de admin/eigenaar die de target heeft aangemaakt
 *         title:
 *           type: string
 *           description: Titel/naam van de target
 *         imageUrl:
 *           type: string
 *           description: URL naar de lokaal opgeslagen referentiefoto
 *         locationName:
 *           type: string
 *           description: Optionele naam van de locatie (voor aanwijzingen)
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Zoektermen of hints
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const targetSchema = new mongoose.Schema({
  competitionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Competition'
  },
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
  imageUrl: {
    type: String,
    required: true
  },
  locationName: {
    type: String,
    trim: true
  },
  tags: {
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

const Target = mongoose.model('Target', targetSchema);

export default Target;
