/**
 * @swagger
 * components:
 *   schemas:
 *     ActiveTarget:
 *       type: object
 *       properties:
 *         targetId:
 *           type: string
 *           description: ID of the target
 *         title:
 *           type: string
 *           description: Title of the target
 *         description:
 *           type: string
 *           description: Target description
 *         participantsCount:
 *           type: number
 *           description: Number of currently registered participants
 *     TargetSummary:
 *       type: object
 *       properties:
 *         target:
 *           type: object
 *           description: Core target details
 *         topScores:
 *           type: array
 *           description: Top scores achieved for the target
 *           items:
 *             type: object
 *     LeaderboardEntry:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: The user ID
 *         finalScore:
 *           type: number
 *           description: The final calculation score
 *         timeTaken:
 *           type: number
 *           description: Total time taken
 *     ParticipantStats:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         totalParticipations:
 *           type: number
 *           description: Number of target enrollments
 *         averageScore:
 *           type: number
 *           description: Average score across all targets
 *         winPercentage:
 *           type: number
 *           description: Percentage of times the user placed in a top spot (custom logic)
 */
export default class ReportView {}
