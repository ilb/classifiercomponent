import PQueue from '@ilb/p-queue';
import PriorityQueueEx from './PriorityQueueEx.mjs';

const queue = new PQueue({
  concurrency: parseInt(process.env.PQUEUE_CONCURRENCY) || 5,
  queueClass: PriorityQueueEx
});

export default queue;
