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

// node_modules/binpack/index.js
var require_binpack = __commonJS({
  "node_modules/binpack/index.js"(exports2, module2) {
    var sizeOfType = function(t) {
      if (t[0] === "U") {
        t = t.slice(1);
      }
      return {
        "Float32": 4,
        "Float64": 8,
        "Int8": 1,
        "Int16": 2,
        "Int32": 4,
        "Int64": 8
      }[t];
    };
    var endianConv = function(e, t) {
      if (t[t.length - 1] === "8")
        return "";
      if (e === "big") {
        return "BE";
      }
      return "LE";
    };
    var addBindings = function(binpackTypename, nodeTypename) {
      if (!(typeof nodeTypename !== "undefined" && nodeTypename !== null)) {
        nodeTypename = binpackTypename;
      }
      module2.exports["pack" + binpackTypename] = function(num, endian) {
        b = new Buffer(sizeOfType(binpackTypename));
        b["write" + nodeTypename + endianConv(endian, binpackTypename)](num, 0, true);
        return b;
      };
      module2.exports["unpack" + binpackTypename] = function(buff, endian) {
        return buff["read" + nodeTypename + endianConv(endian, binpackTypename)](0);
      };
    };
    var addIntBindings = function(n) {
      addBindings("Int" + n);
      addBindings("UInt" + n);
    };
    addIntBindings(8);
    addIntBindings(16);
    addIntBindings(32);
    twoToThe32 = Math.pow(2, 32);
    var read64 = function(unsigned) {
      return function(buff, endian) {
        var e = endianConv(endian, "");
        var u = unsigned ? "U" : "";
        var low, high;
        if (e === "LE") {
          low = buff.readUInt32LE(0);
          high = buff["read" + u + "Int32LE"](4);
        } else {
          low = buff.readUInt32BE(4);
          high = buff["read" + u + "Int32BE"](0);
        }
        return high * twoToThe32 + low;
      };
    };
    var write64 = function(unsigned) {
      return function(num, endian) {
        var e = endianConv(endian, "");
        var u = unsigned ? "U" : "";
        var b2 = new Buffer(8);
        var high = Math.floor(num / twoToThe32);
        var low = Math.floor(num - high * twoToThe32);
        if (e == "LE") {
          b2.writeUInt32LE(low, 0, true);
          b2["write" + u + "Int32LE"](high, 4, true);
        } else {
          b2.writeUInt32BE(low, 4, true);
          b2["write" + u + "Int32BE"](high, 0, true);
        }
        return b2;
      };
    };
    module2.exports.unpackInt64 = read64(false);
    module2.exports.unpackUInt64 = read64(true);
    module2.exports.packInt64 = write64(false);
    module2.exports.packUInt64 = write64(true);
    addBindings("Float32", "Float");
    addBindings("Float64", "Double");
  }
});

// node_modules/osc-min/lib/osc-utilities.js
var require_osc_utilities = __commonJS({
  "node_modules/osc-min/lib/osc-utilities.js"(exports2) {
    (function() {
      var IsArray, StrictError, TWO_POW_32, UNIX_EPOCH, binpack, getArrayArg, isOscBundleBuffer, makeTimetag, mapBundleList, oscTypeCodes, padding, toOscTypeAndArgs, hasProp = {}.hasOwnProperty;
      binpack = require_binpack();
      exports2.concat = function(buffers) {
        var buffer, copyTo, destBuffer, j, k, l, len, len1, len2, sumLength;
        if (!IsArray(buffers)) {
          throw new Error("concat must take an array of buffers");
        }
        for (j = 0, len = buffers.length; j < len; j++) {
          buffer = buffers[j];
          if (!Buffer.isBuffer(buffer)) {
            throw new Error("concat must take an array of buffers");
          }
        }
        sumLength = 0;
        for (k = 0, len1 = buffers.length; k < len1; k++) {
          buffer = buffers[k];
          sumLength += buffer.length;
        }
        destBuffer = new Buffer(sumLength);
        copyTo = 0;
        for (l = 0, len2 = buffers.length; l < len2; l++) {
          buffer = buffers[l];
          buffer.copy(destBuffer, copyTo);
          copyTo += buffer.length;
        }
        return destBuffer;
      };
      exports2.toOscString = function(str, strict) {
        var i, j, nullIndex, ref;
        if (!(typeof str === "string")) {
          throw new Error("can't pack a non-string into an osc-string");
        }
        nullIndex = str.indexOf("\0");
        if (nullIndex !== -1 && strict) {
          throw StrictError("Can't pack an osc-string that contains NULL characters");
        }
        if (nullIndex !== -1) {
          str = str.slice(0, nullIndex);
        }
        for (i = j = 0, ref = padding(str); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          str += "\0";
        }
        return new Buffer(str);
      };
      exports2.splitOscString = function(buffer, strict) {
        var i, j, nullIndex, rawStr, ref, ref1, rest, splitPoint, str;
        if (!Buffer.isBuffer(buffer)) {
          throw StrictError("Can't split something that isn't a buffer");
        }
        rawStr = buffer.toString("utf8");
        nullIndex = rawStr.indexOf("\0");
        if (nullIndex === -1) {
          if (strict) {
            throw new Error("All osc-strings must contain a null character");
          }
          return {
            string: rawStr,
            rest: new Buffer(0)
          };
        }
        str = rawStr.slice(0, nullIndex);
        splitPoint = Buffer.byteLength(str) + padding(str);
        if (strict && splitPoint > buffer.length) {
          throw StrictError("Not enough padding for osc-string");
        }
        if (strict) {
          for (i = j = ref = Buffer.byteLength(str), ref1 = splitPoint; ref <= ref1 ? j < ref1 : j > ref1; i = ref <= ref1 ? ++j : --j) {
            if (buffer[i] !== 0) {
              throw StrictError("Not enough or incorrect padding for osc-string");
            }
          }
        }
        rest = buffer.slice(splitPoint, buffer.length);
        return {
          string: str,
          rest
        };
      };
      exports2.splitInteger = function(buffer, type) {
        var bytes, num, rest, value;
        if (type == null) {
          type = "Int32";
        }
        bytes = binpack["pack" + type](0).length;
        if (buffer.length < bytes) {
          throw new Error("buffer is not big enough for integer type");
        }
        num = 0;
        value = binpack["unpack" + type](buffer.slice(0, bytes), "big");
        rest = buffer.slice(bytes, buffer.length);
        return {
          integer: value,
          rest
        };
      };
      exports2.splitTimetag = function(buffer) {
        var a, b2, bytes, c, d, fractional, rest, seconds, type;
        type = "UInt32";
        bytes = binpack["pack" + type](0).length;
        if (buffer.length < bytes * 2) {
          throw new Error("buffer is not big enough to contain a timetag");
        }
        a = 0;
        b2 = bytes;
        seconds = binpack["unpack" + type](buffer.slice(a, b2), "big");
        c = bytes;
        d = bytes + bytes;
        fractional = binpack["unpack" + type](buffer.slice(c, d), "big");
        rest = buffer.slice(d, buffer.length);
        return {
          timetag: [seconds, fractional],
          rest
        };
      };
      UNIX_EPOCH = 2208988800;
      TWO_POW_32 = 4294967296;
      exports2.dateToTimetag = function(date) {
        return exports2.timestampToTimetag(date.getTime() / 1e3);
      };
      exports2.timestampToTimetag = function(secs) {
        var fracSeconds, wholeSecs;
        wholeSecs = Math.floor(secs);
        fracSeconds = secs - wholeSecs;
        return makeTimetag(wholeSecs, fracSeconds);
      };
      exports2.timetagToTimestamp = function(timetag) {
        var seconds;
        seconds = timetag[0] + exports2.ntpToFractionalSeconds(timetag[1]);
        return seconds - UNIX_EPOCH;
      };
      makeTimetag = function(unixseconds, fracSeconds) {
        var ntpFracs, ntpSecs;
        ntpSecs = unixseconds + UNIX_EPOCH;
        ntpFracs = Math.round(TWO_POW_32 * fracSeconds);
        return [ntpSecs, ntpFracs];
      };
      exports2.timetagToDate = function(timetag) {
        var date, dd, fracs, fractional, seconds;
        seconds = timetag[0], fractional = timetag[1];
        seconds = seconds - UNIX_EPOCH;
        fracs = exports2.ntpToFractionalSeconds(fractional);
        date = /* @__PURE__ */ new Date();
        date.setTime(seconds * 1e3 + fracs * 1e3);
        dd = /* @__PURE__ */ new Date();
        dd.setUTCFullYear(date.getUTCFullYear());
        dd.setUTCMonth(date.getUTCMonth());
        dd.setUTCDate(date.getUTCDate());
        dd.setUTCHours(date.getUTCHours());
        dd.setUTCMinutes(date.getUTCMinutes());
        dd.setUTCSeconds(date.getUTCSeconds());
        dd.setUTCMilliseconds(fracs * 1e3);
        return dd;
      };
      exports2.deltaTimetag = function(seconds, now) {
        var n;
        n = (now != null ? now : /* @__PURE__ */ new Date()) / 1e3;
        return exports2.timestampToTimetag(n + seconds);
      };
      exports2.ntpToFractionalSeconds = function(fracSeconds) {
        return parseFloat(fracSeconds) / TWO_POW_32;
      };
      exports2.toTimetagBuffer = function(timetag) {
        var high, low, type;
        if (typeof timetag === "number") {
          timetag = exports2.timestampToTimetag(timetag);
        } else if (typeof timetag === "object" && "getTime" in timetag) {
          timetag = exports2.dateToTimetag(timetag);
        } else if (timetag.length !== 2) {
          throw new Error("Invalid timetag" + timetag);
        }
        type = "UInt32";
        high = binpack["pack" + type](timetag[0], "big");
        low = binpack["pack" + type](timetag[1], "big");
        return exports2.concat([high, low]);
      };
      exports2.toIntegerBuffer = function(number, type) {
        if (type == null) {
          type = "Int32";
        }
        if (typeof number !== "number") {
          throw new Error("cannot pack a non-number into an integer buffer");
        }
        return binpack["pack" + type](number, "big");
      };
      oscTypeCodes = {
        s: {
          representation: "string",
          split: function(buffer, strict) {
            var split;
            split = exports2.splitOscString(buffer, strict);
            return {
              value: split.string,
              rest: split.rest
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "string") {
              throw new Error("expected string");
            }
            return exports2.toOscString(value, strict);
          }
        },
        i: {
          representation: "integer",
          split: function(buffer, strict) {
            var split;
            split = exports2.splitInteger(buffer);
            return {
              value: split.integer,
              rest: split.rest
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "number") {
              throw new Error("expected number");
            }
            return exports2.toIntegerBuffer(value);
          }
        },
        t: {
          representation: "timetag",
          split: function(buffer, strict) {
            var split;
            split = exports2.splitTimetag(buffer);
            return {
              value: split.timetag,
              rest: split.rest
            };
          },
          toArg: function(value, strict) {
            return exports2.toTimetagBuffer(value);
          }
        },
        f: {
          representation: "float",
          split: function(buffer, strict) {
            return {
              value: binpack.unpackFloat32(buffer.slice(0, 4), "big"),
              rest: buffer.slice(4, buffer.length)
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "number") {
              throw new Error("expected number");
            }
            return binpack.packFloat32(value, "big");
          }
        },
        d: {
          representation: "double",
          split: function(buffer, strict) {
            return {
              value: binpack.unpackFloat64(buffer.slice(0, 8), "big"),
              rest: buffer.slice(8, buffer.length)
            };
          },
          toArg: function(value, strict) {
            if (typeof value !== "number") {
              throw new Error("expected number");
            }
            return binpack.packFloat64(value, "big");
          }
        },
        b: {
          representation: "blob",
          split: function(buffer, strict) {
            var length, ref;
            ref = exports2.splitInteger(buffer), length = ref.integer, buffer = ref.rest;
            return {
              value: buffer.slice(0, length),
              rest: buffer.slice(length, buffer.length)
            };
          },
          toArg: function(value, strict) {
            var size;
            if (!Buffer.isBuffer(value)) {
              throw new Error("expected node.js Buffer");
            }
            size = exports2.toIntegerBuffer(value.length);
            return exports2.concat([size, value]);
          }
        },
        T: {
          representation: "true",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: true
            };
          },
          toArg: function(value, strict) {
            if (!value && strict) {
              throw new Error("true must be true");
            }
            return new Buffer(0);
          }
        },
        F: {
          representation: "false",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: false
            };
          },
          toArg: function(value, strict) {
            if (value && strict) {
              throw new Error("false must be false");
            }
            return new Buffer(0);
          }
        },
        N: {
          representation: "null",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: null
            };
          },
          toArg: function(value, strict) {
            if (value && strict) {
              throw new Error("null must be false");
            }
            return new Buffer(0);
          }
        },
        I: {
          representation: "bang",
          split: function(buffer, strict) {
            return {
              rest: buffer,
              value: "bang"
            };
          },
          toArg: function(value, strict) {
            return new Buffer(0);
          }
        }
      };
      exports2.oscTypeCodeToTypeString = function(code) {
        var ref;
        return (ref = oscTypeCodes[code]) != null ? ref.representation : void 0;
      };
      exports2.typeStringToOscTypeCode = function(rep) {
        var code, str;
        for (code in oscTypeCodes) {
          if (!hasProp.call(oscTypeCodes, code))
            continue;
          str = oscTypeCodes[code].representation;
          if (str === rep) {
            return code;
          }
        }
        return null;
      };
      exports2.argToTypeCode = function(arg, strict) {
        var code, value;
        if ((arg != null ? arg.type : void 0) != null && typeof arg.type === "string" && (code = exports2.typeStringToOscTypeCode(arg.type)) != null) {
          return code;
        }
        value = (arg != null ? arg.value : void 0) != null ? arg.value : arg;
        if (strict && value == null) {
          throw new Error("Argument has no value");
        }
        if (typeof value === "string") {
          return "s";
        }
        if (typeof value === "number") {
          return "f";
        }
        if (Buffer.isBuffer(value)) {
          return "b";
        }
        if (typeof value === "boolean") {
          if (value) {
            return "T";
          } else {
            return "F";
          }
        }
        if (value === null) {
          return "N";
        }
        throw new Error("I don't know what type this is supposed to be.");
      };
      exports2.splitOscArgument = function(buffer, type, strict) {
        var osctype;
        osctype = exports2.typeStringToOscTypeCode(type);
        if (osctype != null) {
          return oscTypeCodes[osctype].split(buffer, strict);
        } else {
          throw new Error("I don't understand how I'm supposed to unpack " + type);
        }
      };
      exports2.toOscArgument = function(value, type, strict) {
        var osctype;
        osctype = exports2.typeStringToOscTypeCode(type);
        if (osctype != null) {
          return oscTypeCodes[osctype].toArg(value, strict);
        } else {
          throw new Error("I don't know how to pack " + type);
        }
      };
      exports2.fromOscMessage = function(buffer, strict) {
        var address, arg, args, arrayStack, built, j, len, ref, ref1, type, typeString, types;
        ref = exports2.splitOscString(buffer, strict), address = ref.string, buffer = ref.rest;
        if (strict && address[0] !== "/") {
          throw StrictError("addresses must start with /");
        }
        if (!buffer.length) {
          return {
            address,
            args: []
          };
        }
        ref1 = exports2.splitOscString(buffer, strict), types = ref1.string, buffer = ref1.rest;
        if (types[0] !== ",") {
          if (strict) {
            throw StrictError("Argument lists must begin with ,");
          }
          return {
            address,
            args: []
          };
        }
        types = types.slice(1, +types.length + 1 || 9e9);
        args = [];
        arrayStack = [args];
        for (j = 0, len = types.length; j < len; j++) {
          type = types[j];
          if (type === "[") {
            arrayStack.push([]);
            continue;
          }
          if (type === "]") {
            if (arrayStack.length <= 1) {
              if (strict) {
                throw new StrictError("Mismatched ']' character.");
              }
            } else {
              built = arrayStack.pop();
              arrayStack[arrayStack.length - 1].push({
                type: "array",
                value: built
              });
            }
            continue;
          }
          typeString = exports2.oscTypeCodeToTypeString(type);
          if (typeString == null) {
            throw new Error("I don't understand the argument code " + type);
          }
          arg = exports2.splitOscArgument(buffer, typeString, strict);
          if (arg != null) {
            buffer = arg.rest;
          }
          arrayStack[arrayStack.length - 1].push({
            type: typeString,
            value: arg != null ? arg.value : void 0
          });
        }
        if (arrayStack.length !== 1 && strict) {
          throw new StrictError("Mismatched '[' character");
        }
        return {
          address,
          args,
          oscType: "message"
        };
      };
      exports2.fromOscBundle = function(buffer, strict) {
        var bundleTag, convertedElems, ref, ref1, timetag;
        ref = exports2.splitOscString(buffer, strict), bundleTag = ref.string, buffer = ref.rest;
        if (bundleTag !== "#bundle") {
          throw new Error("osc-bundles must begin with #bundle");
        }
        ref1 = exports2.splitTimetag(buffer), timetag = ref1.timetag, buffer = ref1.rest;
        convertedElems = mapBundleList(buffer, function(buffer2) {
          return exports2.fromOscPacket(buffer2, strict);
        });
        return {
          timetag,
          elements: convertedElems,
          oscType: "bundle"
        };
      };
      exports2.fromOscPacket = function(buffer, strict) {
        if (isOscBundleBuffer(buffer, strict)) {
          return exports2.fromOscBundle(buffer, strict);
        } else {
          return exports2.fromOscMessage(buffer, strict);
        }
      };
      getArrayArg = function(arg) {
        if (IsArray(arg)) {
          return arg;
        } else if ((arg != null ? arg.type : void 0) === "array" && IsArray(arg != null ? arg.value : void 0)) {
          return arg.value;
        } else if (arg != null && arg.type == null && IsArray(arg.value)) {
          return arg.value;
        } else {
          return null;
        }
      };
      toOscTypeAndArgs = function(argList, strict) {
        var arg, buff, j, len, oscargs, osctype, ref, thisArgs, thisType, typeCode, value;
        osctype = "";
        oscargs = [];
        for (j = 0, len = argList.length; j < len; j++) {
          arg = argList[j];
          if (getArrayArg(arg) != null) {
            ref = toOscTypeAndArgs(getArrayArg(arg), strict), thisType = ref[0], thisArgs = ref[1];
            osctype += "[" + thisType + "]";
            oscargs = oscargs.concat(thisArgs);
            continue;
          }
          typeCode = exports2.argToTypeCode(arg, strict);
          if (typeCode != null) {
            value = arg != null ? arg.value : void 0;
            if (value === void 0) {
              value = arg;
            }
            buff = exports2.toOscArgument(value, exports2.oscTypeCodeToTypeString(typeCode), strict);
            if (buff != null) {
              oscargs.push(buff);
              osctype += typeCode;
            }
          }
        }
        return [osctype, oscargs];
      };
      exports2.toOscMessage = function(message, strict) {
        var address, allArgs, args, old_arg, oscaddr, oscargs, osctype, ref;
        address = (message != null ? message.address : void 0) != null ? message.address : message;
        if (typeof address !== "string") {
          throw new Error("message must contain an address");
        }
        args = message != null ? message.args : void 0;
        if (args === void 0) {
          args = [];
        }
        if (!IsArray(args)) {
          old_arg = args;
          args = [];
          args[0] = old_arg;
        }
        oscaddr = exports2.toOscString(address, strict);
        ref = toOscTypeAndArgs(args, strict), osctype = ref[0], oscargs = ref[1];
        osctype = "," + osctype;
        allArgs = exports2.concat(oscargs);
        osctype = exports2.toOscString(osctype);
        return exports2.concat([oscaddr, osctype, allArgs]);
      };
      exports2.toOscBundle = function(bundle, strict) {
        var allElems, buff, e, elem, elements, elemstr, j, len, oscBundleTag, oscElems, oscTimeTag, ref, ref1, size, timetag;
        if (strict && (bundle != null ? bundle.timetag : void 0) == null) {
          throw StrictError("bundles must have timetags.");
        }
        timetag = (ref = bundle != null ? bundle.timetag : void 0) != null ? ref : /* @__PURE__ */ new Date();
        elements = (ref1 = bundle != null ? bundle.elements : void 0) != null ? ref1 : [];
        if (!IsArray(elements)) {
          elemstr = elements;
          elements = [];
          elements.push(elemstr);
        }
        oscBundleTag = exports2.toOscString("#bundle");
        oscTimeTag = exports2.toTimetagBuffer(timetag);
        oscElems = [];
        for (j = 0, len = elements.length; j < len; j++) {
          elem = elements[j];
          try {
            buff = exports2.toOscPacket(elem, strict);
            size = exports2.toIntegerBuffer(buff.length);
            oscElems.push(exports2.concat([size, buff]));
          } catch (error) {
            e = error;
            null;
          }
        }
        allElems = exports2.concat(oscElems);
        return exports2.concat([oscBundleTag, oscTimeTag, allElems]);
      };
      exports2.toOscPacket = function(bundleOrMessage, strict) {
        if ((bundleOrMessage != null ? bundleOrMessage.oscType : void 0) != null) {
          if (bundleOrMessage.oscType === "bundle") {
            return exports2.toOscBundle(bundleOrMessage, strict);
          }
          return exports2.toOscMessage(bundleOrMessage, strict);
        }
        if ((bundleOrMessage != null ? bundleOrMessage.timetag : void 0) != null || (bundleOrMessage != null ? bundleOrMessage.elements : void 0) != null) {
          return exports2.toOscBundle(bundleOrMessage, strict);
        }
        return exports2.toOscMessage(bundleOrMessage, strict);
      };
      exports2.applyMessageTranformerToBundle = function(transform) {
        return function(buffer) {
          var bundleTagBuffer, copyIndex, elem, elems, j, k, len, len1, lengthBuff, outBuffer, ref, string, timetagBuffer, totalLength;
          ref = exports2.splitOscString(buffer), string = ref.string, buffer = ref.rest;
          if (string !== "#bundle") {
            throw new Error("osc-bundles must begin with #bundle");
          }
          bundleTagBuffer = exports2.toOscString(string);
          timetagBuffer = buffer.slice(0, 8);
          buffer = buffer.slice(8, buffer.length);
          elems = mapBundleList(buffer, function(buffer2) {
            return exports2.applyTransform(buffer2, transform, exports2.applyMessageTranformerToBundle(transform));
          });
          totalLength = bundleTagBuffer.length + timetagBuffer.length;
          for (j = 0, len = elems.length; j < len; j++) {
            elem = elems[j];
            totalLength += 4 + elem.length;
          }
          outBuffer = new Buffer(totalLength);
          bundleTagBuffer.copy(outBuffer, 0);
          timetagBuffer.copy(outBuffer, bundleTagBuffer.length);
          copyIndex = bundleTagBuffer.length + timetagBuffer.length;
          for (k = 0, len1 = elems.length; k < len1; k++) {
            elem = elems[k];
            lengthBuff = exports2.toIntegerBuffer(elem.length);
            lengthBuff.copy(outBuffer, copyIndex);
            copyIndex += 4;
            elem.copy(outBuffer, copyIndex);
            copyIndex += elem.length;
          }
          return outBuffer;
        };
      };
      exports2.applyTransform = function(buffer, mTransform, bundleTransform) {
        if (bundleTransform == null) {
          bundleTransform = exports2.applyMessageTranformerToBundle(mTransform);
        }
        if (isOscBundleBuffer(buffer)) {
          return bundleTransform(buffer);
        } else {
          return mTransform(buffer);
        }
      };
      exports2.addressTransform = function(transform) {
        return function(buffer) {
          var ref, rest, string;
          ref = exports2.splitOscString(buffer), string = ref.string, rest = ref.rest;
          string = transform(string);
          return exports2.concat([exports2.toOscString(string), rest]);
        };
      };
      exports2.messageTransform = function(transform) {
        return function(buffer) {
          var message;
          message = exports2.fromOscMessage(buffer);
          return exports2.toOscMessage(transform(message));
        };
      };
      IsArray = Array.isArray;
      StrictError = function(str) {
        return new Error("Strict Error: " + str);
      };
      padding = function(str) {
        var bufflength;
        bufflength = Buffer.byteLength(str);
        return 4 - bufflength % 4;
      };
      isOscBundleBuffer = function(buffer, strict) {
        var string;
        string = exports2.splitOscString(buffer, strict).string;
        return string === "#bundle";
      };
      mapBundleList = function(buffer, func) {
        var e, elem, elems, j, len, nonNullElems, size, thisElemBuffer;
        elems = function() {
          var ref, results;
          results = [];
          while (buffer.length) {
            ref = exports2.splitInteger(buffer), size = ref.integer, buffer = ref.rest;
            if (size > buffer.length) {
              throw new Error("Invalid bundle list: size of element is bigger than buffer");
            }
            thisElemBuffer = buffer.slice(0, size);
            buffer = buffer.slice(size, buffer.length);
            try {
              results.push(func(thisElemBuffer));
            } catch (error) {
              e = error;
              results.push(null);
            }
          }
          return results;
        }();
        nonNullElems = [];
        for (j = 0, len = elems.length; j < len; j++) {
          elem = elems[j];
          if (elem != null) {
            nonNullElems.push(elem);
          }
        }
        return nonNullElems;
      };
    }).call(exports2);
  }
});

// node_modules/osc-min/lib/index.js
var require_lib = __commonJS({
  "node_modules/osc-min/lib/index.js"(exports2) {
    (function() {
      var utils, coffee;
      utils = require_osc_utilities();
      exports2.fromBuffer = function(buffer, strict) {
        if (buffer instanceof ArrayBuffer) {
          buffer = new Buffer(new Uint8Array(buffer));
        } else if (buffer instanceof Uint8Array) {
          buffer = new Buffer(buffer);
        }
        return utils.fromOscPacket(buffer, strict);
      };
      exports2.toBuffer = function(object, strict, opt) {
        if (typeof object === "string")
          return utils.toOscPacket({ "address": object, "args": strict }, opt);
        return utils.toOscPacket(object, strict);
      };
      exports2.applyAddressTransform = function(buffer, transform) {
        return utils.applyTransform(buffer, utils.addressTransform(transform));
      };
      exports2.applyMessageTransform = function(buffer, transform) {
        return utils.applyTransform(buffer, utils.messageTransform(transform));
      };
      exports2.timetagToDate = utils.timetagToDate;
      exports2.dateToTimetag = utils.dateToTimetag;
      exports2.timetagToTimestamp = utils.timetagToTimestamp;
      exports2.timestampToTimetag = utils.timestampToTimetag;
    }).call(exports2);
  }
});

// src/main.ts
var import_max_api2 = __toESM(require("max-api"));

// node_modules/node-osc/lib/Message.mjs
var typeTags = {
  s: "string",
  f: "float",
  i: "integer",
  b: "blob"
};
var Argument = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
};
var Message = class {
  constructor(address, ...args) {
    this.oscType = "message";
    this.address = address;
    this.args = args;
  }
  append(arg) {
    let argOut;
    switch (typeof arg) {
      case "object":
        if (arg instanceof Array) {
          arg.forEach((a) => this.append(a));
        } else if (arg.type) {
          if (typeTags[arg.type])
            arg.type = typeTags[arg.type];
          this.args.push(arg);
        } else {
          throw new Error(`don't know how to encode object ${arg}`);
        }
        break;
      case "number":
        if (Math.floor(arg) === arg) {
          argOut = new Argument("integer", arg);
        } else {
          argOut = new Argument("float", arg);
        }
        break;
      case "string":
        argOut = new Argument("string", arg);
        break;
      case "boolean":
        argOut = new Argument("boolean", arg);
        break;
      default:
        throw new Error(`don't know how to encode ${arg}`);
    }
    if (argOut)
      this.args.push(argOut);
  }
};
var Message_default = Message;

// node_modules/node-osc/lib/Server.mjs
var import_node_dgram = require("node:dgram");
var import_node_events = require("node:events");

// node_modules/node-osc/lib/internal/decode.mjs
var import_osc_min = __toESM(require_lib(), 1);
function sanitizeMessage(decoded) {
  const message = [];
  message.push(decoded.address);
  decoded.args.forEach((arg) => {
    message.push(arg.value);
  });
  return message;
}
function sanitizeBundle(decoded) {
  decoded.elements = decoded.elements.map((element) => {
    if (element.oscType === "bundle")
      return sanitizeBundle(element);
    else if (element.oscType === "message")
      return sanitizeMessage(element);
  });
  return decoded;
}
function decode(data) {
  const decoded = (0, import_osc_min.fromBuffer)(data);
  if (decoded.oscType === "bundle") {
    return sanitizeBundle(decoded);
  } else if (decoded.oscType === "message") {
    return sanitizeMessage(decoded);
  } else {
    throw new Error("Malformed Packet");
  }
}
var decode_default = decode;

// node_modules/node-osc/lib/Server.mjs
var Server = class extends import_node_events.EventEmitter {
  constructor(port, host = "127.0.0.1", cb) {
    super();
    if (typeof host === "function") {
      cb = host;
      host = "127.0.0.1";
    }
    if (!cb)
      cb = () => {
      };
    let decoded;
    this.port = port;
    this.host = host;
    this._sock = (0, import_node_dgram.createSocket)({
      type: "udp4",
      reuseAddr: true
    });
    this._sock.bind(port, host);
    this._sock.on("listening", () => {
      this.emit("listening");
      cb();
    });
    this._sock.on("message", (msg, rinfo) => {
      try {
        decoded = decode_default(msg);
      } catch (e) {
        const error = new Error(`can't decode incoming message: ${e.message}`);
        this.emit("error", error, rinfo);
        return;
      }
      if (decoded.elements) {
        this.emit("bundle", decoded, rinfo);
      } else if (decoded) {
        this.emit("message", decoded, rinfo);
        this.emit(decoded[0], decoded, rinfo);
      }
    });
  }
  close(cb) {
    this._sock.close(cb);
  }
};
var Server_default = Server;

// node_modules/node-osc/lib/Client.mjs
var import_node_dgram2 = require("node:dgram");
var import_osc_min2 = __toESM(require_lib(), 1);
var { toBuffer } = import_osc_min2.default;
var Client = class {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this._sock = (0, import_node_dgram2.createSocket)({
      type: "udp4",
      reuseAddr: true
    });
  }
  close(cb) {
    this._sock.close(cb);
  }
  send(...args) {
    let message = args[0];
    let callback;
    if (typeof args[args.length - 1] === "function") {
      callback = args.pop();
    } else {
      callback = () => {
      };
    }
    if (message instanceof Array) {
      message = {
        address: message[0],
        args: message.splice(1)
      };
    }
    let mes;
    let buf;
    try {
      switch (typeof message) {
        case "object":
          buf = toBuffer(message);
          this._sock.send(buf, 0, buf.length, this.port, this.host, callback);
          break;
        case "string":
          mes = new Message_default(args[0]);
          for (let i = 1; i < args.length; i++) {
            mes.append(args[i]);
          }
          buf = toBuffer(mes);
          this._sock.send(buf, 0, buf.length, this.port, this.host, callback);
          break;
        default:
          throw new TypeError("That Message Just Doesn't Seem Right");
      }
    } catch (e) {
      if (e.code !== "ERR_SOCKET_DGRAM_NOT_RUNNING")
        throw e;
      const error = new ReferenceError("Cannot send message on closed socket.");
      error.code = e.code;
      callback(error);
    }
  }
};
var Client_default = Client;

// src/ableton.ts
var import_max_api = __toESM(require("max-api"));
var Ableton = class {
  constructor() {
    this.client = new Client_default("127.0.0.1", 11e3);
    this.server = new Server_default(11001, "0.0.0.0");
  }
  async send(address, message = "") {
    this.client.send(new Message_default(address, message), (err) => {
      console.error(err);
    });
  }
  async receive(address) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject("Timeout"), 1e3);
      this.server.on("message", (msg, rinfo) => {
        if (rinfo.address === address) {
          clearTimeout(timeout);
          import_max_api.default.post(`Message: ${msg} from ${rinfo.address}:${rinfo.port}`);
          resolve(msg);
        }
      });
    });
  }
  async test() {
    const addr = "/live/test";
    await this.send(addr);
    const msg = await this.receive(addr);
    console.log(msg);
  }
};

// src/main.ts
import_max_api2.default.post("Hello from TypeScript");
var ableton = new Ableton();
import_max_api2.default.addHandlers({
  test() {
    import_max_api2.default.post("Testing Ableton");
    ableton.test().catch((err) => {
      if (err instanceof Error) {
        import_max_api2.default.post(err.message, import_max_api2.default.POST_LEVELS.ERROR);
      }
    });
  }
});
