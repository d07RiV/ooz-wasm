'use strict'

var oozModule = require('./build/ooz.js');

var OOZ_SAFE_SPACE = 64;

var module_ = null;

function load () {
  if (!module_) {
    module_ = oozModule();
  }
  return module_;
}

/**
 * @param {Uint8Array} data 
 * @param {number} rawSize 
 * @param {function} callback
 * @returns {Promise<ReturnType<callback>>}
 */
function decompressCallback (data, rawSize, callback) {
  return load().then(module => {
    var compressedPtr = module._malloc(data.byteLength);
    module.HEAPU8.set(data, compressedPtr);

    var decompressedPtr = module._malloc(rawSize + OOZ_SAFE_SPACE);

    var res = module._Kraken_Decompress(
      compressedPtr, data.byteLength,
      decompressedPtr, rawSize
    );

    module._free(compressedPtr);

    if (res < 0) {
      throw new Error('Failed to decode');
    }
    if (res !== rawSize) {
      throw new Error('Decompresed size is different from expected');
    }

    var slice = module.HEAPU8.subarray(decompressedPtr, decompressedPtr + rawSize);
    var result = callback(slice);

    module._free(decompressedPtr);

    return result;
  })
}

/**
 * @param {Uint8Array} data 
 * @param {number} rawSize 
 * @returns {Promise<Uint8Array>}
 */
function decompress (data, rawSize) {
  return decompressCallback(data, rawSize, (decompressed) => decompressed.slice());
}

exports.load = load;
exports.decompressCallback = decompressCallback;
exports.decompress = decompress;
