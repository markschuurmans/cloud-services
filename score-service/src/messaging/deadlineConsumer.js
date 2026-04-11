import amqp from 'amqplib';
import { finalizeTargetScoringById } from '../controllers/scoreController.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const QUEUE_NAME = 'deadline.score.finalize';

const startDeadlineConsumer = async () => {
  const connect = async () => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      channel.prefetch(1);

      connection.on('close', () => {
        console.warn('[Score-Service] RabbitMQ disconnected. Retrying consumer in 5s.');
        setTimeout(connect, 5000);
      });

      connection.on('error', (error) => {
        console.error('[Score-Service] RabbitMQ error:', error.message);
      });

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const event = JSON.parse(msg.content.toString());
          await finalizeTargetScoringById(event.targetId);
          channel.ack(msg);
        } catch (error) {
          console.error('[Score-Service] Failed to process deadline scoring event:', error.message);
          channel.nack(msg, false, true);
        }
      });

      console.log('[Score-Service] Deadline scoring consumer started.');
    } catch (error) {
      console.error('[Score-Service] Unable to start RabbitMQ consumer, retrying in 5s:', error.message);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

export default startDeadlineConsumer;

