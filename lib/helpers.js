'use strict';

var assert = require('assert');

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
      list.push(param);
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


module.exports = exports = {
  listQueryFields: listQueryFields,
  buildQuery: buildQuery,
  evalStr: evalStr,
  evalStrApi: evalStrApi,
  __deepEqual: __deepEqual
}
