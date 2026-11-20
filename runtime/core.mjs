export const PRODUCT_ID = 'takane-mio';
export function createCore() {
  let state = 'idle', controller = null;
  return Object.freeze({
    status: () => ({product: PRODUCT_ID, state, runtime: 'not_configured'}),
    begin() {
      if (state !== 'idle') throw new Error('CORE_NOT_IDLE');
      controller = new AbortController();
      state = 'running';
      return controller.signal;
    },
    finish(signal) {
      if (state !== 'running' || signal !== controller?.signal) return false;
      controller = null; state = 'idle'; return true;
    },
    stop() {
      const active = controller;
      controller = null; state = 'stopped'; active?.abort();
    },
    reset() {
      if (state !== 'stopped') throw new Error('CORE_NOT_STOPPED');
      state = 'idle';
    }
  });
}
