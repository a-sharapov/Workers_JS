import { $ } from "bun";

const DEFAULT_THREADS = 1;

export const getCpuThreads = async () =>
  Number((await $`nproc`.text()) || DEFAULT_THREADS);
