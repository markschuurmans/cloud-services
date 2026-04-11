/**
 * @swagger
 * components:
 *   schemas:
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
