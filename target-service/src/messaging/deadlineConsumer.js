import amqp from 'amqplib';
import { updateTargetStatusById } from '../controllers/targetController.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const QUEUE_NAME = 'deadline.target.status';

const startDeadlineConsumer = async () => {
  const connect = async () => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      channel.prefetch(1);

      connection.on('close', () => {
        console.warn('[Target-Service] RabbitMQ disconnected. Retrying consumer in 5s.');
        setTimeout(connect, 5000);
      });

      connection.on('error', (error) => {
        console.error('[Target-Service] RabbitMQ error:', error.message);
      });

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const event = JSON.parse(msg.content.toString());
          await updateTargetStatusById(event.targetId, 'finished');
          channel.ack(msg);
        } catch (error) {
          console.error('[Target-Service] Failed to process deadline status event:', error.message);
          channel.nack(msg, false, true);
        }
      });

      console.log('[Target-Service] Deadline status consumer started.');
    } catch (error) {
      console.error('[Target-Service] Unable to start RabbitMQ consumer, retrying in 5s:', error.message);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

export default startDeadlineConsumer;

