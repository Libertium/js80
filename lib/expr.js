'use strict';

var _ = require('underscore');

var commands = {};

function evalExpr(expr, env) {
    if(_.isNumber(expr)) {
        return expr;
    }
    
    var key = Object.keys(expr)[0];
    return commands[key](expr[key], env);
}

function reduce(l, func) {
    return _.reduce(_.rest(l), function(memo, num) {
        return func(memo, num);
    }, _.first(l));
}

function toBool(r) {
    return r ? 1 : 0;
}

commands.id = function(id, env) {
    if(env.has(id)) {
        return env.get(id);
    }
    var l = env.inferenceLabel(id);
    if(env.has(l)) {
        return env.get(l);
    }
    throw new Error('Missing label `' + id + "'");
};

commands.neg = function(neg, env) {
    return -evalExpr(neg, env);
};

commands.binary = function(binary, env) {
    var values = _.map(binary.args, function(e) {
        return evalExpr(e, env);
    });
    var ops = {
        '+':  function(l, r) { return l + r; },
        '-':  function(l, r) { return l - r; },
        '*':  function(l, r) { return l * r; },
        '/':  function(l, r) { return l / r; },
        '%':  function(l, r) { return l % r; },
        '<<': function(l, r) { return l << r; },
        '>>': function(l, r) { return l >> r; },
        '^':  function(l, r) { return l ^ r; },
        '|':  function(l, r) { return l | r; },
        '&':  function(l, r) { return l & r; },
        '=':  function(l, r) { return toBool(l === r); },
        '!=': function(l, r) { return toBool(l !== r); },
        '<':  function(l, r) { return toBool(l < r); },
        '>':  function(l, r) { return toBool(l > r); },
        '<=': function(l, r) { return toBool(l <= r); },
        '>=': function(l, r) { return toBool(l >= r); }
    };
    return reduce(values, ops[binary.op]);
};

commands.str = function(str, env) {
    return str;
};

commands.chr = function(chr, env) {
    return chr[0].charCodeAt(0);
};

commands.arg = function(arg, env) {
    var args = env.get('__arguments__');
    var argIndex = evalExpr(arg, env);
    if(argIndex === 0) {
        return args.length;
    }
    return args[argIndex - 1];
};

commands.map = function(map, env) {
    var mapLength = evalExpr(map, env);
    var addr = env.get('__map__');
    env.setGlobal('__map__', addr + mapLength, true);
    return addr;
};

commands.paren = evalExpr;

commands.func = function(func, env) {
    function assert_argsize(n) {
        if(func.args.length != n) {
            throw new Error('Wrong number of function args. Expected ' + str(n) + '.');
        }
    }

    function assert_type_id(arg) {
        if(!('id' in arg)) {
            throw new Error('Wrong arg. Expected id');
        }
        return arg.id;
    }

    var funcs = {
	str: function() {
            assert_argsize(1);
	    var arg = func.args[0];
	    assert_type_id(arg);
	    return arg.id;
	}
    };

    if(func.id in funcs) {
	return funcs[func.id]();
    }

    throw new Error('Unknown function `' + func.id + "'");
};

module.exports.evalExpr = evalExpr;
