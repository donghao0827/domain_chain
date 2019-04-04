const { BN, BNObject } = require("bn.js");
const { Buffer } = require('buffer');
const elliptic = require('elliptic');
const { EDDSA } = require('./constant');
const { B, Point } = require('./utils');

export function OS2ECP(os: Buffer) {
  const b = elliptic.utils.toArray(os, 16);
  try {
    return EDDSA.decodePoint(b) as Point;
  } catch (e) {
  }
  return null;
}

export function ECP2OS(P: Point) {
  return S2OS(EDDSA.encodePoint(P));
}

export function S2OS(os: number[]) {
  const sign = os[31] >>> 7;
  os.unshift(sign + 2);
  return B(os);
}

export function OS2IP(os: Buffer) {
  return new BN(os);
}

export function I2OSP(i: BNObject, len?: number) {
  return B(i.toArray('be', len));
}