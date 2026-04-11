import axios from "axios";



export const getLeaderboard = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const scoreUrl = process.env.SCORE_SERVICE_URL || "";

        const scoresRes = await axios.get(`${scoreUrl}/api/scores/ranking/target/${targetId}`);

        const leaderboard = scoresRes.data
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, 10);

        res.json(leaderboard);
    } catch (error) {
        next(error);
    }
};

export const getParticipantStats = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const registerUrl = process.env.REGISTER_SERVICE_URL || "";
        const scoreUrl = process.env.SCORE_SERVICE_URL || "";

        const [regsRes, scoresRes] = await Promise.all([
            axios.get(`${registerUrl}/api/registrations/user/${userId}`).catch(() => ({ data: [] })),
            axios.get(`${scoreUrl}/api/scores/user/${userId}`).catch(() => ({ data: [] }))
        ]);

        const registrations = regsRes.data;
        const scores = scoresRes.data;

        const totalParticipations = registrations.length;
        const averageScore = scores.length > 0 
            ? scores.reduce((acc, s) => acc + s.finalScore, 0) / scores.length 
            : 0;

        const wins = scores.filter(s => s.rank && s.rank <= 3).length;
        const winPercentage = totalParticipations > 0 ? (wins / totalParticipations) * 100 : 0;

        res.json({
            userId,
            totalParticipations,
            averageScore: parseFloat(averageScore.toFixed(2)),
            winPercentage: parseFloat(winPercentage.toFixed(2))
        });
    } catch (error) {
        next(error);
    }
};
