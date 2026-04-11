import Registration from '../models/Registration.js';
const TARGET_SERVICE_URL = process.env.TARGET_SERVICE_URL || '';

async function fetchTarget(targetId, authHeader) {
  const response = await fetch(`${TARGET_SERVICE_URL}/api/targets/${targetId}`, {
    headers: authHeader ? { Authorization: authHeader } : {},
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export const registerForTarget = async (req, res, next) => {
  try {
    const { id: targetId } = req.params;
    const participantId = req.user.sub;

    const target = await fetchTarget(targetId, req.headers.authorization);
    if (!target) {
      return res.status(404).json({ error: 'Target not found.' });
    }

    if (!target.registrationOpen || target.status === 'finished') {
      return res.status(400).json({ error: 'Registration is closed for this target.' });
    }

    const newRegistration = new Registration({
      targetId,
      participantId
    });

    const savedRegistration = await newRegistration.save();
    res.status(201).json(savedRegistration);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You are already registered for this target.' });
    }
    next(error);
  }
};

export const getRegistrationsByUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const registrations = await Registration.find({ participantId: userId });
    res.status(200).json(registrations);
  } catch (error) {
    next(error);
  }
};

export const getRegistrationsByTarget = async (req, res, next) => {
  try {
    const { targetId } = req.params;
    const registrations = await Registration.find({ targetId });
    res.status(200).json(registrations);
  } catch (error) {
    next(error);
  }
};

