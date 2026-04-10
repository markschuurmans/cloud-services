import Registration from '../models/Registration.js';

const TARGET_SERVICE_URL = process.env.TARGET_SERVICE_URL || '';

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export const getTargets = async (req, res, next) => {
  try {
    const targets = await fetchJson(`${TARGET_SERVICE_URL}/api/targets`, {
      headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {},
    });

    if (!targets) {
      return res.status(502).json({ error: 'Could not load targets from target-service.' });
    }

    const counts = await Registration.aggregate([
      {
        $group: {
          _id: '$targetId',
          participantCount: { $sum: 1 },
        },
      },
    ]);

    const participantCountMap = new Map(counts.map((entry) => [String(entry._id), entry.participantCount]));

    const enrichedTargets = targets.map((target) => ({
      ...target,
      participantCount: participantCountMap.get(String(target.id || target._id)) || 0,
    }));

    res.status(200).json(enrichedTargets);
  } catch (error) {
    next(error);
  }
};

export const getTargetById = async (req, res, next) => {
  try {
    const target = await fetchJson(`${TARGET_SERVICE_URL}/api/targets/${req.params.id}`, {
      headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {},
    });

    if (!target) {
      return res.status(404).json({ error: 'Target not found.' });
    }

    const participantCount = await Registration.countDocuments({ targetId: req.params.id });
    res.status(200).json({ ...target, participantCount });
  } catch (error) {
    next(error);
  }
};

export const updateTargetStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['pending', 'active', 'finished'].includes(status)) {
      return res.status(400).json({ error: 'Invalid or missing status.' });
    }

    const response = await fetch(`${TARGET_SERVICE_URL}/api/targets/${req.params.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { Authorization: req.headers.authorization } : {}),
      },
      body: JSON.stringify({ status }),
    });

    if (response.status === 404) {
      return res.status(404).json({ error: 'Target not found.' });
    }

    if (!response.ok) {
      return res.status(502).json({ error: 'Could not update target status.' });
    }

    const updatedTarget = await response.json();
    res.status(200).json(updatedTarget);
  } catch (error) {
    next(error);
  }
};

export const getActiveTargets = async (req, res, next) => {
  try {
    const targets = await fetchJson(`${TARGET_SERVICE_URL}/api/targets`, {
      headers: req.headers.authorization ? { Authorization: req.headers.authorization } : {},
    });

    if (!targets) {
      return res.status(502).json({ error: 'Could not load targets from target-service.' });
    }

    const counts = await Registration.aggregate([
      {
        $group: {
          _id: '$targetId',
          participantCount: { $sum: 1 },
        },
      },
    ]);

    const participantCountMap = new Map(counts.map((entry) => [String(entry._id), entry.participantCount]));

    const activeTargets = targets
      .filter((target) => target.status === 'active' && target.registrationOpen !== false)
      .map((target) => ({
        ...target,
        participantCount: participantCountMap.get(String(target.id || target._id)) || 0,
      }));

    res.status(200).json(activeTargets);
  } catch (error) {
    next(error);
  }
};
