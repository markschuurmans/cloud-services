import Submission from '../models/Submission.js';
import Target from '../models/Target.js';
import fs from 'fs';
import path from 'path';

export const createSubmission = async (req, res, next) => {
  try {
    if (req.user.role !== 'participant' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only participants can submit.' });
    }

    const { targetId } = req.body;

    if (!targetId) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'targetId is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    // Fetch the target to get competitionId
    const target = await Target.findById(targetId);
    if (!target) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Target not found.' });
    }

    // Check if submission is still within deadline
    const registerServiceUrl = process.env.REGISTER_SERVICE_URL || 'http://localhost:3002';
    try {
      const response = await fetch(`${registerServiceUrl}/api/competitions/${target.competitionId}`, {
        headers: { 'Authorization': req.headers.authorization }
      });
      if (!response.ok) {
        throw new Error('Could not fetch competition data.');
      }
      const competition = await response.json();
      
      const deadline = new Date(competition.deadline);
      if (new Date() > deadline) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: 'The competition deadline has passed. Submissions are no longer accepted.' });
      }
    } catch (fetchError) {
      console.error('Error fetching competition:', fetchError.message);
      return res.status(500).json({ error: 'Could not verify competition deadline.' });
    }

    // Generate file URL
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3003}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const newSubmission = new Submission({
      targetId,
      participantId: req.user.id,
      imageUrl,
      status: 'pending'
    });

    const savedSubmission = await newSubmission.save();

    // Notify Score Service
    const scoreServiceUrl = process.env.SCORE_SERVICE_URL || 'http://localhost:3004';
    try {
      fetch(`${scoreServiceUrl}/api/scores/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization
        },
        body: JSON.stringify({
          submissionId: savedSubmission._id,
          targetImageUrl: target.imageUrl,
          submissionImageUrl: savedSubmission.imageUrl
        })
      }).catch(err => {
         console.error('Score service evaluation trigger failed silently:', err.message);
      });
    } catch (err) {
      console.error('Failed to contact score service', err);
    }

    return res.status(201).json(savedSubmission);
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const deleteSubmission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (submission.participantId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete this submission.' });
    }

    try {
        const filename = submission.imageUrl.split('/uploads/')[1];
        if (filename) {
          const filePath = path.join(process.cwd(), 'src', 'uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
    } catch (fsError) {
        console.error('Failed to delete image file:', fsError);
    }

    await submission.deleteOne();
    return res.status(200).json({ message: 'Submission successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (req, res, next) => {
    try {
      const { targetId } = req.query;
      const filter = targetId ? { targetId } : {};
      const submissions = await Submission.find(filter);
      return res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  };

export const getSubmissionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    return res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
};
