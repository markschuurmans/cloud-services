import cron from 'node-cron';
import axios from 'axios';
import JobLog from '../models/JobLog.js';
import { updateLastRunTime } from '../controllers/clockController.js';
import { publishDeadlineReachedEvent } from '../messaging/rabbit.js';

export const finalizeTarget = async (targetId) => {
  try {
    console.log(`[Clock] Publishing deadline event for target: ${targetId}`);
    await publishDeadlineReachedEvent({
      eventType: 'target.deadline.reached',
      targetId,
      occurredAt: new Date().toISOString(),
    });
    console.log(`[Clock] Deadline event published for ${targetId}.`);

    await JobLog.create({
      targetId,
      action: 'deadline_triggered',
      status: 'success',
      details: 'Deadline event queued for asynchronous processing.'
    });

    return { status: 'success', targetId };
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Clock] Error finalizing target ${targetId}:`, errorMsg);

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
      const TARGET_SERVICE = process.env.TARGET_SERVICE_URL || '';
      const response = await axios.get(`${TARGET_SERVICE}/api/targets`);
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
