import { chunkify, getCpuThreads, pipe } from "./shared/utils.js";

const THREADS = await getCpuThreads();
const TYPICAL_EVENTS = {
  onmessage: ({ data }) => console.log("Received message from worker:", data),
  onmessageerror: (error) => console.error("Error in worker:", error),
  onerror: (error) => console.error("Error in worker:", error),
};

const processJob = (workerPath, data, events) => {
  const _createWorker = ([workerPath, data, events]) => [
    new Worker(workerPath),
    data,
    events,
  ];
  const _postMessage = ([worker, data, events]) => {
    worker.postMessage(data);
    return [worker, data, events];
  };
  const _attachEvents = ([worker, data, events]) => {
    Object.keys(events).forEach((eventName) => {
      worker[eventName] = events[eventName];
    });
    return [worker, data, events];
  };

  const [worker] = pipe(
    _createWorker,
    _postMessage,
    _attachEvents
  )([workerPath, data, events]);

  return worker;
};

const run = ([workerPath, data], THREADS) => {
  const jobChunks = chunkify(workerPath, data, THREADS);

  jobChunks.forEach(([workerPath, data]) =>
    processJob(workerPath, data, TYPICAL_EVENTS)
  );
};

const data = Array(3e3).fill(0).map(Math.random);

console.log(`🚀 Running in ${THREADS} threads`);

setInterval(() => {
  console.log("\x1b[35m%s\x1b[0m", "⏲  Runing jobs in interval.");
  run(["./workers/customWorker.js", data], THREADS);
  console.log("\x1b[35m%s\x1b[0m", "❗ Exit jobs runner.");
}, 1e3);
