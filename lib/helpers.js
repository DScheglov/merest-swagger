'use strict';

var assert = require('assert');
var OPERATORS = {
  'lt': 'is less then a value',
  'lte': 'is less or equal to a value',
  'gt': 'is greater then a value',
  'gte': 'is greater or equal to a value',
  'in': 'is in the list of values, separated by coma',
  'nin': 'is not in the list of values, separated by coma',
  'ex': 'exists (if value is 1, yes, true), doesn\'t exists (if value is 0, false or no)',
  're': 'matches to the regexp represented by a value (/pattern/mods syntax is allowed)'
}

function listQueryFields(ctrl) {
  var fields = ctrl.router.apiOptions.queryFields;
  if (fields) {
    fields = Object.keys(fields).filter(f => fields[f]);
  } else {
    fields = Object.keys(ctrl.model.schema.paths);
  }

  if (ctrl.method !== 'get') {
    var param = {
      name: 'searchQuery',
      in: 'body',
      schema: {
        title: `${ctrl.router.model.modelName}_Search`,
        type: 'object'
      }
    };
    param.schema.properties = fields.reduce((props, f) => {
      props[f] = ctrl.model.schema.paths[f].jsonSchema();
      delete props[f].__required;
      return props;
    }, {});
    return param;
  }

  return fields.reduce(
    (list, f) => {
      var schema = ctrl.model.schema.paths[f].jsonSchema();
      if (schema.type === 'object') return list;
      if (schema.type === 'array') {
        schema = schema.items;
        if (schema.type === 'object' || schema.type ==='array') return list;
      }
      var param = {
        name: f,
        in: 'query',
        type: schema.type
      };
      if (schema.description) param.description = schema.description;
      if (schema.enum) param.enum = schema.enum;
      if (schema.pattern) param.pattern = schema.pattern;
      list.push(param);

      switch (param.type) {
        case 'boolean': list.push(cloneParam(param, 'ex')); break;
        case 'string': list.push(cloneParam(param, 're'));
        default:
          ['ne', 'lt', 'lte', 'gt', 'gte', 'in', 'nin', 'ex'].forEach(
            (suffix) => list.push(cloneParam(param, suffix))
          );
      }
      return list;
    }, []
  );
}

function buildQuery(ctrl) {
  var Q = ctrl.model.find();
  var fields = ctrl.router.option('search', 'fields');
  var populate = ctrl.router.option('search', 'populate');
  Q.select(fields);
  if (populate) Q.populate(populate);
  return Q;
};

function evalStr(str, ctrl) {
  if (!str) return str;
  if (typeof str !== 'string') return str;
  try {
    var s0 = str[0];
    return  (s0 === '`' || s0 === ';') ? eval(str) : str;
  } catch(e) {
    return `ERROR (${e.message}): ${str}`;
  }
}

function evalStrApi(str, api) {
  if (!str) return str;
  if (typeof str !== 'string') return str;
  try {
    var s0 = str[0];
    return  (s0 === '`' || s0 === ';') ? eval(str) : str;
  } catch(e) {
    return `ERROR (${e.message}): ${str}`;
  }
}


function __deepEqual(obj1, obj2) {
  try {
    assert.deepEqual(obj1, obj2);
    return true;
  } catch(e) {
    return false;
  }
}

function cloneParam(param, suffix) {
  var p = Object.assign({}, param);
  p.name = `${param.name}__${suffix}`;
  p.description = `${param.name} ${OPERATORS[suffix]}`;
  if (suffix === 'ex') {
    p.type = 'string';
    p.enum = ['no', 'yes'];
  }
  delete p.enum;
  delete p.pattern;
  return p;
}

module.exports = exports = {
  listQueryFields: listQueryFields,
  buildQuery: buildQuery,
  evalStr: evalStr,
  evalStrApi: evalStrApi,
  __deepEqual: __deepEqual
}
