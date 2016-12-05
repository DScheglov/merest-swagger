'use strict';

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
  if (result.basePath) {
    var c = result.basePath.substr(-1);
    if (c === '/') result.basePath = result.basePath.slice(0, -1);
  } else {
    delete result.basePath;
  }

  result.paths = api.__routers.reduce(describeRouter, {});
  result.tags = api.__routers.map(router => {
    return {
      name: router.nameSingle,
      description: `Methods to manage ${router.nameSingle}`
    }
  });
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
  var ctrlName = ctrl.controller.name.split(' ').pop();
  var swaggerDoc = controllerDocs[ctrlName];

  if (!swaggerDoc) {
    swaggerDoc = ctrl.path.indexOf('/:id') < 0 ?
      DEFAULT_STATIC_OPERATION :
      DEFAULT_INSTANCE_OPERATION;
  };

  var result = JSON.parse(JSON.stringify(swaggerDoc));
  result.description = evalStr(result.description, ctrl);
  result.operationId = evalStr(result.operationId, ctrl);
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
  if (param.schema) param.schema = evalStr(param.schema, ctrl);
  if (param.pattern) param.pattern = evalStr(param.pattern, ctrl);

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
