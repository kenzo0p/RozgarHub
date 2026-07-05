/**
 * Node.js v25+ CJS Preload — runs BEFORE any other module loads.
 *
 * Polyfills SlowBuffer which was removed in Node 25.
 * Used via: node --require ./src/preload.cjs or tsx --require ./src/preload.cjs
 */

'use strict';

const bufferModule = require('buffer');

if (!bufferModule.SlowBuffer) {
  // Create a minimal SlowBuffer polyfill
  const SlowBuffer = function SlowBuffer(size) {
    return Buffer.allocUnsafe(size);
  };

  // Inherit from Buffer
  Object.setPrototypeOf(SlowBuffer.prototype, Buffer.prototype);
  Object.setPrototypeOf(SlowBuffer, Buffer);

  // Add the .equal method that buffer-equal-constant-time expects
  SlowBuffer.prototype.equal = function equal(that) {
    return this.equals(that);
  };

  bufferModule.SlowBuffer = SlowBuffer;
} else if (!bufferModule.SlowBuffer.prototype.equal) {
  bufferModule.SlowBuffer.prototype.equal = function equal(that) {
    return this.equals(that);
  };
}
