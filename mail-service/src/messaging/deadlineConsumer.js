import amqp from 'amqplib';
import { notifyTargetEndById } from '../controllers/mailController.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';
const QUEUE_NAME = 'deadline.mail.notify';

const startDeadlineConsumer = async () => {
  const connect = async () => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      channel.prefetch(1);

      connection.on('close', () => {
        console.warn('[Mail-Service] RabbitMQ disconnected. Retrying consumer in 5s.');
        setTimeout(connect, 5000);
      });

      connection.on('error', (error) => {
        console.error('[Mail-Service] RabbitMQ error:', error.message);
      });

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) {
          return;
        }

        try {
          const event = JSON.parse(msg.content.toString());
          await notifyTargetEndById(event.targetId);
          channel.ack(msg);
        } catch (error) {
          console.error('[Mail-Service] Failed to process deadline notify event:', error.message);
          channel.nack(msg, false, true);
        }
      });

      console.log('[Mail-Service] Deadline notify consumer started.');
    } catch (error) {
      console.error('[Mail-Service] Unable to start RabbitMQ consumer, retrying in 5s:', error.message);
      setTimeout(connect, 5000);
    }
  };

  await connect();
};

export default startDeadlineConsumer;

