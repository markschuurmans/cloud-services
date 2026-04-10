import Competition from '../models/Competition.js';
import Registration from '../models/Registration.js';

export const createCompetition = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ error: 'Forbidden. Only owners can create competitions.' });
    }

    const { title, description, deadline } = req.body;

    const newCompetition = new Competition({
      title,
      description,
      deadline,
      ownerId: req.user.id || req.user._id,
      status: 'pending',
      registrationOpen: true
    });

    const savedCompetition = await newCompetition.save();
    res.status(201).json(savedCompetition);
  } catch (error) {
    next(error);
  }
};

export const getCompetitions = async (req, res, next) => {
  try {
    const competitions = await Competition.find();
    res.status(200).json(competitions);
  } catch (error) {
    next(error);
  }
};

export const getCompetitionById = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) {
      return res.status(404).json({ error: 'Competition not found.' });
    }
    res.status(200).json(competition);
  } catch (error) {
    next(error);
  }
};

export const updateCompetitionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'active', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing status.' });
    }

    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!competition) {
      return res.status(404).json({ error: 'Competition not found.' });
    }

    res.status(200).json(competition);
  } catch (error) {
    next(error);
  }
};

export const getActiveCompetitions = async (req, res, next) => {
  try {
    const competitions = await Competition.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'competitionId',
          as: 'registrations'
        }
      },
      {
        $addFields: {
          id: '$_id',
          participantCount: { $size: '$registrations' }
        }
      },
      {
        $project: {
          _id: 0,
          __v: 0,
          registrations: 0
        }
      }
    ]);
    res.status(200).json(competitions);
  } catch (error) {
    next(error);
  }
};
