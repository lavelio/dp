/* global Office */

// Office loads commands.html as the FunctionFile declared in the manifest.
// No ExecuteFunction actions are wired up right now, so this file just keeps
// the FunctionFile contract satisfied with an Office.onReady handshake.
Office.onReady(() => {
  // Intentionally empty.
});
