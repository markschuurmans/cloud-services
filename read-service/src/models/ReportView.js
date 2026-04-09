/**
 * @swagger
 * components:
 *   schemas:
 *     ActiveCompetition:
 *       type: object
 *       properties:
 *         competitionId:
 *           type: string
 *           description: ID of the competition
 *         title:
 *           type: string
 *           description: Title of the competition
 *         description:
 *           type: string
 *           description: Competition description
 *         participantsCount:
 *           type: number
 *           description: Number of currently registered participants
 *     CompetitionSummary:
 *       type: object
 *       properties:
 *         competition:
 *           type: object
 *           description: Core competition details
 *         targets:
 *           type: array
 *           description: List of targets for the competition
 *           items:
 *             type: object
 *         topScores:
 *           type: array
 *           description: Top scores achieved in the competition
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
 *           description: Number of competitions participated in
 *         averageScore:
 *           type: number
 *           description: Average score across all competitions
 *         winPercentage:
 *           type: number
 *           description: Percentage of times the user placed in a top spot (custom logic)
 */
export default class ReportView {}
