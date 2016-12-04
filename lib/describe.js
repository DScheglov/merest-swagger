'use strict';

var swaggerTmplObj = require('./swagger');
var listQueryFields = require('./list-query-fields');
var buildQuery = require('./build-query');
var DEFAULT_OPERATION = {
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success'
    }
  }
};

function describeApi(api) {
  var result = JSON.parse(JSON.stringify(swaggerTmplObj));
  result.info.title = evalStrApi(result.info.title, api);
  result.info.version = evalStrApi(result.info.version, api);
  result.host = evalStrApi(result.host, api);
  result.basePath = evalStrApi(result.basePath, api);
  if (!result.basePath) delete result.basePath;

  result.paths = api.__routers.reduce(describeRouter, {});

  return result;
}

function describeRouter(paths, router) {
  if (!router._controllers) throw new Error(
    "Installed merest version doesn't support Swagger documentation. "+
    "Update merest"
  )
  router._controllers.forEach(ctrl => {
    var p = ctrl.path.replace(':id', '{id}');
    var path = paths[p] || {};
    paths[p] = path;
    path[ctrl.method] = describeController(ctrl);
  });
  return paths;
}

function describeController(ctrl) {
  var swaggerDoc = ctrl.controller.swaggerDoc || DEFAULT_OPERATION;
  var result = JSON.parse(JSON.stringify(swaggerDoc));
  result.description = evalStr(result.description, ctrl);
  result.operationId = evalStr(result.operationId, ctrl);

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
  if (param.schema) param.schema = evalStr(param.schema, ctrl);

  return param;
}

function describeResponse(ctrl, resp) {
  if (resp.description) resp.description = evalStr(resp.description, ctrl);
  if (resp.schema) resp.schema = evalStr(resp.schema, ctrl);
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
