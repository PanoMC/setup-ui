// `export { default } from` (not `import` + `export default Default`) because this
// shim sits inside an import cycle: here → @panomc/sdk/core/js/api.util → $lib/Store.js
// → back here. `export default <identifier>` is an expression evaluated once while this
// module's body runs, not a live binding, so under a different entry order it would
// snapshot an uninitialized binding and publish `undefined` forever. A re-export is an
// indirect binding resolved at link time and read on access, so it survives the cycle.
export * from "@panomc/sdk/core/js/api.util";
export { default } from "@panomc/sdk/core/js/api.util";
