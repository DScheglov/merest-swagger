'use strict';

var swaggerTmplObj = require('./templates/swagger');
var controllerDocs = require('./templates/docs');

var helpers = require('./helpers');
var listQueryFields = helpers.listQueryFields;
var buildQuery = helpers.buildQuery;
var evalStr = helpers.evalStr;
var evalStrApi = helpers.evalStrApi;
var __deepEqual = helpers.__deepEqual;


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

  ['responses', 'definitions'].forEach(section => {
    var resJSON = JSON.stringify(result);
    Object.keys(swaggerTmplObj[section]).forEach(m => {
      var ref = `"#/${section}/${m}"`;
      if (resJSON.indexOf(ref) < 0) {
        delete result[section][m];
      }
    })
  });

  return result;
}

function describeRouter(result, router) {
  router._controllers.forEach(ctrl => {
    var p = ctrl.path.replace(':id', '{id}');
    var path = result.paths[p] || {};
    result.paths[p] = path;
    path[ctrl.method] = describeController(ctrl);
  });

  result.definitions = Object.assign(
    result.definitions, router.__definitions
  );
  delete router.__definitions;

  result.tags.push({
    name: router.nameSingle,
    description: `Methods to manage ${router.nameSingle}`
  });

  return result;
}

function describeController(ctrl) {
  var ctrlName = ctrl.endPoint;
  var swaggerDoc = controllerDocs[ctrlName];

  var result = JSON.parse(JSON.stringify(swaggerDoc));
  result.description = evalStr(result.description, ctrl);
  result.operationId = evalStr(result.operationId, ctrl);
  ctrl.operationId = result.operationId;
  result.summary = evalStr(result.summary, ctrl);
  result.tags = result.tags.map(tag => evalStr(tag, ctrl));

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
    if (result.parameters.length === 0) {
      delete result.parameters;
    }
  }

  result.responses = Object.keys(result.responses).reduce(
    (responses, resp) => {
      responses[resp] = describeResponse(ctrl, result.responses[resp]);
      return responses;
    }, {}
  );

  return result;
}

function describeParameter(ctrl, param) {
  if (param['x-remove']) {
    param['x-remove'] = evalStr(param['x-remove'], ctrl);
    if (param['x-remove']) return param;
    delete param['x-remove'];
  }

  param.name = evalStr(param.name, ctrl);
  param.in = evalStr(param.in, ctrl);
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
    defs[schemaName] = param.schema;
    param.schema = { $ref: `#/definitions/${schemaName}` };
  }
  if (param.pattern) param.pattern = evalStr(param.pattern, ctrl);

  return param;
}

function describeResponse(ctrl, resp) {
  if (resp.description) resp.description = evalStr(resp.description, ctrl);
  if (resp.schema) resp.schema = evalStr(resp.schema, ctrl);
  if (resp.schema && !resp.schema.$ref) {
    var schema = resp.schema.type === 'array' ? resp.schema.items : resp.schema;
    var schemaName = `${ctrl.router.nameSingle}_Response`;
    var defs = ctrl.router.__definitions || {};
    ctrl.router.__definitions = defs;
    delete schema.title;
    if (__deepEqual(schema, {})) {
      schemaName = 'ANY';
    } else if (ctrl.options.fields || ctrl.options.populate) {
      schemaName = `${ctrl.operationId}_Response`;
      defs[schemaName] = schema;
    } else {
      var def = defs[schemaName];
      if (!def) {
        defs[schemaName] = schema;
      }
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

module.exports = exports = describeApi;
