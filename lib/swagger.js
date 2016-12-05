'use strict';

var modelAPIError_schema = require('./model-api-error-jsonschema');
var options_schema = require('./options-jsonschema');

module.exports = exports = {
  swagger: '2.0',
  info: {
    title: '`${api.$__.options.title||"Merest API"}`',
    version: '`${api.$__.options.version||"1.0"}`'
  },
  host: '`${api.$__.options.host || "localhost"}`',
  basePath: '`${api.$__.options.path || api.mountpath || "/"}`',
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [{
    name: '_meta',
    description: 'API description'
  }],
  responses: {
    '405': {
      description: 'The end-point is not supported',
      schema: {$ref: '#/definitions/modelAPIError_E4xx' }
    },
    '422': {
      description: 'Entity validation failed',
      schema: {$ref: '#/definitions/modelAPIError_E422' }
    },
    '500': {
      description: 'Internal API error',
      schema: {$ref: '#/definitions/modelAPIError_E500' }
    }
  },
  paths: {
    '/': {
      'options': {
        tags: ['_meta'],
        operationId: 'allAPIOptions ',
        description: 'List all end-points of current application',
        summary: 'List all api options',
        responses: {
          '200': {
            description: 'Success',
            schema: { $ref: '#/definitions/Options' },
            examples: {
              'application/json': ';api._urls'
            }
          },
          '405': { $ref: '#/responses/405' },
          '500': { $ref: '#/responses/500' }
        }
      }
    }
  },
  definitions: {
    modelAPIError_E4xx: modelAPIError_schema.E4xx,
    modelAPIError_E422: modelAPIError_schema.E422,
    modelAPIError_E500: modelAPIError_schema.E500,
    Options: options_schema,
    deleteResponse: {
      "type": "object",
      "additionalProperties": false,
      "properties": { }
    }
  }
}
