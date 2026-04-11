import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672';

const QUEUES = [
  'deadline.target.status',
  'deadline.score.finalize',
  'deadline.mail.notify',
];

let connection;
let channel;

const ensureChannel = async () => {
  if (channel) {
    return channel;
  }

  connection = await amqp.connect(RABBITMQ_URL);
  connection.on('error', (error) => {
    console.error('[Clock-Service] RabbitMQ connection error:', error.message);
    connection = undefined;
    channel = undefined;
  });

  connection.on('close', () => {
    console.warn('[Clock-Service] RabbitMQ connection closed.');
    connection = undefined;
    channel = undefined;
  });

  channel = await connection.createChannel();
  await Promise.all(QUEUES.map((queue) => channel.assertQueue(queue, { durable: true })));

  return channel;
};

export const publishDeadlineReachedEvent = async (payload) => {
  const activeChannel = await ensureChannel();
  const content = Buffer.from(JSON.stringify(payload));

  for (const queue of QUEUES) {
    activeChannel.sendToQueue(queue, content, { persistent: true });
  }
};

