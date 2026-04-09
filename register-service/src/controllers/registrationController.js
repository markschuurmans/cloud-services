import Registration from '../models/Registration.js';
import Competition from '../models/Competition.js';

export const registerForCompetition = async (req, res, next) => {
  try {
    const { id: competitionId } = req.params;
    const participantId = req.user.id || req.user._id;

    const competition = await Competition.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found.' });
    }

    if (!competition.registrationOpen) {
      return res.status(400).json({ error: 'Registration is closed for this competition.' });
    }

    const newRegistration = new Registration({
      competitionId,
      participantId,
      status: 'registered'
    });

    const savedRegistration = await newRegistration.save();
    res.status(201).json(savedRegistration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You are already registered for this competition.' });
    }
    next(error);
  }
};

export const getRegistrationsForCompetition = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden. Only owners can view registrations.' });
    }

    const { id: competitionId } = req.params;
    
    const registrations = await Registration.find({ competitionId });
    res.status(200).json(registrations);
  } catch (error) {
    next(error);
  }
};
