'use strict'
var util = require('./util')
var BN = require('ethereumjs-util').BN
var RefType = require('./RefType')

class DynamicByteArray extends RefType {
  constructor (location) {
    super(1, 32, 'bytes', location)
  }

  decodeFromStorage (location, storageContent) {
    var value = util.extractHexValue(location, storageContent, this.storageBytes)
    var bn = new BN(value, 16)
    if (bn.testn(0)) {
      var length = bn.div(new BN(2))
      var dataPos = new BN(util.sha3(location.slot).replace('0x', ''), 16)
      var ret = ''
      var currentSlot = util.readFromStorage(dataPos, storageContent)
      while (length.gt(ret.length) && ret.length < 32000) {
        currentSlot = currentSlot.replace('0x', '')
        ret += currentSlot
        dataPos = dataPos.add(new BN(1))
        currentSlot = util.readFromStorage(dataPos, storageContent)
      }
      return {
        value: '0x' + ret.replace(/(00)+$/, ''),
        length: '0x' + length.toString(16),
        type: this.typeName
      }
    } else {
      var size = parseInt(value.substr(value.length - 2, 2), 16) / 2
      return {
        value: '0x' + value.substr(0, size * 2),
        length: '0x' + size.toString(16),
        type: this.typeName
      }
    }
  }

  decodeFromMemoryInternal (offset, memory) {
    offset = 2 * offset
    var length = memory.substr(offset, 64)
    length = 2 * parseInt(length, 16)
    return {
      length: '0x' + length.toString(16),
      value: '0x' + memory.substr(offset + 64, length),
      type: this.typeName
    }
  }
}

module.exports = DynamicByteArray
