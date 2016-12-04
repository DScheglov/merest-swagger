'use strict';

var modelAPIError_schema = require('./model-api-error-jsonschema');

module.exports = exports = {
  swagger: '2.0',
  info: {
    title: '`${api.$__.options.title||"Merest API"}`',
    version: '`${api.$__.options.version||"1.0"}`'
  },
  host: '`${api.$__.options.host || "localhost"}`',
  basePath: '`${api.mountpath || ""}`',
  consumes: ["application/json"],
  produces: ["application/json"],
  responses: {
    '405': {
      description: 'The end-point is not supported',
      schema: modelAPIError_schema.E4xx
    },
    '500': {
      description: 'Internal API error',
      schema: modelAPIError_schema.E500
    }
  },
  paths: {

  }
}
