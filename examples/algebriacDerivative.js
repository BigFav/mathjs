var math = require('../index');

function constTag(node, varName) {
  if (node.type == 'ConstantNode') {
    return node.isConst = true;
  }
  if (node.type == 'SymbolNode') {
    return node.isConst = (node.name == varName);
  }
  if (node.args) {
    node.isConst = constTag(node.args[0]);
    if (node.args.length == 1) {
      return node.isConst;
    }
    if (node.args.length == 2) {
      return node.isConst = constTag(node.args[1]) && node.isConst;
    }

    for (var i = 1; i < node.args.length; ++i) {
      node.isConst = constTag(node.args[i]) && node.isConst;
    }
    return node.isConst;
  }

  throw new Error('Node type "' + node.type + '" not captured');
}

function derivative(node, dvar) {
  if (node.isConst) {
    return {value: '0', valueType: node.valueType, isConst: true};
  }

  if (node.type == 'SymbolNode') {
    return {value: '1', valueType: node.valueType, isConst: true};
  }
  if (node.type == 'FunctionNode') {
    var arg1 = node.args[0];
    switch (node.name) {
      case 'log':
        // Should I sanity check args in general?
        if (!node.args || node.args.length > 2) {
          return node;
        }

        /* d/dx(log(x))     = 1 / x
         * d/dx(log(x, c)) = 1 / (x*ln(c)) */
        var newArg2 = (node.args.length == 1)
          ? arg1
          : {op: '*', fn: 'multiply',
             args: [arg1, {name: 'log', args: [node.args[1]]}]};

        return {
          op: '/',
          fn: 'divide',
          args: [derivative(arg1), newArg2]
        };
      case 'exp':
        // d/dx(e^x) = e^x
        return {
          op: '*',
          fn: 'multiply',
          args: [derivative(arg1), arg1.clone()]
        };
      case 'sin':
        // d/dx(sin(x)) = cos(x)
        return {
          op: '*',
          fn: 'multiply',
          args: [derivative(arg1), {name: 'cos', args: [arg1.clone()]}]
        };
      case 'cos':
      case 'tan':
      case 'sec':
      case 'csc':
      case 'cot':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'asec':
      case 'acsc':
      case 'acot':
      case 'sinh':
      case 'cosh':
      case 'tanh':
      case 'sech':
      case 'csch':
      case 'coth':
      case 'asinh':
      case 'acosh':
      case 'atanh':
      case 'asech':
      case 'acsch':
      case 'acoth':
      default: throw new Error('Derivative of ' + node.name + ' not supported');
    }
  }
  if (node.type == 'OperatorNode') {
    var arg1 = node.args[0];
    var arg2 = node.args[1];

    switch (node.op) {
      case '^':
        if (arg2.isConst) {
          var expValue = arg2.value;
          if (arg2.type == 'ConstantNode') {
            // If is secretly constant; f(x)^0 = 1 -> d/dx(1) = 0
            if (expValue == '0') {
              return {value: '0', valueType: arg2.valueType, isConst: true};
            }
            // Ignore exponent; f(x)^1 = f(x)
            if (expValue == '1') {
              return derivative(arg1);
            }
          }

          // Elementary Power Rule, d/dx(f(x)^c) = c*f'(x)*f(x)^(c-1)
          var newArg2 = {
            op: node.op,
            fn: node.fn,
            args: [arg1, {
              op: '-',
              fn: 'subtract',
              args: [arg2, {value: '1', valueType: arg2.valueType}]
            }]
          };

          return {
            op: '*',
            fn: 'multiply',
            args: [arg2.clone(), newArg2]
          };
        }

        // d/dx(f^g) = f^g*[f'*(g/f) + g'ln(f)]
        throw new Error('Functional Power rule not supported yet');
      case '*':
        if (!arg1.isConst && !arg2.isConst) {
          throw new Error('Product rule not supported yet');
        }

        // d/dx(c*f(x)) = c*f'(x)
        return {
          op: '*',
          fn: 'multiply',
          args: arg1.isConst
            ? [arg1.clone(), derivative(arg2)]
            : [arg2.clone(), derivative(arg1)]
        };
      case '/':
        if (!arg1.isConst && !arg2.isConst) {
          throw new Error('Quotient rule not supported yet');
        }

        // Reciprocal Rule, d/dx(c / f(x)) = -c(f'(x)/f(x)^2)
        if (arg1.isConst) {
          return {
            op: '*',
            fn: 'multiply',
            args: [
              {op: '-', fn: 'unaryMinus', args: [arg1]},
              {
                op: '/',
                fn: 'divide',
                args: [derivative(arg2),
                  {op: '^', fn: 'pow', args: [arg2.clone(), {value: '2', valueType: 'number'}]}
                ]
              }
            ]
          };
        }

        // d/dx(f(x) / c) = f'(x) / c
        return {
          op: '/',
          fn: 'divide',
          args: [derivative(arg1), arg2]
        };
      case '-':
      case '+':
        if (node.args == 1) {
          return {
            op: node.op,
            fn: node.fn,
            args: [derivative(arg1)]
          };
        }

        // Linearity of differentiation, d/dx(f(x) +/- g(x)) = f'(x) +/- g'(x)
        return {
          op: node.op,
          fn: node.fn,
          args: [derivative(arg1), derivative(arg2)]
        };
      default: throw new Error('Operator ' + node.op + ' not supported');
    }
  }

  throw new Error('Node Type Swegg');
}

/**
 * A transformation for the derivative function. This transformation will be
 * invoked when the function is used via the expression parser of math.js.
 *
 * Syntax:
 *
 *     derivative(expr, variable)
 *
 * Usage:
 *
 *     math.eval('derivative(2*x, x)')
 *
 * @param {Array.<math.expression.node.Node>} args
 *            Expects the following arguments: [f, x]
 * @param {Object} math
 * @param {Object} [scope]
 */
derivative.transform = function (args, math, scope) {
  if (args.length != 2) {
    throw new Error('Expects 2 arguments');
  }

  // determine the variable name
  if (args[1] instanceof math.expression.node.SymbolNode) {
    var variable = args[1].name;
  }
  else {
    throw new Error('Second argument must be a symbol');
  }

  constTag(args[0], variable);
  return derivative(args[0], variable);
};

// mark the transform function with a "rawArgs" property, so it will be called
// with uncompiled, unevaluated arguments.
derivative.transform.rawArgs = true;

// import the function into math.js. Raw functions must be imported in the
// math namespace, they can't be used via `eval(scope)`.
math.import({
  derivative: derivative
});

// use the function via the expression parser
console.log(math.eval('derivative(-x, x)'));
console.log(math.eval('derivative(x^2 + 2, x)'));
console.log(math.eval('derivative(log(3x^2 + 2, 2), x)'));
console.log(math.eval('derivative(log(3x^2 + 2, 2, 2, 3, 3), x)'));
