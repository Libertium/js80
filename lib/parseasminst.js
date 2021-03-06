'use strict';

var util = require('util'),
    evalExpr = require('./expr').evalExpr,
    z80parser = require('./z80parser'),
    _ = require('underscore');

var forwardExpr;

function isRegister(expr) {
    if(!expr.id) {
        return false;
    }
    var id = expr.id.toUpperCase();
    var regs = [
        "AF", "BC", "DE", "HL", "IX", "IY", "SP", "R", "I",
        "A", "F", "B", "C", "D", "E", "H", "L", "IXL", "IXH", "IYL", "IYH",
        "C", "M", "NC", "NZ", "P", "PE", "PO", "Z"
    ];
    return _.any(regs, function (i) {
        return i === id;
    });
}

function isArgParenOffset(arg) {
    return arg.paren && arg.paren.binary && arg.paren.binary.op === '+' && ['ix', 'iy'].indexOf(arg.paren.binary.args[0].id.toString().toLowerCase()) > -1;
}

function formatArg(arg, env) {
    if (arg.str) {
        throw new Error('Invalid argument `' + arg.str + "'");
    }

    // always eval macro arguments
    if(arg.arg) {
        arg = evalExpr(arg, env);
    }

    if(arg.paren) {
        try {
            var value = evalExpr(arg.paren, env);
            if (_.isNumber(value)) {
                return util.format('(%d)', value);
            }
        } catch(e) {
        }

        if (isRegister(arg.paren)) {
            return util.format('(%s)', arg.paren.id);
        }

        if (isArgParenOffset(arg)) {
            var offsetReg = arg.paren.binary.args[0].id.toString().toLowerCase();
            var offsetExpr = {binary: {op: arg.paren.binary.op, args: _.rest(arg.paren.binary.args)}};
            var offsetValue = evalExpr(offsetExpr, env);
            if (offsetValue < 0) {
                return util.format('(%s%d)', offsetReg, offsetValue);
            } else {
                return util.format('(%s+%d)', offsetReg, offsetValue);
            }
        }

        return "(" + formatArg(arg.paren, env) + ")";
    }

    try {
        var value = evalExpr(arg, env);
        if (_.isNumber(value)) {
            return value.toString();
        }
    } catch (e) {
    }

    if (isRegister(arg)) {
        return arg.id;
    }

    forwardExpr = arg;
    return '$nn';
}

function formatArgs(ast, env) {
    return _.map(ast.args, function (arg) {
        return formatArg(arg, env);
    });
}

function formatInst(ast, env) {
    forwardExpr = '';
    var formattedInst = ast.inst;
    if (ast.args) {
        var formattedArgs = formatArgs(ast, env).join(",");
        formattedInst += ' ' + formattedArgs;
    }
    return formattedInst;
}

function setForwardExpr(forwardExpr, bytes) {
    _.each(bytes, function (b) {
        if (b.type && b.expr === '$nn') {
            b.expr = forwardExpr;
        }
    });
}

function parse(ast, env) {
    var formattedInst = formatInst(ast, env);
    var bytes = z80parser.parse(formattedInst);
    if (forwardExpr) {
        setForwardExpr(forwardExpr, bytes);
    }
    return bytes;
}

module.exports.parse = parse;
