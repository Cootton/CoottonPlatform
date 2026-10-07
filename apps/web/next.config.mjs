/** Local verification can use threads on hosts that prohibit child processes. */
export default {
  poweredByHeader: false,
  async headers() {
    return [{ source: '/admin/:path*', headers: [{key:'Cache-Control',value:'private, no-store'},{key:'X-Robots-Tag',value:'noindex, nofollow'}] }];
  },
  experimental: { workerThreads: process.env.COOTTON_LOCAL_WORKER_THREADS === '1' },
};
