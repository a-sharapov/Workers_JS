export const pipe =
  (...fns) =>
  (payload) =>
    fns.reduce(
      (arg, fn) => (arg instanceof Promise ? arg.then(fn) : fn(arg)),
      payload
    );

export const getCpuThreads = () => Number(navigator.hardwareConcurrency) || 1;

export const chunkify = (workerPath, data, threads) =>
  Array(threads)
    .fill([workerPath, null])
    .map((_, i) => [workerPath, data.slice(0, Math.ceil(data.length / i)), i]);

const THREADS = getCpuThreads();
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

const data = Array(3000).fill(0).map(Math.random);

const buttonStart = document.getElementById("start");

buttonStart.addEventListener("click", () => {
  run(["./workers/customWorker.js", data], THREADS);
});
