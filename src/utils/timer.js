export function createTimer(callback, interval = 1000) {
  let tid = null;
  return {
    start() { if (!tid) tid = setInterval(callback, interval); },
    stop() { if (tid) { clearInterval(tid); tid = null; } },
  };
}
