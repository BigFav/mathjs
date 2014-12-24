// test xor
var assert = require('assert'),
    math = require('../../../index'),
    error = require('../../../lib/error/index'),
    bignumber = math.bignumber,
    complex = math.complex,
    matrix = math.matrix,
    unit = math.unit,
    xor = math.xor;

describe('xor', function () {

  it('should xor two numbers correctly', function () {
    assert.equal(xor(1, 1), false);
    assert.equal(xor(-1, 1), false);
    assert.equal(xor(-1, -1), false);
    assert.equal(xor(0, -1), true);
    assert.equal(xor(1, 0), true);
    assert.equal(xor(1, NaN), true);
    assert.equal(xor(NaN, 1), true);
    assert.equal(xor(1e10, 0.019209), false);
    assert.equal(xor(-1.0e-100, 1.0e-100), false);
    assert.equal(xor(Infinity, -Infinity), false);
    assert.equal(xor(NaN, NaN), false);
    assert.equal(xor(NaN, 0), false);
    assert.equal(xor(0, NaN), false);
    assert.equal(xor(0, 0), false);
  });

  it('should xor two complex numbers', function () {
    assert.equal(xor(complex(1, 1), complex(1, 1)), false);
    assert.equal(xor(complex(0, 1), complex(1, 1)), false);
    assert.equal(xor(complex(1, 0), complex(1, 1)), false);
    assert.equal(xor(complex(1, 1), complex(0, 1)), false);
    assert.equal(xor(complex(1, 1), complex(1, 0)), false);
    assert.equal(xor(complex(1, 0), complex(1, 0)), false);
    assert.equal(xor(complex(0, 1), complex(0, 1)), false);
    assert.equal(xor(complex(0, 0), complex(1, 1)), true);
    assert.equal(xor(complex(0, 0), complex(0, 1)), true);
    assert.equal(xor(complex(0, 0), complex(1, 0)), true);
    assert.equal(xor(complex(1, 1), complex(0, 0)), true);
    assert.equal(xor(complex(0, 1), complex(0, 0)), true);
    assert.equal(xor(complex(1, 0), complex(0, 0)), true);
    assert.equal(xor(complex(), complex(1, 1)), true);
    assert.equal(xor(complex(0), complex(1, 1)), true);
    assert.equal(xor(complex(1), complex(1, 1)), false);
    assert.equal(xor(complex(1, 1), complex()), true);
    assert.equal(xor(complex(1, 1), complex(0)), true);
    assert.equal(xor(complex(1, 1), complex(1)), false);
    assert.equal(xor(complex(0, 0), complex(0, 0)), false);
    assert.equal(xor(complex(), complex()), false);
  });

  it('should xor mixed numbers and complex numbers', function () {
    assert.equal(xor(complex(1, 1), 1), false);
    assert.equal(xor(complex(1, 1), 0), true);
    assert.equal(xor(1, complex(1, 1)), false);
    assert.equal(xor(0, complex(1, 1)), true);
    assert.equal(xor(complex(0, 0), 1), true);
    assert.equal(xor(1, complex(0, 0)), true);
    assert.equal(xor(0, complex(0, 0)), false);
    assert.equal(xor(complex(0, 0), 0), false);
  });

  it('should xor two booleans', function () {
    assert.equal(xor(true, true), false);
    assert.equal(xor(true, false), true);
    assert.equal(xor(false, true), true);
    assert.equal(xor(false, false), false);
  });

  it('should xor mixed numbers and booleans', function () {
    assert.equal(xor(2, true), false);
    assert.equal(xor(2, false), true);
    assert.equal(xor(0, true), true);
    assert.equal(xor(true, 2), false);
    assert.equal(xor(false, 2), true);
    assert.equal(xor(false, 0), false);
  });

  it('should xor mixed numbers and null', function () {
    assert.equal(xor(2, null), true);
    assert.equal(xor(null, 2), true);
  });

  it('should xor mixed numbers and undefined', function () {
    assert.equal(xor(2, undefined), true);
    assert.equal(xor(undefined, 2), true);
    assert.equal(xor(null, null), false);
  });

  it('should xor bignumbers', function () {
    assert.equal(xor(bignumber(1), bignumber(1)), false);
    assert.equal(xor(bignumber(-1), bignumber(1)), false);
    assert.equal(xor(bignumber(-1), bignumber(-1)), false);
    assert.equal(xor(bignumber(0), bignumber(-1)), true);
    assert.equal(xor(bignumber(1), bignumber(0)), true);
    assert.equal(xor(bignumber(1), bignumber(NaN)), true);
    assert.equal(xor(bignumber(NaN), bignumber(1)), true);
    assert.equal(xor(bignumber('1e+10'), bignumber(0.19209)), false);
    assert.equal(xor(bignumber('-1.0e-400'), bignumber('1.0e-400')), false);
    assert.equal(xor(bignumber(Infinity), bignumber(-Infinity)), false);
    assert.equal(xor(bignumber(NaN), bignumber(NaN)), false);
    assert.equal(xor(bignumber(NaN), bignumber(0)), false);
    assert.equal(xor(bignumber(0), bignumber(NaN)), false);
    assert.equal(xor(bignumber(0), bignumber(0)), false);
  });

  it('should xor mixed numbers and bignumbers', function () {
    assert.equal(xor(bignumber(2), 3), false);
    assert.equal(xor(2, bignumber(2)), false);
    assert.equal(xor(0, bignumber(2)), true);
    assert.equal(xor(2, bignumber(0)), true);
    assert.equal(xor(bignumber(0), 2), true);
    assert.equal(xor(bignumber(2), 0), true);
    assert.equal(xor(bignumber(0), 0), false);
  });

  it('should xor two units', function () {
    assert.equal(xor(unit('100cm'), unit('10inch')), false);
    assert.equal(xor(unit('100cm'), unit('0 inch')), true);
    assert.equal(xor(unit('0cm'), unit('1m')), true);
    assert.equal(xor(unit('m'), unit('1m')), true);
    assert.equal(xor(unit('1dm'), unit('m')), true);
    assert.equal(xor(unit('-100cm'), unit('-10inch')), false);
    assert.equal(xor(unit(5, 'km'), unit(100, 'gram')), false);
    assert.equal(xor(unit(5, 'km'), unit(0, 'gram')), true);
    assert.equal(xor(unit(0, 'km'), unit(100, 'gram')), true);
    assert.equal(xor(unit(0, 'km'), unit(0, 'gram')), false);
  });

  it('should xor mixed numbers and units', function () {
    assert.equal(xor(unit('2m'), 3), false);
    assert.equal(xor(2, unit('3m')), false);
    assert.equal(xor(0, unit('2m')), true);
    assert.equal(xor(2, unit('0m')), true);
    assert.equal(xor(unit('0in'), 2), true);
    assert.equal(xor(unit('2in'), 0), true);
    assert.equal(xor(unit('0in'), 0), false);
  });

  it('should xor two strings', function () {
    assert.equal(xor('0', 'NaN'), false);

    assert.equal(xor('abd', ' '), false);
    assert.equal(xor('abc', ''), true);
    assert.equal(xor('', 'abd'), true);
    assert.equal(xor('', ''), false);
  });

  it('should xor mixed numbers and strings', function () {
    assert.equal(xor(1, 'NaN'), false);
    assert.equal(xor('abd', 1), false);
    assert.equal(xor(1, ''), true);
    assert.equal(xor('', 1), true);
    assert.equal(xor('', 0), false);
    assert.equal(xor(0, ''), false);
  });

  it('should xor two arrays', function () {
    assert.equal(xor([0], [0, 0, 0]), false);
    assert.equal(xor([], [0, 0, 0]), true);
    assert.equal(xor(['A', 'B', 'C'], []), true);
    assert.equal(xor([], []), false);
    assert.equal(xor([[]], [[]]), false);
    assert.equal(xor([[[]]], [[]]), false);
  });

  it('should xor mixed numbers and arrays', function () {
    assert.equal(xor(1, [0, 0, 0]), false);
    assert.equal(xor([0], 1), false);
    assert.equal(xor(0, [0, 0, 0]), true);
    assert.equal(xor(['A', 'B', 'C'], 0), true);
    assert.equal(xor(1, []), true);
    assert.equal(xor([[]], 1), false);
    assert.equal(xor([[], []], 1), false);
    assert.equal(xor(0, []), false);
    assert.equal(xor([], 0), false);
  });

  it('should xor two matrices', function () {
    assert.equal(xor(matrix([0]), matrix([0, 0, 0])), false);
    assert.equal(xor(matrix([]), matrix([0, 0, 0])), true);
    assert.equal(xor(matrix(['A', 'B', 'C']), matrix([])), true);
    assert.equal(xor(matrix([]), matrix([])), false);
    assert.equal(xor(matrix([]), matrix([[]])), true);
    assert.equal(xor(matrix([[]]), matrix([[]])), false);
    assert.equal(xor(matrix([[[]]]), matrix([[]])), false);
  });

  it('should xor mixed numbers and matrices', function () {
    assert.equal(xor(1, matrix([0, 0, 0])), false);
    assert.equal(xor(matrix([0]), 1), false);
    assert.equal(xor(0, matrix([0, 0, 0])), true);
    assert.equal(xor(matrix(['A', 'B', 'C']), 0), true);
    assert.equal(xor(1, matrix([])), true);
    assert.equal(xor(matrix([]), 1), true);
    assert.equal(xor(matrix([[]]), 1), false);
    assert.equal(xor(matrix([[], []]), 1), false);
    assert.equal(xor(0, matrix([])), false);
    assert.equal(xor(matrix([]), 0), false);
  });

  it('should xor two objects', function () {
    assert.equal(xor(new Date(), new Date()), false);
  });

  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {xor(1)}, error.ArgumentsError);
    assert.throws(function () {xor(1, 2, 3)}, error.ArgumentsError);
  });

});
