/**
 * pd4web-runtime.ts
 *
 * Utility to defensively initialise the internal data-structures that the
 * Pd4Web Emscripten runtime expects to find on its instance object.
 *
 * --- Why this is needed ---
 * The pd4web.js loader script registers global DOM event listeners
 * (mousemove, mouseup, touchend, etc.) that fire at any time — even after the
 * Pd4Web instance has been torn down by a React unmount. Those handlers read
 * properties like Pd4Web.Touches and Pd4Web.GuiReceivers directly on the
 * global window.Pd4Web reference. If those buckets are undefined the handlers
 * throw uncaught TypeErrors that pollute the console.
 *
 * primePd4WebRuntime() ensures every expected bucket is at least an empty
 * object before the instance is used or placed on window.Pd4Web.
 * Pd4WebMapAudio also uses it to build a lightweight stub object that replaces
 * window.Pd4Web on teardown, so orphaned listeners stay silent.
 */

type Pd4WebRuntimeBuckets = {
  GuiReceivers?: Record<string, unknown>;
  Touches?: Record<string | number, unknown>;
  _userBangFunc?: Record<string, unknown>;
  _userFloatFunc?: Record<string, unknown>;
  _userListFunc?: Record<string, unknown>;
  _userSymbolFunc?: Record<string, unknown>;
};

/**
 * Pre-populates any missing internal lookup tables on a freshly constructed
 * Pd4Web instance (or a plain stub object) using the nullish-coalescing
 * assignment operator so existing values are never overwritten.
 *
 * Returns the same runtime reference for convenient chaining:
 *   pdRef.current = primePd4WebRuntime(new pd4WebModule.Pd4Web());
 */
export function primePd4WebRuntime<T extends object>(runtime: T): T {
  const pd4web = runtime as T & Pd4WebRuntimeBuckets;

  pd4web.GuiReceivers ??= {}; // GUI receiver callbacks registered by pd4web.gui.js
  pd4web.Touches ??= {}; // Active pointer/touch state tracked by the GUI layer
  pd4web._userBangFunc ??= {}; // User-registered bang callbacks (pd.registerCallback)
  pd4web._userFloatFunc ??= {}; // User-registered float callbacks
  pd4web._userListFunc ??= {}; // User-registered list callbacks
  pd4web._userSymbolFunc ??= {}; // User-registered symbol callbacks

  return runtime;
}
