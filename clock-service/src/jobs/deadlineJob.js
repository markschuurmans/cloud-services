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

export const finalizeCompetition = async (competitionId) => {
  const token = generateSystemToken();
  const headers = { Authorization: `Bearer ${token}` };

  const REGISTER_SERVICE = process.env.REGISTER_SERVICE_URL || 'http://localhost:3002';
  const SCORE_SERVICE = process.env.SCORE_SERVICE_URL || 'http://localhost:3004';
  const MAIL_SERVICE = process.env.MAIL_SERVICE_URL || 'http://localhost:3006';

  try {
    console.log(`[Clock] Starting finalization for competition: ${competitionId}`);

    // Set competition status to finished
    await axios.patch(`${REGISTER_SERVICE}/api/competitions/${competitionId}/status`, 
      { status: 'finished' },
      { headers }
    );
    console.log(`[Clock] Competition ${competitionId} marked as finished.`);

    // Trigger final scoring
    await axios.post(`${SCORE_SERVICE}/api/scores/competition/${competitionId}/finalize`, {}, { headers });
    console.log(`[Clock] Final scoring triggered for ${competitionId}.`);

    // Trigger notifications
    await axios.post(`${MAIL_SERVICE}/api/mail/competition/${competitionId}/notify`, {}, { headers });
    console.log(`[Clock] Mail notifications triggered for ${competitionId}.`);

    // Log success
    await JobLog.create({
      competitionId,
      action: 'deadline_triggered',
      status: 'success',
      details: 'Competition successfully evaluated and finalized.'
    });

    return { status: 'success', competitionId };
  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error(`[Clock] Error finalizing competition ${competitionId}:`, errorMsg);
    
    // Log failure
    try {
      await JobLog.create({
        competitionId,
        action: 'deadline_triggered',
        status: 'failed',
        details: errorMsg
      });
    } catch (dbError) {
      console.error(`[Clock] Failed to write JobLog for ${competitionId}:`, dbError.message);
    }

    throw new Error(`Finalization failed for ${competitionId}`);
  }
};

const startCronJob = () => {
  console.log('[Clock] Cron job initialized. Running every minute.');

  cron.schedule('* * * * *', async () => {
    updateLastRunTime();
    console.log(`[Clock] Running deadline check at ${new Date().toISOString()}`);

    try {
      const REGISTER_SERVICE = process.env.REGISTER_SERVICE_URL || 'http://localhost:3002';
      
      const response = await axios.get(`${REGISTER_SERVICE}/api/competitions`);
      const competitions = response.data;

      const now = new Date();

      const expiredCompetitions = competitions.filter(c => {
        if (c.status === 'finished') return false;
        
        const deadlineDate = new Date(c.deadline);
        return deadlineDate <= now;
      });

      if (expiredCompetitions.length === 0) {
        console.log('[Clock] No expired competitions found.');
        return;
      }

      console.log(`[Clock] Found ${expiredCompetitions.length} expired competitions. Processing...`);

      for (const comp of expiredCompetitions) {
        try {
          await finalizeCompetition(comp.id);
        } catch (e) {
          console.error(`[Clock] Error finalizing competition ${comp.id}:`, e.message);
        }
      }

    } catch (error) {
      console.error('[Clock] Error checking for expired competitions:', error.message);
    }
  });
};

export default startCronJob;
