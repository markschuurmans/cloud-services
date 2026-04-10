import mongoose from "mongoose";

/**
 * @swagger
 * components:
 *   schemas:
 *     MailLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: UUID of ObjectId door MongoDB gegenereerd
 *         mailType:
 *           type: string
 *           enum: [registration, target-end, score-result, winner]
 *           description: Type e-mail die verwerkt werd
 *         recipientEmail:
 *           type: string
 *           format: email
 *           description: Ontvanger van de mail
 *         subject:
 *           type: string
 *           description: Onderwerp van de verstuurde mail
 *         status:
 *           type: string
 *           enum: [sent, failed]
 *           description: Resultaat van SMTP verzending
 *         errorMessage:
 *           type: string
 *           nullable: true
 *           description: Foutmelding indien verzending mislukte
 *         payload:
 *           type: object
 *           additionalProperties: true
 *           description: Input payload gebruikt voor template rendering
 *         sentAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
const mailLogSchema = new mongoose.Schema(
    {
        mailType: {
            type: String,
            enum: ["registration", "target-end", "score-result", "winner"],
            required: true,
        },
        recipientEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["sent", "failed"],
            required: true,
        },
        errorMessage: {
            type: String,
            default: null,
        },
        payload: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
        sentAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    },
);

const MailLog = mongoose.model("MailLog", mailLogSchema);

export default MailLog;
