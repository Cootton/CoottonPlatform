/** Local verification can use threads on hosts that prohibit child processes. */
export default {
  poweredByHeader: false,
  experimental: { workerThreads: process.env.COOTTON_LOCAL_WORKER_THREADS === '1' },
};
