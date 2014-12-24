'use strict';

module.exports = function (math) {
  var util = require('../../util/index'),

      BigNumber = math.type.BigNumber,
      Complex = require('../../type/Complex'),
      Unit = require('../../type/Unit'),
      collection = require('../../type/collection'),

      isComplex = Complex.isComplex,
      isUnit = Unit.isUnit,
      isCollection = collection.isCollection;

  /**
   * Test whether two values are both defined with a nonzero/nonempty value.
   *
   * Syntax:
   *
   *    math.xor(x, y)
   *
   * Examples:
   *
   *    math.xor(2, 4);   // returns false
   *
   *    a = [2, 5, 1];
   *    b = [2, 7, 1];
   *    c = 0;
   *
   *    math.xor(a, b);   // returns false
   *    math.xor(a, c);   // returns true
   *
   * See also:
   *
   *    and, not, or
   *
   * @param  {Number | BigNumber | Boolean | Complex | Unit | String | Array | Matrix | null | undefined} x First value to check
   * @param  {Number | BigNumber | Boolean | Complex | Unit | String | Array | Matrix | null | undefined} y Second value to check
   * @return {Boolean}
   *            Returns true when one input is defined with a nonzero/nonempty value.
   */
  math.xor = function xor(x, y) {
    if (arguments.length != 2) {
      throw new math.error.ArgumentsError('xor', arguments.length, 2);
    }

    if (isComplex(x)) {
      return xor(!(x.re == 0 && x.im == 0), y);
    }
    if (isComplex(y)) {
      return xor(x, !(y.re == 0 && y.im == 0));
    }

    if (x instanceof BigNumber) {
      return xor(!(x.isZero() || x.isNaN()), y);
    }
    if (y instanceof BigNumber) {
      return xor(x, !(y.isZero() || y.isNaN()));
    }

    if (isUnit(x)) {
      return xor(!(x.value === null || x.value == 0), y);
    }
    if (isUnit(y)) {
      return xor(x, !(y.value === null || y.value == 0));
    }

    if (isCollection(x)) {
      return xor(!(x.length == 0 || (x.size && x.size() == 0)), y);
    }
    if (isCollection(y)) {
      return xor(x, !(y.length == 0 || (y.size && y.size() == 0)));
    }

    return !!(!!x ^ !!y);
  };
};
