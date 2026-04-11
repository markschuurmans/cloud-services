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

    // Fetch submission data
    const targetServiceUrl = process.env.TARGET_SERVICE_URL || '';
    const submissionRes = await axios.get(`${targetServiceUrl}/api/submissions/${submissionId}`);
    const submission = submissionRes.data;

    // Fetch target data
    const targetRes = await axios.get(`${targetServiceUrl}/api/targets/${submission.targetId}`);
    const target = targetRes.data;

    // Time factor calculation based on target lifecycle.
    const startTime = new Date(target.createdAt).getTime();
    const endTime = target.deadline ? new Date(target.deadline).getTime() : startTime;
    const submissionTime = new Date(submission.submittedAt).getTime();
    
    let timeFactor = 1;

    if (endTime > startTime) {
        let normalizedTime = (submissionTime - startTime) / (endTime - startTime);
        
        if (normalizedTime < 0) normalizedTime = 0;
        if (normalizedTime > 1) normalizedTime = 1;
        
        timeFactor = 1 - (0.2 * normalizedTime);
    }

    // Run Imagga analysis
    const targetTagsRaw = await getImaggaTags(targetServiceUrl + target.imageUrl);
    const submissionTagsRaw = await getImaggaTags(targetServiceUrl + submission.imageUrl);

    const imaggaMatchPercent = calculateImaggaMatch(targetTagsRaw, submissionTagsRaw);
    const finalScore = imaggaMatchPercent * timeFactor;

    const simplifiedTargetTags = targetTagsRaw.filter(t => t.confidence > 30).map(t => t.tag.en);
    const simplifiedSubmissionTags = submissionTagsRaw.filter(t => t.confidence > 30).map(t => t.tag.en);

    const newScore = new Score({
      submissionId,
      targetId: target.id || target._id,
      participantId: submission.participantId,
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
    const { targetId } = req.params;

    const ranking = await Score.find({ targetId })
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

export const getScoresByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const scores = await Score.find({ participantId: userId });
    res.status(200).json(scores);
  } catch (error) {
    next(error);
  }
};

export const finalizeTargetScoringById = async (id) => {
  console.log(`[Score Service] Finalizing scoring for target ${id}`);
  return { message: `Scoring for target ${id} finalized.` };
};

export const finalizeTargetScoring = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await finalizeTargetScoringById(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
