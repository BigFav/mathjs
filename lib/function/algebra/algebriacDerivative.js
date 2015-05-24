'use strict';

function factory (type, config, load, typed, math) {
  var ConstantNode = load(require('../../expression/node/ConstantNode'));
  var FunctionNode = load(require('../../expression/node/FunctionNode'));
  var OperatorNode = load(require('../../expression/node/OperatorNode'));
  var SymbolNode   = load(require('../../expression/node/SymbolNode'));

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
    // determine the variable name
    var variable;
    if (args[1] instanceof math.expression.node.SymbolNode) {
      variable = args[1].name;
    } else {
      throw new Error('Second argument must be a symbol');
    }

    constTag(args[0], variable);
    return derivative(args[0]);
  };

  var derivative = typed('derivative', {
    'ConstantNode': function (node) {
       return new ConstantNode('0', node.valueType);
    },

    'SymbolNode': function (node) {
      if (constNodes[node] !== undefined) {
        return new ConstantNode('0', node.valueType);
      }
      return new ConstantNode('1', node.valueType);
    },

    'FunctionNode': function (node) {
      if (constNodes[node] !== undefined) {
        return new ConstantNode('0', node.valueType);
      }

      // Does not support any non-constant functions with no args,
      // update if this changes
      if (!node.args) {
        return node;
      }

      var arg1 = node.args[0];
      switch (node.name) {
        /* Chain rule applies to all functions: TODO INSERT CHAIN RULE HERE! */
        case 'log':
          if (node.args.length > 2) {
            return node;
          }

          /* d/dx(log(x))    = 1 / x
           * d/dx(log(x, c)) = 1 / (x*ln(c)) */
          var newArg2 = (node.args.length == 1)
            ? arg1
            : new OperatorNode('*', 'multiply',
                               [arg1, new FunctionNode('log', [node.args[1]])]);

          return new OperatorNode('/', 'divide', [derivative(arg1), newArg2]);
        case 'exp':
          if (node.args.length > 1) {
            return node;
          }

          // d/dx(e^x) = e^x
          return new OperatorNode('*', 'multiply', [derivative(arg1), arg1.clone()]);
        case 'sin':
          if (node.args.length > 1) {
            return node;
          }

          // d/dx(sin(x)) = cos(x)
          return new OperatorNode(
            '*',
            'multiply',
            [derivative(arg1), new FunctionNode('cos', [arg1.clone()])]
          );
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
    },

    'OperatorNode': function (node) {
      if (constNodes[node] !== undefined) {
        return new ConstantNode('0', node.valueType);
      }

      var arg1 = node.args[0];
      var arg2 = node.args[1];

      switch (node.op) {
        case '^':
          if (constNodes[arg2] !== undefined) {
            if (arg2.type == 'ConstantNode') {
              var expValue = arg2.value;

              // If is secretly constant; f(x)^0 = 1 -> d/dx(1) = 0
              if (expValue == '0') {
                return new ConstantNode('0', node.valueType);
              }
              // Ignore exponent; f(x)^1 = f(x)
              if (expValue == '1') {
                return derivative(arg1);
              }
            }

            // Elementary Power Rule, d/dx(f(x)^c) = c*f'(x)*f(x)^(c-1)
            var newArg2 = new OperatorNode(
              node.op,
              node.fn,
              [arg1, new OperatorNode(
                '-',
                'subtract',
                [arg2, new ConstantNode('1', arg2.valueType)]
              )]
            );

            return new OperatorNode('*', 'multiply', [arg2.clone(), newArg2]);
          }

          // d/dx(f^g) = f^g*[f'*(g/f) + g'ln(f)]
          throw new Error('Functional Power rule not supported yet');
        case '*':
          if (constNodes[arg1] !== undefined || constNodes[arg2] !== undefined) {
            var newArgs = (constNodes[arg1] !== undefined)
              ? [arg1.clone(), derivative(arg2)]
              : [arg2.clone(), derivative(arg1)]

            // d/dx(c*f(x)) = c*f'(x)
            return new OperatorNode('*', 'multiply', newArgs);
          }

          throw new Error('Product rule not supported yet');
        case '/':
          // Reciprocal Rule, d/dx(c / f(x)) = -c(f'(x)/f(x)^2)
          if (constNodes[arg1] !== undefined) {
            return new OperatorNode(
              '*',
              'multiply',
              [
                new OperatorNode('-', 'unaryMinus', [arg1]),
                new OperatorNode(
                  '/',
                  'divide',
                  [derivative(arg2),
                   new OperatorNode('^', 'pow', [arg2.clone(), new ConstantNode(2)])]
                }
              ]
            };
          }

          // d/dx(f(x) / c) = f'(x) / c
          if (constNodes[arg2] !== undefined) {
            return new OperatorNode('/', 'divide', [derivative(arg1), arg2]);
          }

          throw new Error('Quotient rule not supported yet');
        case '-':
        case '+':
          // d/dx(+/-f(x)) = +/-f'(x)
          if (node.args == 1) {
            return new OperatorNode(node.op, node.fn, [derivative(arg1)]);
          }

          // Linearity of differentiation, d/dx(f(x) +/- g(x)) = f'(x) +/- g'(x)
          return new OperatorNode(node.op, node.fn,
                                  [derivative(arg1), derivative(arg2)]);
        default: throw new Error('Operator ' + node.op + ' not supported');
      }
    }
  });

  var constTag = typed('constTag', {
    'ConstantNode, string': function (node) {
      return constNodes[node] = true;
    },

    'SymbolNode, string': function (node, varName) {
      if (node.name == varName) {
        return constNodes[node] = true;
      }
      return false;
    },

    'any, string': function (node, varName) {
      if (node.args) {
        constNodes[node] = constTag(node.args[0], varName);
        if (node.args.length == 1) {
          return constNodes[node];
        }
        if (node.args.length == 2) {
          return constNodes[node] = constTag(node.args[1], varName) && constNodes[node];
        }

        for (var i = 1; i < node.args.length; ++i) {
          constNodes[node] = constTag(node.args[i], varName) && constNodes[node];
        }
        return constNodes[node];
      }

      throw new Error('Node type "' + node.type + '" not captured');
    }
  });

  var constNodes = {};

  derivative.transform.rawArgs = true;

  return derivative.transform;
}

exports.math = true; // request access to the math namespace as 5th argument of the factory function
exports.name = 'derivative';
exports.factory = factory;
