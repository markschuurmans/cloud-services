import { finalizeTarget } from '../jobs/deadlineJob.js';

let lastRunTime = null;

export const updateLastRunTime = () => {
  lastRunTime = new Date();
};

export const getStatus = (req, res) => {
  res.status(200).json({
    jobsActive: true,
    lastRunTime: lastRunTime
  });
};

export const triggerTarget = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await finalizeTarget(id);

    res.status(200).json({
      message: 'Workflow triggered.',
      result
    });
  } catch (error) {
    next(error);
  }
};
