import { finalizeTarget } from '../jobs/deadlineJob.js';

let lastRunTime = null;

export const updateLastRunTime = () => {
  lastRunTime = new Date();
};

export const getStatus = (req, res) => {
  if (req.user.role !== 'owner') {
     return res.status(403).json({ error: 'Only owners can view the status of the clock service jobs.' });
  }

  res.status(200).json({
    jobsActive: true,
    lastRunTime: lastRunTime
  });
};

export const triggerTarget = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can manually trigger jobs.' });
    }

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
