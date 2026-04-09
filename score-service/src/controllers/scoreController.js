import axios from 'axios';
import Score from '../models/Score.js';
import { getImaggaTags, calculateImaggaMatch } from '../services/imaggaService.js';

export const analyzeScore = async (req, res, next) => {
  try {
    const { submissionId } = req.body;
    
    if (!submissionId) {
      return res.status(400).json({ error: 'submissionId is required for analysis.' });
    }

    const existingScore = await Score.findOne({ submissionId });
    if (existingScore) {
      return res.status(409).json({ error: 'Score already calculated for this submission.' });
    }

    const authHeaders = req.headers.authorization ? { 'Authorization': req.headers.authorization } : {};

    // Fetch submission data
    const targetServiceUrl = process.env.TARGET_SERVICE_URL || 'http://localhost:3003';
    const submissionRes = await axios.get(`${targetServiceUrl}/api/submissions/${submissionId}`, { headers: authHeaders });
    const submission = submissionRes.data;

    // Fetch target data
    const targetRes = await axios.get(`${targetServiceUrl}/api/targets/${submission.targetId}`, { headers: authHeaders });
    const target = targetRes.data;

    // Fetch competition data
    const registerServiceUrl = process.env.REGISTER_SERVICE_URL || 'http://localhost:3002';
    const compRes = await axios.get(`${registerServiceUrl}/api/competitions/${target.competitionId}`, { headers: authHeaders });
    const competition = compRes.data;

    // Time factor calculation
    const startTime = new Date(competition.createdAt).getTime();
    const endTime = new Date(competition.deadline).getTime();
    const submissionTime = new Date(submission.submittedAt).getTime();
    
    let timeFactor = 1;

    if (endTime > startTime) {
        let normalizedTime = (submissionTime - startTime) / (endTime - startTime);
        
        if (normalizedTime < 0) normalizedTime = 0;
        if (normalizedTime > 1) normalizedTime = 1;
        
        timeFactor = 1 - (0.2 * normalizedTime);
    }

    // Run Imagga analysis
    const targetTagsRaw = await getImaggaTags(target.imageUrl);
    const submissionTagsRaw = await getImaggaTags(submission.imageUrl);

    const imaggaMatchPercent = calculateImaggaMatch(targetTagsRaw, submissionTagsRaw);
    const finalScore = imaggaMatchPercent * timeFactor;

    const simplifiedTargetTags = targetTagsRaw.filter(t => t.confidence > 30).map(t => t.tag.en);
    const simplifiedSubmissionTags = submissionTagsRaw.filter(t => t.confidence > 30).map(t => t.tag.en);

    // Save new score
    const newScore = new Score({
      submissionId,
      targetId: target.id,
      participantId: submission.participantId,
      competitionId: target.competitionId,
      imaggaMatchPercent: Number(imaggaMatchPercent.toFixed(2)),
      timePenaltyFactor: Number(timeFactor.toFixed(4)),
      finalScore: Number(finalScore.toFixed(2)),
      targetTags: simplifiedTargetTags,
      submissionTags: simplifiedSubmissionTags
    });

    const savedScore = await newScore.save();

    return res.status(201).json(savedScore);
  } catch (error) {
    if (error.response) {
      console.error('External API fetch failed:', error.response.status, error.response.data);
      return res.status(error.response.status).json({ error: error.response.data?.error || 'Failed communicating with other services.' });
    }
    next(error);
  }
};

export const getRanking = async (req, res, next) => {
  try {
    const { compId } = req.params;
    
    const ranking = await Score.find({ competitionId: compId })
      .sort({ 
        finalScore: -1, 
        imaggaMatchPercent: -1,
        timePenaltyFactor: -1
      });

    return res.status(200).json(ranking);
  } catch (error) {
    next(error);
  }
};
