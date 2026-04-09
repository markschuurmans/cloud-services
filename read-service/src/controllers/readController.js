import axios from "axios";


const getHeaders = (req) => {
    return {
        headers: {
            Authorization: req.headers.authorization
        }
    };
};

export const getActiveCompetitions = async (req, res, next) => {
    try {
        const registerUrl = process.env.REGISTER_SERVICE_URL || "http://register-service:3002";
        
        const compsRes = await axios.get(`${registerUrl}/competitions/active`, getHeaders(req));
        const competitions = compsRes.data;

        // TODO: For each competition, we could fetch registrations count
        // Assuming register-service handles this or we fetch it here
        // If register-service already returns participantCount, we're done.
        // Otherwise we aggregate. Let's assume register-service endpoint /competitions/active
        // already includes the count per competition for performance.
        
        res.json(competitions);
    } catch (error) {
        next(error);
    }
};

export const getCompetitionSummary = async (req, res, next) => {
    try {
        const { id } = req.params;
        const registerUrl = process.env.REGISTER_SERVICE_URL || "http://register-service:3002";
        const targetUrl = process.env.TARGET_SERVICE_URL || "http://target-service:3003";
        const scoreUrl = process.env.SCORE_SERVICE_URL || "http://score-service:3004";

        const [compRes, targetsRes, scoresRes] = await Promise.all([
            axios.get(`${registerUrl}/competitions/${id}`, getHeaders(req)).catch(() => ({ data: null })),
            axios.get(`${targetUrl}/targets?competitionId=${id}`, getHeaders(req)).catch(() => ({ data: [] })),
            axios.get(`${scoreUrl}/scores/competition/${id}`, getHeaders(req)).catch(() => ({ data: [] }))
        ]);

        if (!compRes.data) {
            return res.status(404).json({ error: "Competition not found" });
        }

        res.json({
            competition: compRes.data,
            targets: targetsRes.data,
            topScores: scoresRes.data.slice(0, 10)
        });
    } catch (error) {
        next(error);
    }
};

export const getLeaderboard = async (req, res, next) => {
    try {
        const { compId } = req.params;
        const scoreUrl = process.env.SCORE_SERVICE_URL || "http://score-service:3004";

        const scoresRes = await axios.get(`${scoreUrl}/scores/competition/${compId}`, getHeaders(req));
        
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
        const registerUrl = process.env.REGISTER_SERVICE_URL || "http://register-service:3002";
        const scoreUrl = process.env.SCORE_SERVICE_URL || "http://score-service:3004";

        const [regsRes, scoresRes] = await Promise.all([
            axios.get(`${registerUrl}/registrations/user/${userId}`, getHeaders(req)).catch(() => ({ data: [] })),
            axios.get(`${scoreUrl}/scores/user/${userId}`, getHeaders(req)).catch(() => ({ data: [] }))
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
