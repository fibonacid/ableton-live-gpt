"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports2, module2) {
    "use strict";
    module2.exports = {
      BINARY_TYPES: ["nodebuffer", "arraybuffer", "fragments"],
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports2, module2) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0)
        return EMPTY_BUFFER;
      if (list.length === 1)
        return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data))
        return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module2.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require("bufferutil");
        module2.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48)
            _mask(source, mask, output, offset, length);
          else
            bufferUtil.mask(source, mask, output, offset, length);
        };
        module2.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32)
            _unmask(buffer, mask);
          else
            bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports2, module2) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency)
          return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module2.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports2, module2) {
    "use strict";
    var zlib = require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       * @param {Boolean} [isServer=false] Create the instance in either server or
       *     client mode
       * @param {Number} [maxPayload=0] The maximum allowed message length
       */
      constructor(options, isServer, maxPayload) {
        this._maxPayload = maxPayload | 0;
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._isServer = !!isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin)
          this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module2.exports = PerMessageDeflate;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports2, module2) {
    "use strict";
    var { isUtf8 } = require("buffer");
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    module2.exports = {
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module2.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require("utf-8-validate");
        module2.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports2, module2) {
    "use strict";
    var { Writable } = require("stream");
    var PerMessageDeflate = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var promise = Promise.resolve();
    var queueTask = typeof queueMicrotask === "function" ? queueMicrotask : queueMicrotaskShim;
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = !!options.allowSynchronousEvents;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO)
          return cb();
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length)
          return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored)
          cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented)
          this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126)
          this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127)
          this._state = GET_PAYLOAD_LENGTH_64;
        else
          this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked)
          this._state = GET_MASK;
        else
          this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err)
            return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO)
            this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else {
            data = fragments;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            queueTask(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            queueTask(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          queueTask(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module2.exports = Receiver;
    function queueMicrotaskShim(cb) {
      promise.then(cb).catch(throwErrorNextTick);
    }
    function throwError(err) {
      throw err;
    }
    function throwErrorNextTick(err) {
      process.nextTick(throwError, err);
    }
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    var { randomFillSync } = require("crypto");
    var PerMessageDeflate = require_permessage_deflate();
    var { EMPTY_BUFFER } = require_constants();
    var { isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var Sender = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._deflating = false;
        this._queue = [];
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            randomFillSync(mask, 0, 4);
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1)
          target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask)
          return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking)
          return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else {
            buf.set(data, 2);
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (this._deflating) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin)
          this._firstFragment = true;
        if (perMessageDeflate) {
          const opts = {
            [kByteLength]: byteLength,
            fin: options.fin,
            generateMask: this._generateMask,
            mask: options.mask,
            maskBuffer: this._maskBuffer,
            opcode,
            readOnly,
            rsv1
          };
          if (this._deflating) {
            this.enqueue([this.dispatch, data, this._compress, opts, cb]);
          } else {
            this.dispatch(data, this._compress, opts, cb);
          }
        } else {
          this.sendFrame(
            _Sender.frame(data, {
              [kByteLength]: byteLength,
              fin: options.fin,
              generateMask: this._generateMask,
              mask: options.mask,
              maskBuffer: this._maskBuffer,
              opcode,
              readOnly,
              rsv1: false
            }),
            cb
          );
        }
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._deflating = true;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            if (typeof cb === "function")
              cb(err);
            for (let i = 0; i < this._queue.length; i++) {
              const params = this._queue[i];
              const callback = params[params.length - 1];
              if (typeof callback === "function")
                callback(err);
            }
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._deflating = false;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (!this._deflating && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {Buffer[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module2.exports = Sender;
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports2, module2) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module2.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0)
        dest[name] = [elem];
      else
        dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1)
              start = i;
            else if (!mustUnescape)
              mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1)
                start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1)
              start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1)
              end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1)
              end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1)
        end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension) => {
        let configurations = extensions[extension];
        if (!Array.isArray(configurations))
          configurations = [configurations];
        return configurations.map((params) => {
          return [extension].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values))
                values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module2.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var https = require("https");
    var http = require("http");
    var net = require("net");
    var tls = require("tls");
    var { randomBytes, createHash } = require("crypto");
    var { Duplex, Readable } = require("stream");
    var { URL } = require("url");
    var PerMessageDeflate = require_permessage_deflate();
    var Receiver = require_receiver();
    var Sender = require_sender();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var closeTimeout = 30 * 1e3;
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._isServer = true;
        }
      }
      /**
       * This deviates from the WHATWG interface since ws doesn't support the
       * required default "blob" type (instead we define a custom "nodebuffer"
       * type).
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type))
          return;
        this._binaryType = type;
        if (this._receiver)
          this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket)
          return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        this._sender = new Sender(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._socket = socket;
        receiver[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        if (socket.setTimeout)
          socket.setTimeout(0);
        if (socket.setNoDelay)
          socket.setNoDelay();
        if (head.length > 0)
          socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate.extensionName]) {
          this._extensions[PerMessageDeflate.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err)
            return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        this._closeTimer = setTimeout(
          this._socket.destroy.bind(this._socket),
          closeTimeout
        );
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0)
          mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain)
          this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number")
          data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED)
          return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute])
              return listener[kListener];
          }
          return null;
        },
        set(handler) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler !== "function")
            return;
          this.addEventListener(method, handler, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket.prototype.addEventListener = addEventListener;
    WebSocket.prototype.removeEventListener = removeEventListener;
    module2.exports = WebSocket;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: false,
        autoPong: true,
        protocolVersion: protocolVersions[1],
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        createConnection: void 0,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL(address);
        } catch (e) {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = isSecure ? tlsConnect : netConnect;
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate(
          opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
          false,
          opts.maxPayload
        );
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost)
              delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted])
          return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket.CONNECTING)
          return;
        req = websocket._req = null;
        if (res.headers.upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt)
          websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket.CLOSING;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = toBuffer(data).length;
        if (websocket._socket)
          websocket._sender._bufferedBytes += length;
        else
          websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0)
        return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005)
        websocket.close();
      else
        websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused)
        websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      websocket.emit("error", err);
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong)
        websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket.CLOSING;
      let chunk;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && (chunk = websocket._socket.read()) !== null) {
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports2, module2) {
    "use strict";
    var { Duplex } = require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data))
          ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed)
          return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed)
          return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called)
            callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy)
          ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null)
          return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted)
            duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused)
          ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module2.exports = createWebSocketStream;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports2, module2) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1)
            start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1)
            end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1)
            end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module2.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports2, module2) {
    "use strict";
    var EventEmitter = require("events");
    var http = require("http");
    var { Duplex } = require("stream");
    var { createHash } = require("crypto");
    var extension = require_extension();
    var PerMessageDeflate = require_permessage_deflate();
    var subprotocol = require_subprotocol();
    var WebSocket = require_websocket();
    var { GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: false,
          autoPong: true,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true)
          options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server)
          return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb)
          this.once("close", cb);
        if (this._state === CLOSING)
          return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path)
            return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (req.headers.upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!key || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 8 && version !== 13) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate(
            this.options.perMessageDeflate,
            true,
            this.options.maxPayload
          );
          try {
            const offers = extension.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
              extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info))
            return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable)
          return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING)
          return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate.extensionName]) {
          const params = extensions[PerMessageDeflate.extensionName].params;
          const value = extension.format({
            [PerMessageDeflate.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module2.exports = WebSocketServer;
    function addListeners(server, map) {
      for (const event of Object.keys(map))
        server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message);
      }
    }
  }
});

// node_modules/ws/index.js
var require_ws = __commonJS({
  "node_modules/ws/index.js"(exports2, module2) {
    "use strict";
    var WebSocket = require_websocket();
    WebSocket.createWebSocketStream = require_stream();
    WebSocket.Server = require_websocket_server();
    WebSocket.Receiver = require_receiver();
    WebSocket.Sender = require_sender();
    WebSocket.WebSocket = WebSocket;
    WebSocket.WebSocketServer = WebSocket.Server;
    module2.exports = WebSocket;
  }
});

// node_modules/osc-js/lib/osc.js
var require_osc = __commonJS({
  "node_modules/osc-js/lib/osc.js"(exports2, module2) {
    (function(global2, factory) {
      typeof exports2 === "object" && typeof module2 !== "undefined" ? module2.exports = factory(require("dgram"), require_ws()) : typeof define === "function" && define.amd ? define(["dgram", "ws"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.OSC = factory(global2.dgram, global2.ws));
    })(exports2, function(dgram, WebSocket) {
      "use strict";
      function _interopDefaultLegacy(e) {
        return e && typeof e === "object" && "default" in e ? e : { "default": e };
      }
      var dgram__default = /* @__PURE__ */ _interopDefaultLegacy(dgram);
      var WebSocket__default = /* @__PURE__ */ _interopDefaultLegacy(WebSocket);
      function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);
        if (Object.getOwnPropertySymbols) {
          var symbols = Object.getOwnPropertySymbols(object);
          enumerableOnly && (symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
          })), keys.push.apply(keys, symbols);
        }
        return keys;
      }
      function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = null != arguments[i] ? arguments[i] : {};
          i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
            _defineProperty(target, key, source[key]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
          });
        }
        return target;
      }
      function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
          throw new TypeError("Cannot call a class as a function");
        }
      }
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor)
            descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }
      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps)
          _defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
          _defineProperties(Constructor, staticProps);
        Object.defineProperty(Constructor, "prototype", {
          writable: false
        });
        return Constructor;
      }
      function _defineProperty(obj, key, value) {
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
          throw new TypeError("Super expression must either be null or a function");
        }
        subClass.prototype = Object.create(superClass && superClass.prototype, {
          constructor: {
            value: subClass,
            writable: true,
            configurable: true
          }
        });
        Object.defineProperty(subClass, "prototype", {
          writable: false
        });
        if (superClass)
          _setPrototypeOf(subClass, superClass);
      }
      function _getPrototypeOf(o) {
        _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf2(o2) {
          return o2.__proto__ || Object.getPrototypeOf(o2);
        };
        return _getPrototypeOf(o);
      }
      function _setPrototypeOf(o, p) {
        _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o2, p2) {
          o2.__proto__ = p2;
          return o2;
        };
        return _setPrototypeOf(o, p);
      }
      function _isNativeReflectConstruct() {
        if (typeof Reflect === "undefined" || !Reflect.construct)
          return false;
        if (Reflect.construct.sham)
          return false;
        if (typeof Proxy === "function")
          return true;
        try {
          Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {
          }));
          return true;
        } catch (e) {
          return false;
        }
      }
      function _assertThisInitialized(self2) {
        if (self2 === void 0) {
          throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }
        return self2;
      }
      function _possibleConstructorReturn(self2, call) {
        if (call && (typeof call === "object" || typeof call === "function")) {
          return call;
        } else if (call !== void 0) {
          throw new TypeError("Derived constructors may only return object or undefined");
        }
        return _assertThisInitialized(self2);
      }
      function _createSuper(Derived) {
        var hasNativeReflectConstruct = _isNativeReflectConstruct();
        return function _createSuperInternal() {
          var Super = _getPrototypeOf(Derived), result;
          if (hasNativeReflectConstruct) {
            var NewTarget = _getPrototypeOf(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
          } else {
            result = Super.apply(this, arguments);
          }
          return _possibleConstructorReturn(this, result);
        };
      }
      function _superPropBase(object, property) {
        while (!Object.prototype.hasOwnProperty.call(object, property)) {
          object = _getPrototypeOf(object);
          if (object === null)
            break;
        }
        return object;
      }
      function _get() {
        if (typeof Reflect !== "undefined" && Reflect.get) {
          _get = Reflect.get.bind();
        } else {
          _get = function _get2(target, property, receiver) {
            var base = _superPropBase(target, property);
            if (!base)
              return;
            var desc = Object.getOwnPropertyDescriptor(base, property);
            if (desc.get) {
              return desc.get.call(arguments.length < 3 ? target : receiver);
            }
            return desc.value;
          };
        }
        return _get.apply(this, arguments);
      }
      function isInt(n) {
        return Number(n) === n && n % 1 === 0;
      }
      function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
      }
      function isNumber(n) {
        return Number(n) === n;
      }
      function isString(n) {
        return typeof n === "string";
      }
      function isBoolean(n) {
        return typeof n === "boolean";
      }
      function isInfinity(n) {
        return n === Infinity;
      }
      function isArray(n) {
        return Object.prototype.toString.call(n) === "[object Array]";
      }
      function isObject(n) {
        return Object.prototype.toString.call(n) === "[object Object]";
      }
      function isFunction(n) {
        return typeof n === "function";
      }
      function isBlob(n) {
        return n instanceof Uint8Array;
      }
      function isDate(n) {
        return n instanceof Date;
      }
      function isUndefined(n) {
        return typeof n === "undefined";
      }
      function isNull(n) {
        return n === null;
      }
      function pad(n) {
        return n + 3 & ~3;
      }
      function hasProperty(name) {
        return Object.prototype.hasOwnProperty.call(
          typeof global !== "undefined" ? global : window,
          name
        );
      }
      function dataView(obj) {
        if (obj.buffer) {
          return new DataView(obj.buffer);
        } else if (obj instanceof ArrayBuffer) {
          return new DataView(obj);
        }
        return new DataView(new Uint8Array(obj));
      }
      function typeTag(item) {
        if (isInt(item)) {
          return "i";
        } else if (isFloat(item)) {
          return "f";
        } else if (isString(item)) {
          return "s";
        } else if (isBlob(item)) {
          return "b";
        } else if (isBoolean(item)) {
          return item ? "T" : "F";
        } else if (isNull(item)) {
          return "N";
        } else if (isInfinity(item)) {
          return "I";
        }
        throw new Error("OSC typeTag() found unknown value type");
      }
      function prepareAddress(obj) {
        var address = "";
        if (isArray(obj)) {
          return "/".concat(obj.join("/"));
        } else if (isString(obj)) {
          address = obj;
          if (address.length > 1 && address[address.length - 1] === "/") {
            address = address.slice(0, address.length - 1);
          }
          if (address.length > 1 && address[0] !== "/") {
            address = "/".concat(address);
          }
          return address;
        }
        throw new Error("OSC prepareAddress() needs addresses of type array or string");
      }
      function prepareRegExPattern(str) {
        var pattern;
        if (!isString(str)) {
          throw new Error("OSC prepareRegExPattern() needs strings");
        }
        pattern = str.replace(/\./g, "\\.");
        pattern = pattern.replace(/\(/g, "\\(");
        pattern = pattern.replace(/\)/g, "\\)");
        pattern = pattern.replace(/\{/g, "(");
        pattern = pattern.replace(/\}/g, ")");
        pattern = pattern.replace(/,/g, "|");
        pattern = pattern.replace(/\[!/g, "[^");
        pattern = pattern.replace(/\?/g, ".");
        pattern = pattern.replace(/\*/g, ".*");
        return pattern;
      }
      var EncodeHelper = function() {
        function EncodeHelper2() {
          _classCallCheck(this, EncodeHelper2);
          this.data = [];
          this.byteLength = 0;
        }
        _createClass(EncodeHelper2, [{
          key: "add",
          value: function add(item) {
            if (isBoolean(item) || isInfinity(item) || isNull(item)) {
              return this;
            }
            var buffer = item.pack();
            this.byteLength += buffer.byteLength;
            this.data.push(buffer);
            return this;
          }
        }, {
          key: "merge",
          value: function merge() {
            var result = new Uint8Array(this.byteLength);
            var offset = 0;
            this.data.forEach(function(data) {
              result.set(data, offset);
              offset += data.byteLength;
            });
            return result;
          }
        }]);
        return EncodeHelper2;
      }();
      var Atomic = function() {
        function Atomic2(value) {
          _classCallCheck(this, Atomic2);
          this.value = value;
          this.offset = 0;
        }
        _createClass(Atomic2, [{
          key: "pack",
          value: function pack(method, byteLength) {
            if (!(method && byteLength)) {
              throw new Error("OSC Atomic cant't be packed without given method or byteLength");
            }
            var data = new Uint8Array(byteLength);
            var dataView2 = new DataView(data.buffer);
            if (isUndefined(this.value)) {
              throw new Error("OSC Atomic cant't be encoded with empty value");
            }
            dataView2[method](this.offset, this.value, false);
            return data;
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2, method, byteLength) {
            var initialOffset = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
            if (!(dataView2 && method && byteLength)) {
              throw new Error("OSC Atomic cant't be unpacked without given dataView, method or byteLength");
            }
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC Atomic expects an instance of type DataView");
            }
            this.value = dataView2[method](initialOffset, false);
            this.offset = initialOffset + byteLength;
            return this.offset;
          }
        }]);
        return Atomic2;
      }();
      var AtomicInt32 = function(_Atomic) {
        _inherits(AtomicInt322, _Atomic);
        var _super = _createSuper(AtomicInt322);
        function AtomicInt322(value) {
          _classCallCheck(this, AtomicInt322);
          if (value && !isInt(value)) {
            throw new Error("OSC AtomicInt32 constructor expects value of type number");
          }
          return _super.call(this, value);
        }
        _createClass(AtomicInt322, [{
          key: "pack",
          value: function pack() {
            return _get(_getPrototypeOf(AtomicInt322.prototype), "pack", this).call(this, "setInt32", 4);
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return _get(_getPrototypeOf(AtomicInt322.prototype), "unpack", this).call(this, dataView2, "getInt32", 4, initialOffset);
          }
        }]);
        return AtomicInt322;
      }(Atomic);
      var STR_SLICE_SIZE = 65537;
      var STR_ENCODING = "utf-8";
      function charCodesToString(charCodes) {
        if (hasProperty("Buffer")) {
          return Buffer.from(charCodes).toString(STR_ENCODING);
        } else if (hasProperty("TextDecoder")) {
          return new TextDecoder(STR_ENCODING).decode(new Int8Array(charCodes));
        }
        var str = "";
        for (var i = 0; i < charCodes.length; i += STR_SLICE_SIZE) {
          str += String.fromCharCode.apply(null, charCodes.slice(i, i + STR_SLICE_SIZE));
        }
        return str;
      }
      var AtomicString = function(_Atomic) {
        _inherits(AtomicString2, _Atomic);
        var _super = _createSuper(AtomicString2);
        function AtomicString2(value) {
          _classCallCheck(this, AtomicString2);
          if (value && !isString(value)) {
            throw new Error("OSC AtomicString constructor expects value of type string");
          }
          return _super.call(this, value);
        }
        _createClass(AtomicString2, [{
          key: "pack",
          value: function pack() {
            if (isUndefined(this.value)) {
              throw new Error("OSC AtomicString can not be encoded with empty value");
            }
            var terminated = "".concat(this.value, "\0");
            var byteLength = pad(terminated.length);
            var buffer = new Uint8Array(byteLength);
            for (var i = 0; i < terminated.length; i += 1) {
              buffer[i] = terminated.charCodeAt(i);
            }
            return buffer;
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC AtomicString expects an instance of type DataView");
            }
            var offset = initialOffset;
            var charcode;
            var charCodes = [];
            for (; offset < dataView2.byteLength; offset += 1) {
              charcode = dataView2.getUint8(offset);
              if (charcode !== 0) {
                charCodes.push(charcode);
              } else {
                offset += 1;
                break;
              }
            }
            if (offset === dataView2.length) {
              throw new Error("OSC AtomicString found a malformed OSC string");
            }
            this.offset = pad(offset);
            this.value = charCodesToString(charCodes);
            return this.offset;
          }
        }]);
        return AtomicString2;
      }(Atomic);
      var SECONDS_70_YEARS = 2208988800;
      var TWO_POWER_32 = 4294967296;
      var Timetag = function() {
        function Timetag2() {
          var seconds = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
          var fractions = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
          _classCallCheck(this, Timetag2);
          if (!(isInt(seconds) && isInt(fractions))) {
            throw new Error("OSC Timetag constructor expects values of type integer number");
          }
          this.seconds = seconds;
          this.fractions = fractions;
        }
        _createClass(Timetag2, [{
          key: "timestamp",
          value: function timestamp(milliseconds) {
            var seconds;
            if (typeof milliseconds === "number") {
              seconds = milliseconds / 1e3;
              var rounded = Math.floor(seconds);
              this.seconds = rounded + SECONDS_70_YEARS;
              this.fractions = Math.round(TWO_POWER_32 * (seconds - rounded));
              return milliseconds;
            }
            seconds = this.seconds - SECONDS_70_YEARS;
            return (seconds + Math.round(this.fractions / TWO_POWER_32)) * 1e3;
          }
        }]);
        return Timetag2;
      }();
      var AtomicTimetag = function(_Atomic) {
        _inherits(AtomicTimetag2, _Atomic);
        var _super = _createSuper(AtomicTimetag2);
        function AtomicTimetag2() {
          var value = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Date.now();
          _classCallCheck(this, AtomicTimetag2);
          var timetag = new Timetag();
          if (value instanceof Timetag) {
            timetag = value;
          } else if (isInt(value)) {
            timetag.timestamp(value);
          } else if (isDate(value)) {
            timetag.timestamp(value.getTime());
          }
          return _super.call(this, timetag);
        }
        _createClass(AtomicTimetag2, [{
          key: "pack",
          value: function pack() {
            if (isUndefined(this.value)) {
              throw new Error("OSC AtomicTimetag can not be encoded with empty value");
            }
            var _this$value = this.value, seconds = _this$value.seconds, fractions = _this$value.fractions;
            var data = new Uint8Array(8);
            var dataView2 = new DataView(data.buffer);
            dataView2.setInt32(0, seconds, false);
            dataView2.setInt32(4, fractions, false);
            return data;
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC AtomicTimetag expects an instance of type DataView");
            }
            var seconds = dataView2.getUint32(initialOffset, false);
            var fractions = dataView2.getUint32(initialOffset + 4, false);
            this.value = new Timetag(seconds, fractions);
            this.offset = initialOffset + 8;
            return this.offset;
          }
        }]);
        return AtomicTimetag2;
      }(Atomic);
      var AtomicBlob = function(_Atomic) {
        _inherits(AtomicBlob2, _Atomic);
        var _super = _createSuper(AtomicBlob2);
        function AtomicBlob2(value) {
          _classCallCheck(this, AtomicBlob2);
          if (value && !isBlob(value)) {
            throw new Error("OSC AtomicBlob constructor expects value of type Uint8Array");
          }
          return _super.call(this, value);
        }
        _createClass(AtomicBlob2, [{
          key: "pack",
          value: function pack() {
            if (isUndefined(this.value)) {
              throw new Error("OSC AtomicBlob can not be encoded with empty value");
            }
            var byteLength = pad(this.value.byteLength);
            var data = new Uint8Array(byteLength + 4);
            var dataView2 = new DataView(data.buffer);
            dataView2.setInt32(0, this.value.byteLength, false);
            data.set(this.value, 4);
            return data;
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC AtomicBlob expects an instance of type DataView");
            }
            var byteLength = dataView2.getInt32(initialOffset, false);
            this.value = new Uint8Array(dataView2.buffer, initialOffset + 4, byteLength);
            this.offset = pad(initialOffset + 4 + byteLength);
            return this.offset;
          }
        }]);
        return AtomicBlob2;
      }(Atomic);
      var AtomicFloat32 = function(_Atomic) {
        _inherits(AtomicFloat322, _Atomic);
        var _super = _createSuper(AtomicFloat322);
        function AtomicFloat322(value) {
          _classCallCheck(this, AtomicFloat322);
          if (value && !isNumber(value)) {
            throw new Error("OSC AtomicFloat32 constructor expects value of type float");
          }
          return _super.call(this, value);
        }
        _createClass(AtomicFloat322, [{
          key: "pack",
          value: function pack() {
            return _get(_getPrototypeOf(AtomicFloat322.prototype), "pack", this).call(this, "setFloat32", 4);
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return _get(_getPrototypeOf(AtomicFloat322.prototype), "unpack", this).call(this, dataView2, "getFloat32", 4, initialOffset);
          }
        }]);
        return AtomicFloat322;
      }(Atomic);
      var AtomicFloat64 = function(_Atomic) {
        _inherits(AtomicFloat642, _Atomic);
        var _super = _createSuper(AtomicFloat642);
        function AtomicFloat642(value) {
          _classCallCheck(this, AtomicFloat642);
          if (value && !isNumber(value)) {
            throw new Error("OSC AtomicFloat64 constructor expects value of type float");
          }
          return _super.call(this, value);
        }
        _createClass(AtomicFloat642, [{
          key: "pack",
          value: function pack() {
            return _get(_getPrototypeOf(AtomicFloat642.prototype), "pack", this).call(this, "setFloat64", 8);
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return _get(_getPrototypeOf(AtomicFloat642.prototype), "unpack", this).call(this, dataView2, "getFloat64", 8, initialOffset);
          }
        }]);
        return AtomicFloat642;
      }(Atomic);
      var MAX_INT64 = BigInt("9223372036854775807");
      var MIN_INT64 = BigInt("-9223372036854775808");
      var AtomicInt64 = function(_Atomic) {
        _inherits(AtomicInt642, _Atomic);
        var _super = _createSuper(AtomicInt642);
        function AtomicInt642(value) {
          _classCallCheck(this, AtomicInt642);
          if (value && typeof value !== "bigint") {
            throw new Error("OSC AtomicInt64 constructor expects value of type BigInt");
          }
          if (value && (value < MIN_INT64 || value > MAX_INT64)) {
            throw new Error("OSC AtomicInt64 value is out of bounds");
          }
          var tmp;
          if (value) {
            tmp = BigInt.asIntN(64, value);
          }
          return _super.call(this, tmp);
        }
        _createClass(AtomicInt642, [{
          key: "pack",
          value: function pack() {
            return _get(_getPrototypeOf(AtomicInt642.prototype), "pack", this).call(this, "setBigInt64", 8);
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return _get(_getPrototypeOf(AtomicInt642.prototype), "unpack", this).call(this, dataView2, "getBigInt64", 8, initialOffset);
          }
        }]);
        return AtomicInt642;
      }(Atomic);
      var MAX_UINT64 = BigInt("18446744073709551615");
      var AtomicUInt64 = function(_Atomic) {
        _inherits(AtomicUInt642, _Atomic);
        var _super = _createSuper(AtomicUInt642);
        function AtomicUInt642(value) {
          _classCallCheck(this, AtomicUInt642);
          if (value && typeof value !== "bigint") {
            throw new Error("OSC AtomicUInt64 constructor expects value of type BigInt");
          }
          if (value && (value < 0 || value > MAX_UINT64)) {
            throw new Error("OSC AtomicUInt64 value is out of bounds");
          }
          var tmp;
          if (value) {
            tmp = BigInt.asUintN(64, value);
          }
          return _super.call(this, tmp);
        }
        _createClass(AtomicUInt642, [{
          key: "pack",
          value: function pack() {
            return _get(_getPrototypeOf(AtomicUInt642.prototype), "pack", this).call(this, "setBigUint64", 8);
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            return _get(_getPrototypeOf(AtomicUInt642.prototype), "unpack", this).call(this, dataView2, "getBigUint64", 8, initialOffset);
          }
        }]);
        return AtomicUInt642;
      }(Atomic);
      var VALUE_TRUE = true;
      var VALUE_FALSE = false;
      var VALUE_NONE = null;
      var VALUE_INFINITY = Infinity;
      var TypedMessage = function() {
        function TypedMessage2(address, args) {
          var _this = this;
          _classCallCheck(this, TypedMessage2);
          this.offset = 0;
          this.address = "";
          this.types = "";
          this.args = [];
          if (!isUndefined(address)) {
            if (!(isString(address) || isArray(address))) {
              throw new Error("OSC Message constructor first argument (address) must be a string or array");
            }
            this.address = prepareAddress(address);
          }
          if (!isUndefined(args)) {
            if (!isArray(args)) {
              throw new Error("OSC Message constructor second argument (args) must be an array");
            }
            args.forEach(function(item) {
              return _this.add(item.type, item.value);
            });
          }
        }
        _createClass(TypedMessage2, [{
          key: "add",
          value: function add(type, item) {
            if (isUndefined(type)) {
              throw new Error("OSC Message needs a valid OSC Atomic Data Type");
            }
            if (type === "N") {
              this.args.push(VALUE_NONE);
            } else if (type === "T") {
              this.args.push(VALUE_TRUE);
            } else if (type === "F") {
              this.args.push(VALUE_FALSE);
            } else if (type === "I") {
              this.args.push(VALUE_INFINITY);
            } else {
              this.args.push(item);
            }
            this.types += type;
          }
        }, {
          key: "pack",
          value: function pack() {
            var _this2 = this;
            if (this.address.length === 0 || this.address[0] !== "/") {
              throw new Error("OSC Message has an invalid address");
            }
            var encoder = new EncodeHelper();
            encoder.add(new AtomicString(this.address));
            encoder.add(new AtomicString(",".concat(this.types)));
            if (this.args.length > 0) {
              var argument;
              if (this.args.length > this.types.length) {
                throw new Error("OSC Message argument and type tag mismatch");
              }
              this.args.forEach(function(value, index) {
                var type = _this2.types[index];
                if (type === "i") {
                  argument = new AtomicInt32(value);
                } else if (type === "h") {
                  argument = new AtomicInt64(value);
                } else if (type === "t") {
                  argument = new AtomicUInt64(value);
                } else if (type === "f") {
                  argument = new AtomicFloat32(value);
                } else if (type === "d") {
                  argument = new AtomicFloat64(value);
                } else if (type === "s") {
                  argument = new AtomicString(value);
                } else if (type === "b") {
                  argument = new AtomicBlob(value);
                } else if (type === "T") {
                  argument = VALUE_TRUE;
                } else if (type === "F") {
                  argument = VALUE_FALSE;
                } else if (type === "N") {
                  argument = VALUE_NONE;
                } else if (type === "I") {
                  argument = VALUE_INFINITY;
                } else {
                  throw new Error("OSC Message found unknown argument type");
                }
                encoder.add(argument);
              });
            }
            return encoder.merge();
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC Message expects an instance of type DataView.");
            }
            var address = new AtomicString();
            address.unpack(dataView2, initialOffset);
            var types = new AtomicString();
            types.unpack(dataView2, address.offset);
            if (address.value.length === 0 || address.value[0] !== "/") {
              throw new Error("OSC Message found malformed or missing address string");
            }
            if (types.value.length === 0 && types.value[0] !== ",") {
              throw new Error("OSC Message found malformed or missing type string");
            }
            var offset = types.offset;
            var next;
            var type;
            var args = [];
            for (var i = 1; i < types.value.length; i += 1) {
              type = types.value[i];
              next = null;
              if (type === "i") {
                next = new AtomicInt32();
              } else if (type === "h") {
                next = new AtomicInt64();
              } else if (type === "t") {
                next = new AtomicUInt64();
              } else if (type === "f") {
                next = new AtomicFloat32();
              } else if (type === "d") {
                next = new AtomicFloat64();
              } else if (type === "s") {
                next = new AtomicString();
              } else if (type === "b") {
                next = new AtomicBlob();
              } else if (type === "T") {
                args.push(VALUE_TRUE);
              } else if (type === "F") {
                args.push(VALUE_FALSE);
              } else if (type === "N") {
                args.push(VALUE_NONE);
              } else if (type === "I") {
                args.push(VALUE_INFINITY);
              } else {
                throw new Error("OSC Message found unsupported argument type");
              }
              if (next) {
                offset = next.unpack(dataView2, offset);
                args.push(next.value);
              }
            }
            this.offset = offset;
            this.address = address.value;
            this.types = types.value;
            this.args = args;
            return this.offset;
          }
        }]);
        return TypedMessage2;
      }();
      var Message = function(_TypedMessage) {
        _inherits(Message2, _TypedMessage);
        var _super = _createSuper(Message2);
        function Message2(address) {
          var _this3;
          _classCallCheck(this, Message2);
          var oscArgs;
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }
          if (args.length > 0) {
            if (args[0] instanceof Array) {
              oscArgs = args.shift();
            }
          }
          _this3 = _super.call(this, address, oscArgs);
          if (args.length > 0) {
            _this3.types = args.map(function(item) {
              return typeTag(item);
            }).join("");
            _this3.args = args;
          }
          return _this3;
        }
        _createClass(Message2, [{
          key: "add",
          value: function add(item) {
            _get(_getPrototypeOf(Message2.prototype), "add", this).call(this, typeTag(item), item);
          }
        }]);
        return Message2;
      }(TypedMessage);
      var BUNDLE_TAG = "#bundle";
      var Bundle = function() {
        function Bundle2() {
          var _this = this;
          _classCallCheck(this, Bundle2);
          this.offset = 0;
          this.timetag = new AtomicTimetag();
          this.bundleElements = [];
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          if (args.length > 0) {
            if (args[0] instanceof Date || isInt(args[0])) {
              this.timetag = new AtomicTimetag(args[0]);
            } else if (isArray(args[0])) {
              args[0].forEach(function(item) {
                _this.add(item);
              });
              if (args.length > 1 && (args[1] instanceof Date || isInt(args[1]))) {
                this.timetag = new AtomicTimetag(args[1]);
              }
            } else {
              args.forEach(function(item) {
                _this.add(item);
              });
            }
          }
        }
        _createClass(Bundle2, [{
          key: "timestamp",
          value: function timestamp(ms) {
            if (!isInt(ms)) {
              throw new Error("OSC Bundle needs an integer for setting the timestamp");
            }
            this.timetag = new AtomicTimetag(ms);
          }
        }, {
          key: "add",
          value: function add(item) {
            if (!(item instanceof Message || item instanceof Bundle2)) {
              throw new Error("OSC Bundle contains only Messages and Bundles");
            }
            this.bundleElements.push(item);
          }
        }, {
          key: "pack",
          value: function pack() {
            var encoder = new EncodeHelper();
            encoder.add(new AtomicString(BUNDLE_TAG));
            if (!this.timetag) {
              this.timetag = new AtomicTimetag();
            }
            encoder.add(this.timetag);
            this.bundleElements.forEach(function(item) {
              encoder.add(new AtomicInt32(item.pack().byteLength));
              encoder.add(item);
            });
            return encoder.merge();
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC Bundle expects an instance of type DataView");
            }
            var parentHead = new AtomicString();
            parentHead.unpack(dataView2, initialOffset);
            if (parentHead.value !== BUNDLE_TAG) {
              throw new Error("OSC Bundle does not contain a valid #bundle head");
            }
            var timetag = new AtomicTimetag();
            var offset = timetag.unpack(dataView2, parentHead.offset);
            this.bundleElements = [];
            while (offset < dataView2.byteLength) {
              var head = new AtomicString();
              var size = new AtomicInt32();
              offset = size.unpack(dataView2, offset);
              var item = void 0;
              head.unpack(dataView2, offset);
              if (head.value === BUNDLE_TAG) {
                item = new Bundle2();
              } else {
                item = new Message();
              }
              offset = item.unpack(dataView2, offset);
              this.bundleElements.push(item);
            }
            this.offset = offset;
            this.timetag = timetag;
            return this.offset;
          }
        }]);
        return Bundle2;
      }();
      var Packet = function() {
        function Packet2(value) {
          _classCallCheck(this, Packet2);
          if (value && !(value instanceof Message || value instanceof Bundle)) {
            throw new Error("OSC Packet value has to be Message or Bundle");
          }
          this.value = value;
          this.offset = 0;
        }
        _createClass(Packet2, [{
          key: "pack",
          value: function pack() {
            if (!this.value) {
              throw new Error("OSC Packet can not be encoded with empty body");
            }
            return this.value.pack();
          }
        }, {
          key: "unpack",
          value: function unpack(dataView2) {
            var initialOffset = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
            if (!(dataView2 instanceof DataView)) {
              throw new Error("OSC Packet expects an instance of type DataView");
            }
            if (dataView2.byteLength % 4 !== 0) {
              throw new Error("OSC Packet byteLength has to be a multiple of four");
            }
            var head = new AtomicString();
            head.unpack(dataView2, initialOffset);
            var item;
            if (head.value === BUNDLE_TAG) {
              item = new Bundle();
            } else {
              item = new Message();
            }
            item.unpack(dataView2, initialOffset);
            this.offset = item.offset;
            this.value = item;
            return this.offset;
          }
        }]);
        return Packet2;
      }();
      var defaultOptions$5 = {
        discardLateMessages: false
      };
      var EventHandler = function() {
        function EventHandler2(options) {
          _classCallCheck(this, EventHandler2);
          this.options = _objectSpread2(_objectSpread2({}, defaultOptions$5), options);
          this.addressHandlers = [];
          this.eventHandlers = {
            open: [],
            error: [],
            close: []
          };
          this.uuid = 0;
        }
        _createClass(EventHandler2, [{
          key: "dispatch",
          value: function dispatch(packet, rinfo) {
            var _this = this;
            if (!(packet instanceof Packet)) {
              throw new Error("OSC EventHander dispatch() accepts only arguments of type Packet");
            }
            if (!packet.value) {
              throw new Error("OSC EventHander dispatch() can't read empty Packets");
            }
            if (packet.value instanceof Bundle) {
              var bundle = packet.value;
              return bundle.bundleElements.forEach(function(bundleItem) {
                if (bundleItem instanceof Bundle) {
                  if (bundle.timetag.value.timestamp() < bundleItem.timetag.value.timestamp()) {
                    throw new Error("OSC Bundle timestamp is older than the timestamp of enclosed Bundles");
                  }
                  return _this.dispatch(bundleItem);
                } else if (bundleItem instanceof Message) {
                  var message2 = bundleItem;
                  return _this.notify(message2.address, message2, bundle.timetag.value.timestamp(), rinfo);
                }
                throw new Error("OSC EventHander dispatch() can't dispatch unknown Packet value");
              });
            } else if (packet.value instanceof Message) {
              var message = packet.value;
              return this.notify(message.address, message, 0, rinfo);
            }
            throw new Error("OSC EventHander dispatch() can't dispatch unknown Packet value");
          }
        }, {
          key: "call",
          value: function call(name, data, rinfo) {
            var success = false;
            if (isString(name) && name in this.eventHandlers) {
              this.eventHandlers[name].forEach(function(handler) {
                handler.callback(data, rinfo);
                success = true;
              });
              return success;
            }
            var handlerKeys = Object.keys(this.addressHandlers);
            var handlers = this.addressHandlers;
            handlerKeys.forEach(function(key) {
              var foundMatch = false;
              var regex = new RegExp(prepareRegExPattern(prepareAddress(name)), "g");
              var test = regex.test(key);
              if (test && key.length === regex.lastIndex) {
                foundMatch = true;
              }
              if (!foundMatch) {
                var reverseRegex = new RegExp(prepareRegExPattern(prepareAddress(key)), "g");
                var reverseTest = reverseRegex.test(name);
                if (reverseTest && name.length === reverseRegex.lastIndex) {
                  foundMatch = true;
                }
              }
              if (foundMatch) {
                handlers[key].forEach(function(handler) {
                  handler.callback(data, rinfo);
                  success = true;
                });
              }
            });
            return success;
          }
        }, {
          key: "notify",
          value: function notify() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            if (args.length === 0) {
              throw new Error("OSC EventHandler can not be called without any argument");
            }
            if (args[0] instanceof Packet) {
              return this.dispatch(args[0], args[1]);
            } else if (args[0] instanceof Bundle || args[0] instanceof Message) {
              return this.dispatch(new Packet(args[0]), args[1]);
            } else if (!isString(args[0])) {
              var packet = new Packet();
              packet.unpack(dataView(args[0]));
              return this.dispatch(packet, args[1]);
            }
            var name = args[0];
            var data = null;
            if (args.length > 1) {
              data = args[1];
            }
            var timestamp = null;
            if (args.length > 2) {
              if (isInt(args[2])) {
                timestamp = args[2];
              } else if (args[2] instanceof Date) {
                timestamp = args[2].getTime();
              } else {
                throw new Error("OSC EventHandler timestamp has to be a number or Date");
              }
            }
            var rinfo = null;
            if (args.length >= 3) {
              rinfo = args[3];
            }
            if (timestamp) {
              var now = Date.now();
              if (now > timestamp) {
                if (!this.options.discardLateMessages) {
                  return this.call(name, data, rinfo);
                }
              }
              var that = this;
              setTimeout(function() {
                that.call(name, data, rinfo);
              }, timestamp - now);
              return true;
            }
            return this.call(name, data, rinfo);
          }
        }, {
          key: "on",
          value: function on(name, callback) {
            if (!(isString(name) || isArray(name))) {
              throw new Error("OSC EventHandler accepts only strings or arrays for address patterns");
            }
            if (!isFunction(callback)) {
              throw new Error("OSC EventHandler callback has to be a function");
            }
            this.uuid += 1;
            var handler = {
              id: this.uuid,
              callback
            };
            if (isString(name) && name in this.eventHandlers) {
              this.eventHandlers[name].push(handler);
              return this.uuid;
            }
            var address = prepareAddress(name);
            if (!(address in this.addressHandlers)) {
              this.addressHandlers[address] = [];
            }
            this.addressHandlers[address].push(handler);
            return this.uuid;
          }
        }, {
          key: "off",
          value: function off(name, subscriptionId) {
            if (!(isString(name) || isArray(name))) {
              throw new Error("OSC EventHandler accepts only strings or arrays for address patterns");
            }
            if (!isInt(subscriptionId)) {
              throw new Error("OSC EventHandler subscription id has to be a number");
            }
            var key;
            var haystack;
            if (isString(name) && name in this.eventHandlers) {
              key = name;
              haystack = this.eventHandlers;
            } else {
              key = prepareAddress(name);
              haystack = this.addressHandlers;
            }
            if (key in haystack) {
              return haystack[key].some(function(item, index) {
                if (item.id === subscriptionId) {
                  haystack[key].splice(index, 1);
                  return true;
                }
                return false;
              });
            }
            return false;
          }
        }]);
        return EventHandler2;
      }();
      var Plugin = function() {
        function Plugin2() {
          _classCallCheck(this, Plugin2);
          if (this.constructor === Plugin2) {
            throw new Error("Plugin is an abstract class. Please create or use an implementation!");
          }
        }
        _createClass(Plugin2, [{
          key: "status",
          value: function status() {
            throw new Error("Abstract method!");
          }
        }, {
          key: "open",
          value: function open() {
            throw new Error("Abstract method!");
          }
        }, {
          key: "close",
          value: function close() {
            throw new Error("Abstract method!");
          }
        }, {
          key: "send",
          value: function send(binary) {
            throw new Error("Abstract method!");
          }
        }]);
        return Plugin2;
      }();
      var STATUS$4 = {
        IS_NOT_INITIALIZED: -1,
        IS_CONNECTING: 0,
        IS_OPEN: 1,
        IS_CLOSING: 2,
        IS_CLOSED: 3
      };
      var defaultOpenOptions = {
        host: "localhost",
        port: 41234,
        exclusive: false
      };
      var defaultSendOptions = {
        host: "localhost",
        port: 41235
      };
      var defaultOptions$4 = {
        type: "udp4",
        open: defaultOpenOptions,
        send: defaultSendOptions
      };
      function mergeOptions$1(base, custom) {
        return _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$4), base), custom), {}, {
          open: _objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$4.open), base.open), custom.open),
          send: _objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$4.send), base.send), custom.send)
        });
      }
      var DatagramPlugin = function(_Plugin) {
        _inherits(DatagramPlugin2, _Plugin);
        var _super = _createSuper(DatagramPlugin2);
        function DatagramPlugin2() {
          var _this;
          var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          _classCallCheck(this, DatagramPlugin2);
          _this = _super.call(this);
          if (!dgram__default["default"]) {
            throw new Error("DatagramPlugin can not be used in browser context");
          }
          _this.options = mergeOptions$1({}, options);
          _this.socket = dgram__default["default"].createSocket(_this.options.type);
          _this.socketStatus = STATUS$4.IS_NOT_INITIALIZED;
          _this.socket.on("message", function(message, rinfo) {
            _this.notify(message, rinfo);
          });
          _this.socket.on("error", function(error) {
            _this.notify("error", error);
          });
          _this.notify = function() {
          };
          return _this;
        }
        _createClass(DatagramPlugin2, [{
          key: "registerNotify",
          value: function registerNotify(fn) {
            this.notify = fn;
          }
        }, {
          key: "status",
          value: function status() {
            return this.socketStatus;
          }
        }, {
          key: "open",
          value: function open() {
            var _this2 = this;
            var customOptions = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            var options = _objectSpread2(_objectSpread2({}, this.options.open), customOptions);
            var port = options.port, exclusive = options.exclusive;
            this.socketStatus = STATUS$4.IS_CONNECTING;
            this.socket.bind({
              address: options.host,
              port,
              exclusive
            }, function() {
              _this2.socketStatus = STATUS$4.IS_OPEN;
              _this2.notify("open");
            });
          }
        }, {
          key: "close",
          value: function close() {
            var _this3 = this;
            this.socketStatus = STATUS$4.IS_CLOSING;
            this.socket.close(function() {
              _this3.socketStatus = STATUS$4.IS_CLOSED;
              _this3.notify("close");
            });
          }
        }, {
          key: "send",
          value: function send(binary) {
            var customOptions = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var options = _objectSpread2(_objectSpread2({}, this.options.send), customOptions);
            var port = options.port, host = options.host;
            this.socket.send(Buffer.from(binary), 0, binary.byteLength, port, host);
          }
        }]);
        return DatagramPlugin2;
      }(Plugin);
      var STATUS$3 = {
        IS_NOT_INITIALIZED: -1,
        IS_CONNECTING: 0,
        IS_OPEN: 1,
        IS_CLOSING: 2,
        IS_CLOSED: 3
      };
      var defaultOptions$3 = {
        udpServer: {
          host: "localhost",
          port: 41234,
          exclusive: false
        },
        udpClient: {
          host: "localhost",
          port: 41235
        },
        wsServer: {
          host: "localhost",
          port: 8080
        },
        receiver: "ws"
      };
      function mergeOptions(base, custom) {
        return _objectSpread2(_objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$3), base), custom), {}, {
          udpServer: _objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$3.udpServer), base.udpServer), custom.udpServer),
          udpClient: _objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$3.udpClient), base.udpClient), custom.udpClient),
          wsServer: _objectSpread2(_objectSpread2(_objectSpread2({}, defaultOptions$3.wsServer), base.wsServer), custom.wsServer)
        });
      }
      var BridgePlugin = function(_Plugin) {
        _inherits(BridgePlugin2, _Plugin);
        var _super = _createSuper(BridgePlugin2);
        function BridgePlugin2() {
          var _this;
          var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          _classCallCheck(this, BridgePlugin2);
          _this = _super.call(this);
          if (!dgram__default["default"] || !WebSocket.WebSocketServer) {
            throw new Error("BridgePlugin can not be used in browser context");
          }
          _this.options = mergeOptions({}, options);
          _this.websocket = null;
          _this.socket = dgram__default["default"].createSocket("udp4");
          _this.socketStatus = STATUS$3.IS_NOT_INITIALIZED;
          _this.socket.on("message", function(message) {
            _this.send(message, {
              receiver: "ws"
            });
            _this.notify(message.buffer);
          });
          _this.socket.on("error", function(error) {
            _this.notify("error", error);
          });
          _this.notify = function() {
          };
          return _this;
        }
        _createClass(BridgePlugin2, [{
          key: "registerNotify",
          value: function registerNotify(fn) {
            this.notify = fn;
          }
        }, {
          key: "status",
          value: function status() {
            return this.socketStatus;
          }
        }, {
          key: "open",
          value: function open() {
            var _this2 = this;
            var customOptions = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            var options = mergeOptions(this.options, customOptions);
            this.socketStatus = STATUS$3.IS_CONNECTING;
            this.socket.bind({
              address: options.udpServer.host,
              port: options.udpServer.port,
              exclusive: options.udpServer.exclusive
            }, function() {
              var wsServerOptions = {};
              if (options.wsServer.server) {
                wsServerOptions.server = options.wsServer.server;
              } else {
                wsServerOptions = options.wsServer;
              }
              _this2.websocket = new WebSocket.WebSocketServer(wsServerOptions);
              _this2.websocket.binaryType = "arraybuffer";
              _this2.websocket.on("listening", function() {
                _this2.socketStatus = STATUS$3.IS_OPEN;
                _this2.notify("open");
              });
              _this2.websocket.on("error", function(error) {
                _this2.notify("error", error);
              });
              _this2.websocket.on("connection", function(client) {
                client.on("message", function(message, rinfo) {
                  _this2.send(message, {
                    receiver: "udp"
                  });
                  _this2.notify(new Uint8Array(message), rinfo);
                });
              });
            });
          }
        }, {
          key: "close",
          value: function close() {
            var _this3 = this;
            this.socketStatus = STATUS$3.IS_CLOSING;
            this.socket.close(function() {
              _this3.websocket.close(function() {
                _this3.socketStatus = STATUS$3.IS_CLOSED;
                _this3.notify("close");
              });
            });
          }
        }, {
          key: "send",
          value: function send(binary) {
            var customOptions = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            var options = mergeOptions(this.options, customOptions);
            var receiver = options.receiver;
            if (receiver === "udp") {
              var data = binary instanceof Buffer ? binary : Buffer.from(binary);
              this.socket.send(data, 0, data.byteLength, options.udpClient.port, options.udpClient.host);
            } else if (receiver === "ws") {
              this.websocket.clients.forEach(function(client) {
                client.send(binary, {
                  binary: true
                });
              });
            } else {
              throw new Error("BridgePlugin can not send message to unknown receiver");
            }
          }
        }]);
        return BridgePlugin2;
      }(Plugin);
      var STATUS$2 = {
        IS_NOT_INITIALIZED: -1,
        IS_CONNECTING: 0,
        IS_OPEN: 1,
        IS_CLOSING: 2,
        IS_CLOSED: 3
      };
      var defaultOptions$2 = {
        host: "localhost",
        port: 8080,
        secure: false,
        protocol: []
      };
      var WebsocketClientPlugin = function(_Plugin) {
        _inherits(WebsocketClientPlugin2, _Plugin);
        var _super = _createSuper(WebsocketClientPlugin2);
        function WebsocketClientPlugin2(options) {
          var _this;
          _classCallCheck(this, WebsocketClientPlugin2);
          _this = _super.call(this);
          if (!WebSocket__default["default"]) {
            throw new Error("WebsocketClientPlugin can't find a WebSocket class");
          }
          _this.options = _objectSpread2(_objectSpread2({}, defaultOptions$2), options);
          _this.socket = null;
          _this.socketStatus = STATUS$2.IS_NOT_INITIALIZED;
          _this.notify = function() {
          };
          return _this;
        }
        _createClass(WebsocketClientPlugin2, [{
          key: "registerNotify",
          value: function registerNotify(fn) {
            this.notify = fn;
          }
        }, {
          key: "status",
          value: function status() {
            return this.socketStatus;
          }
        }, {
          key: "open",
          value: function open() {
            var _this2 = this;
            var customOptions = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            var options = _objectSpread2(_objectSpread2({}, this.options), customOptions);
            var port = options.port, host = options.host, secure = options.secure, protocol = options.protocol;
            if (this.socket) {
              this.close();
            }
            var scheme = secure ? "wss" : "ws";
            var rinfo = {
              address: host,
              family: scheme,
              port,
              size: 0
            };
            this.socket = new WebSocket__default["default"]("".concat(scheme, "://").concat(host, ":").concat(port), protocol);
            this.socket.binaryType = "arraybuffer";
            this.socketStatus = STATUS$2.IS_CONNECTING;
            this.socket.onopen = function() {
              _this2.socketStatus = STATUS$2.IS_OPEN;
              _this2.notify("open");
            };
            this.socket.onclose = function() {
              _this2.socketStatus = STATUS$2.IS_CLOSED;
              _this2.notify("close");
            };
            this.socket.onerror = function(error) {
              _this2.notify("error", error);
            };
            this.socket.onmessage = function(message) {
              _this2.notify(message.data, rinfo);
            };
          }
        }, {
          key: "close",
          value: function close() {
            this.socketStatus = STATUS$2.IS_CLOSING;
            this.socket.close();
          }
        }, {
          key: "send",
          value: function send(binary) {
            this.socket.send(binary);
          }
        }]);
        return WebsocketClientPlugin2;
      }(Plugin);
      var STATUS$1 = {
        IS_NOT_INITIALIZED: -1,
        IS_CONNECTING: 0,
        IS_OPEN: 1,
        IS_CLOSING: 2,
        IS_CLOSED: 3
      };
      var defaultOptions$1 = {
        host: "localhost",
        port: 8080
      };
      var WebsocketServerPlugin = function(_Plugin) {
        _inherits(WebsocketServerPlugin2, _Plugin);
        var _super = _createSuper(WebsocketServerPlugin2);
        function WebsocketServerPlugin2(options) {
          var _this;
          _classCallCheck(this, WebsocketServerPlugin2);
          _this = _super.call(this);
          if (!WebSocket.WebSocketServer) {
            throw new Error("WebsocketServerPlugin can not be used in browser context");
          }
          _this.options = _objectSpread2(_objectSpread2({}, defaultOptions$1), options);
          _this.socket = null;
          _this.socketStatus = STATUS$1.IS_NOT_INITIALIZED;
          _this.notify = function() {
          };
          return _this;
        }
        _createClass(WebsocketServerPlugin2, [{
          key: "registerNotify",
          value: function registerNotify(fn) {
            this.notify = fn;
          }
        }, {
          key: "status",
          value: function status() {
            return this.socketStatus;
          }
        }, {
          key: "open",
          value: function open() {
            var _this2 = this;
            var customOptions = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            var options = _objectSpread2(_objectSpread2({}, this.options), customOptions);
            var port = options.port, host = options.host;
            var rinfo = {
              address: host,
              family: "wsserver",
              port,
              size: 0
            };
            if (this.socket) {
              this.close();
            }
            if (options.server) {
              this.socket = new WebSocket.WebSocketServer({
                server: options.server
              });
            } else {
              this.socket = new WebSocket.WebSocketServer({
                host,
                port
              });
            }
            this.socket.binaryType = "arraybuffer";
            this.socketStatus = STATUS$1.IS_CONNECTING;
            this.socket.on("listening", function() {
              _this2.socketStatus = STATUS$1.IS_OPEN;
              _this2.notify("open");
            });
            this.socket.on("error", function(error) {
              _this2.notify("error", error);
            });
            this.socket.on("connection", function(client) {
              client.on("message", function(message) {
                _this2.notify(new Uint8Array(message), rinfo);
              });
            });
          }
        }, {
          key: "close",
          value: function close() {
            var _this3 = this;
            this.socketStatus = STATUS$1.IS_CLOSING;
            this.socket.close(function() {
              _this3.socketStatus = STATUS$1.IS_CLOSED;
              _this3.notify("close");
            });
          }
        }, {
          key: "send",
          value: function send(binary) {
            this.socket.clients.forEach(function(client) {
              client.send(binary, {
                binary: true
              });
            });
          }
        }]);
        return WebsocketServerPlugin2;
      }(Plugin);
      var defaultOptions = {
        discardLateMessages: false,
        plugin: new WebsocketClientPlugin()
      };
      var STATUS = {
        IS_NOT_INITIALIZED: -1,
        IS_CONNECTING: 0,
        IS_OPEN: 1,
        IS_CLOSING: 2,
        IS_CLOSED: 3
      };
      var OSC2 = function() {
        function OSC3(options) {
          _classCallCheck(this, OSC3);
          if (options && !isObject(options)) {
            throw new Error("OSC options argument has to be an object.");
          }
          this.options = _objectSpread2(_objectSpread2({}, defaultOptions), options);
          this.eventHandler = new EventHandler({
            discardLateMessages: this.options.discardLateMessages
          });
          var eventHandler = this.eventHandler;
          if (this.options.plugin && this.options.plugin.registerNotify) {
            this.options.plugin.registerNotify(function() {
              return eventHandler.notify.apply(eventHandler, arguments);
            });
          }
        }
        _createClass(OSC3, [{
          key: "on",
          value: function on(eventName, callback) {
            if (!(isString(eventName) && isFunction(callback))) {
              throw new Error("OSC on() needs event- or address string and callback function");
            }
            return this.eventHandler.on(eventName, callback);
          }
        }, {
          key: "off",
          value: function off(eventName, subscriptionId) {
            if (!(isString(eventName) && isInt(subscriptionId))) {
              throw new Error("OSC off() needs string and number (subscriptionId) to unsubscribe");
            }
            return this.eventHandler.off(eventName, subscriptionId);
          }
        }, {
          key: "open",
          value: function open(options) {
            if (options && !isObject(options)) {
              throw new Error("OSC open() options argument needs to be an object");
            }
            if (!(this.options.plugin && isFunction(this.options.plugin.open))) {
              throw new Error("OSC Plugin API #open is not implemented!");
            }
            return this.options.plugin.open(options);
          }
        }, {
          key: "status",
          value: function status() {
            if (!(this.options.plugin && isFunction(this.options.plugin.status))) {
              throw new Error("OSC Plugin API #status is not implemented!");
            }
            return this.options.plugin.status();
          }
        }, {
          key: "close",
          value: function close() {
            if (!(this.options.plugin && isFunction(this.options.plugin.close))) {
              throw new Error("OSC Plugin API #close is not implemented!");
            }
            return this.options.plugin.close();
          }
        }, {
          key: "send",
          value: function send(packet, options) {
            if (!(this.options.plugin && isFunction(this.options.plugin.send))) {
              throw new Error("OSC Plugin API #send is not implemented!");
            }
            if (!(packet instanceof TypedMessage || packet instanceof Message || packet instanceof Bundle || packet instanceof Packet)) {
              throw new Error("OSC send() needs Messages, Bundles or Packets");
            }
            if (options && !isObject(options)) {
              throw new Error("OSC send() options argument has to be an object");
            }
            return this.options.plugin.send(packet.pack(), options);
          }
        }]);
        return OSC3;
      }();
      OSC2.STATUS = STATUS;
      OSC2.Packet = Packet;
      OSC2.Bundle = Bundle;
      OSC2.Message = Message;
      OSC2.TypedMessage = TypedMessage;
      OSC2.Plugin = Plugin;
      OSC2.DatagramPlugin = DatagramPlugin;
      OSC2.WebsocketClientPlugin = WebsocketClientPlugin;
      OSC2.WebsocketServerPlugin = WebsocketServerPlugin;
      OSC2.BridgePlugin = BridgePlugin;
      return OSC2;
    });
  }
});

// src/main.ts
var import_max_api2 = __toESM(require("max-api"));

// src/ableton.ts
var import_osc_js = __toESM(require_osc());
var Ableton = class {
  constructor(config) {
    this.osc = new import_osc_js.default({ plugin: new import_osc_js.default.DatagramPlugin() });
    this.logger = config.logger;
    this.osc.open({ port: 11001, host: "0.0.0.0" });
    this.osc.on("open", () => this.logger.info("OSC open"));
    this.osc.on("error", (err) => this.logger.error("OSC error", err));
    this.osc.on("/live/error", (msg) => this.logger.error("Ableton error", msg));
  }
  destroy() {
    this.osc.close();
  }
  async send(address, message = "") {
    this.osc.send(new import_osc_js.default.Message(address, message), { port: 11e3, host: "127.0.0.1" });
  }
  async receive(address) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject("Timeout"), 1e3);
      const unsubscribe = this.osc.on(address, (message) => {
        clearTimeout(timeout);
        this.osc.off(address, unsubscribe);
        resolve(message);
      });
    });
  }
  async test() {
    const addr = "/live/test";
    await this.send(addr);
    const msg = await this.receive(addr);
    return msg;
  }
};

// src/logger.ts
var import_max_api = __toESM(require("max-api"));
var Logger = class {
  info(...args) {
    console.info(...args);
    import_max_api.default.post(...args, import_max_api.default.POST_LEVELS.INFO);
  }
  error(...args) {
    console.error(...args);
    import_max_api.default.post(...args, import_max_api.default.POST_LEVELS.ERROR);
  }
  warn(...args) {
    console.warn(...args);
    import_max_api.default.post(...args, import_max_api.default.POST_LEVELS.WARN);
  }
};

// src/main.ts
var logger = new Logger();
logger.info("Hello from Node");
var ableton = new Ableton({
  logger
});
import_max_api2.default.addHandlers({
  test() {
    logger.info("handling test command...");
    ableton.test().then((msg) => {
      logger.info(msg);
    }).catch((err) => {
      logger.error(err);
    });
  }
});
