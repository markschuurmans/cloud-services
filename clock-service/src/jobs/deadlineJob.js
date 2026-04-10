import cron from 'node-cron';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import JobLog from '../models/JobLog.js';
import { updateLastRunTime } from '../controllers/clockController.js';

const generateSystemToken = () => {
  return jwt.sign(
    { id: 'clock-service', role: 'admin' }, 
    process.env.JWT_SECRET, 
    { expiresIn: '5m' }
  );
};

export const finalizeTarget = async (targetId) => {
  const token = generateSystemToken();
  const headers = { Authorization: `Bearer ${token}` };

  const REGISTER_SERVICE = process.env.REGISTER_SERVICE_URL || '';
  const SCORE_SERVICE = process.env.SCORE_SERVICE_URL || '';
  const MAIL_SERVICE = process.env.MAIL_SERVICE_URL || '';

  try {
    console.log(`[Clock] Starting finalization for target: ${targetId}`);

    // Set target status to finished.
    await axios.patch(`${REGISTER_SERVICE}/api/targets/${targetId}/status`,
      { status: 'finished' },
      { headers }
    );
    console.log(`[Clock] Target ${targetId} marked as finished.`);

    // Trigger final scoring
    await axios.post(`${SCORE_SERVICE}/api/scores/target/${targetId}/finalize`, {}, { headers });
    console.log(`[Clock] Final scoring triggered for ${targetId}.`);

    // Trigger notifications
    await axios.post(`${MAIL_SERVICE}/api/mail/target/${targetId}/notify`, {}, { headers });
    console.log(`[Clock] Mail notifications triggered for ${targetId}.`);

    // Log success
    await JobLog.create({
      targetId,
      action: 'deadline_triggered',
      status: 'success',
      details: 'Target successfully evaluated and finalized.'
    });

    return { status: 'success', targetId };
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Clock] Error finalizing target ${targetId}:`, errorMsg);

    // Log failure
    try {
      await JobLog.create({
        targetId,
        action: 'deadline_triggered',
        status: 'failed',
        details: errorMsg
      });
    } catch (dbError) {
      console.error(`[Clock] Failed to write JobLog for ${targetId}:`, dbError.message);
    }

    throw new Error(`Finalization failed for ${targetId}`);
  }
};

const startCronJob = () => {
  console.log('[Clock] Cron job initialized. Running every minute.');

  cron.schedule('* * * * *', async () => {
    updateLastRunTime();
    console.log(`[Clock] Running deadline check at ${new Date().toISOString()}`);

    try {
      const REGISTER_SERVICE = process.env.REGISTER_SERVICE_URL || '';
      
      const response = await axios.get(`${REGISTER_SERVICE}/api/targets`);
      const targets = response.data;

      const now = new Date();

      const expiredTargets = targets.filter((target) => {
        if (target.status === 'finished') return false;
        if (!target.deadline) return false;

        const deadlineDate = new Date(target.deadline);
        return deadlineDate <= now;
      });

      if (expiredTargets.length === 0) {
        console.log('[Clock] No expired targets found.');
        return;
      }

      console.log(`[Clock] Found ${expiredTargets.length} expired targets. Processing...`);

      for (const target of expiredTargets) {
        try {
          await finalizeTarget(target.id || target._id);
        } catch (e) {
          console.error(`[Clock] Error finalizing target ${target.id || target._id}:`, e.message);
        }
      }

    } catch (error) {
      console.error('[Clock] Error checking for expired targets:', error.message);
    }
  });
};

export default startCronJob;
