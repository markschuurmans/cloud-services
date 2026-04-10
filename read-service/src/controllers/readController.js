import axios from "axios";


const getHeaders = (req) => {
    return {
        headers: {
            Authorization: req.headers.authorization
        }
    };
};

export const getActiveTargets = async (req, res, next) => {
    try {
        const registerUrl = process.env.REGISTER_SERVICE_URL || "";
        const targetsRes = await axios.get(`${registerUrl}/api/targets/active`, getHeaders(req));
        const targets = targetsRes.data;

        res.json(targets);
    } catch (error) {
        next(error);
    }
};

export const getTargetSummary = async (req, res, next) => {
    try {
        const { id } = req.params;
        const registerUrl = process.env.REGISTER_SERVICE_URL || "";
        const targetUrl = process.env.TARGET_SERVICE_URL || "";
        const scoreUrl = process.env.SCORE_SERVICE_URL || "";

        const [targetRes, scoresRes] = await Promise.all([
            axios.get(`${registerUrl}/api/targets/${id}`, getHeaders(req)).catch(() => ({ data: null })),
            axios.get(`${scoreUrl}/api/scores/ranking/target/${id}`, getHeaders(req)).catch(() => ({ data: [] }))
        ]);

        if (!targetRes.data) {
            return res.status(404).json({ error: "Target not found" });
        }

        res.json({
            target: targetRes.data,
            topScores: scoresRes.data.slice(0, 10)
        });
    } catch (error) {
        next(error);
    }
};

export const getLeaderboard = async (req, res, next) => {
    try {
        const { targetId } = req.params;
        const scoreUrl = process.env.SCORE_SERVICE_URL || "";

        const scoresRes = await axios.get(`${scoreUrl}/api/scores/ranking/target/${targetId}`, getHeaders(req));

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
            axios.get(`${registerUrl}/api/registrations/user/${userId}`, getHeaders(req)).catch(() => ({ data: [] })),
            axios.get(`${scoreUrl}/api/scores/user/${userId}`, getHeaders(req)).catch(() => ({ data: [] }))
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
