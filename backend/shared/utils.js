import { $ } from "bun";

export const pipe =
  (...fns) =>
  (payload) =>
    fns.reduce(
      (arg, fn) => (arg instanceof Promise ? arg.then(fn) : fn(arg)),
      payload
    );

export const chunkify = (workerPath, data, threads) =>
  Array(threads)
    .fill([workerPath, null])
    .map((_, i) => [workerPath, data.slice(0, Math.ceil(data.length / i)), i]);

export const getCpuThreads = async () => Number((await $`nproc`.text()) || 1);

export const getPerfomanceStamp = () => performance.now().toFixed(3);
