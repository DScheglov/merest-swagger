'use strict';

var assert = require('assert');
var swaggerTmplObj = require('./swagger');
var controllerDocs = require('./docs');
var listQueryFields = require('./list-query-fields');
var buildQuery = require('./build-query');
var DEFAULT_INSTANCE_OPERATION = {
  tags: ['`${ctrl.router.nameSingle}`'],
  description: '`${ctrl.title}`',
  parameters: [{
    name: 'id',
    type: 'string',
    in: 'path',
    pattern: '`${ctrl.router.apiOptions.matchId}`',
    required: true
  }],
  responses: {
    '200': {
      description: 'Success'
    }
  }
};

var DEFAULT_STATIC_OPERATION = {
  tags: ['`${ctrl.router.nameSingle}`'],
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success'
    }
  }
};


function describeApi(api, options) {
  var result = JSON.parse(JSON.stringify(swaggerTmplObj));
  if (options) {
    api.$__.options = Object.assign(api.$__.options, options);
  }
  result.info.title = evalStrApi(result.info.title, api);
  result.info.version = evalStrApi(result.info.version, api);
  result.host = evalStrApi(result.host, api);
  result.basePath = evalStrApi(result.basePath, api);

  if (result.basePath && result.basePath !== '/') {
    var c = result.basePath.substr(-1);
    if (c === '/') result.basePath = result.basePath.slice(0, -1);
  } else {
    delete result.basePath;
  }

  if (!api.$__.options.optionsAttached) {
    delete result.paths['/'];
  } else {
    var examples = result.paths['/']['options'].responses['200'].examples;
    examples['application/json'] = evalStrApi(
      examples['application/json'], api
    );
  }

  result = api.__routers.reduce(describeRouter, result);

  if (!result['x-options-used']) {
    delete result.definitions.Options;
  } else {
    delete result['x-options-used'];
  }

  return result;
}

function describeRouter(result, router) {
  if (!router._controllers) throw new Error(
    "Installed merest version doesn't support Swagger documentation. "+
    "Update merest"
  )
  router._controllers.forEach(ctrl => {
    var p = ctrl.path.replace(':id', '{id}');
    var path = result.paths[p] || {};
    result.paths[p] = path;
    path[ctrl.method] = describeController(ctrl);
    if (ctrl.endPoint === 'options') router.__optionsUsed = true;
  });
  if (router.__definitions) {
    result.definitions = Object.assign(
      result.definitions, router.__definitions
    );
    delete router.__definitions;
  };
  result.tags.push({
    name: router.nameSingle,
    description: `Methods to manage ${router.nameSingle}`
  });

  if (router.__optionsUsed) {
    delete router.__optionsUsed;
    result['x-options-used'] = true;
  }

  return result;
}

function describeController(ctrl) {
  var ctrlName = ctrl.endPoint;
  var swaggerDoc = controllerDocs[ctrlName];

  if (!swaggerDoc) {
    swaggerDoc = ctrl.path.indexOf('/:id') < 0 ?
      DEFAULT_STATIC_OPERATION :
      DEFAULT_INSTANCE_OPERATION;
  };

  var result = JSON.parse(JSON.stringify(swaggerDoc));
  result.description = evalStr(result.description, ctrl);
  if (result.operationId) {
    result.operationId = evalStr(result.operationId, ctrl);
    ctrl.operationId = result.operationId;
  }
  if (result.summary) result.summary = evalStr(result.summary, ctrl);
  if (result.tags) {
    result.tags = result.tags.map(tag => evalStr(tag, ctrl));
  }

  if (result.parameters) {
    result.parameters = result.parameters.reduce(
      (params, param) => {

        if (typeof param === 'string') {
          param = evalStr(param, ctrl);
          return params.concat(param);
        }

        param = describeParameter(ctrl, param);
        if (param['x-remove']) return params;
        params.push(param);
        return params;
      }, []
    );
  }

  if (result.responses) {
    result.responses = Object.keys(result.responses).reduce(
      (responses, resp) => {
        responses[resp] = describeResponse(ctrl, result.responses[resp]);
        return responses;
      }, {}
    );
  }

  return result;
}

function describeParameter(ctrl, param) {
  if (param['x-remove']) {
    param['x-remove'] = evalStr(param['x-remove'], ctrl);
    if (param['x-remove']) return param;
    delete param['x-remove'];
  }

  if (param.name) param.name = evalStr(param.name, ctrl);
  if (param.in) param.in = evalStr(param.in, ctrl);
  if (param.type) param.type = evalStr(param.type, ctrl);
  if (param.required) param.required = evalStr(param.required, ctrl);
  if (param.description) param.description = evalStr(param.description, ctrl);
  if (param.schema) {
    param.schema = evalStr(param.schema, ctrl);
    delete param.schema.title;
    ctrl.router.__definitions = ctrl.router.__definitions || {};
    var defs = ctrl.router.__definitions;
    var schemaName = ctrl.router.nameSingle;
    if (param['x-schema-name']) {
      schemaName = evalStr(param['x-schema-name'], ctrl);
      delete param['x-schema-name'];
    }
    var def = defs[schemaName];
    if (def) {
      if (!__deepEqual(def, param.schema)) {
        schemaName = Object.keys(defs).find(
          n => __deepEqual(defs[n], param.schema)
        );
        if (!schemaName) {
          schemaName = `${ctrl.operationId}_Request`;
          defs[schemaName] = param.schema;
        }
      }
    } else {
      defs[schemaName] = param.schema;
    }
    param.schema = { $ref: `#/definitions/${schemaName}` };
  }
  if (param.pattern) param.pattern = evalStr(param.pattern, ctrl);

  return param;
}

function describeResponse(ctrl, resp) {
  if (resp.description) resp.description = evalStr(resp.description, ctrl);
  if (resp.schema) resp.schema = evalStr(resp.schema, ctrl);
  if (resp.schema && !resp.schema.$ref) {
    var schemaName = `${ctrl.router.nameSingle}_Response`;
    var defs = ctrl.router.__definitions || {};
    ctrl.router.__definitions = defs;
    var def = defs[schemaName];
    var schema = resp.schema.type === 'array' ? resp.schema.items : resp.schema;
    if (def) {
      if (schema.title) delete schema.title;
      if (!__deepEqual(def, schema)) {
        schemaName = Object.keys(defs).find(
          n => __deepEqual(defs[n], schema)
        );
        if (!schemaName) {
          schemaName = `${ctrl.operationId}_Response`;
          defs[schemaName] = schema;
        }
      }
    } else {
      defs[schemaName] = schema;
    }
    if (resp.schema.type === 'array') {
      resp.schema.items = { $ref: `#/definitions/${schemaName}` }
    } else {
      resp.schema = { $ref: `#/definitions/${schemaName}` };
    }
  }

  if (resp.examples) {
    resp.examples['application/json'] = evalStr(
      resp.examples['application/json'], ctrl
    );
  }
  return resp;
}

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

module.exports = exports = describeApi;


function __deepEqual(obj1, obj2) {
  try {
    assert.deepEqual(obj1, obj2);
    return true;
  } catch(e) {
    return false;
  }
}
