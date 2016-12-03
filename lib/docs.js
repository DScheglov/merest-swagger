'use strict';

var controllers = require('merest/lib/controllers');
var modelAPIError_schema = require('./model-api-error-jsonschema');
var options_schema = require('./options-jsonschema');

/**
 * File contains documentation for standard `merest` controllers
 */


 /**
  * Swagger documentation for OPTIONS
  */
controllers.options.swaggerDoc = {
  operationId: '`getOptionsFor_${router.plural}`',
  description: '`${title}`',
  responses: [
    '200': {
      description: 'Success',
      schema: options_schema
    }
  ]
};


/**
 * Swagger documentation for DETAILS
 */
controllers.find.swaggerDoc = {
  operationId: '`find${ctrl.router.nameSingle}ById`',
  description: '`${ctrl.title}`',
  parameters: [{
    name: 'id',
    in: 'path',
    type: 'string',
    required: 'true'
  }],
  responses: {
    '200': {
      description: '`The ${ctrl.router.nameSingle} was found successfully.`',
      schema: ':ctrl.model.jsonSchema(ctrl.router.option("details", "fields"), ctrl.router.options("details", "populate"))'
    },
    '404': {
      description: '`${router.nameSingle} is not found by specified id`',
      schema: modelAPIError_schema
    },
    '405': {
      description: 'The end-point is not supported',
      schema: modelAPIError_schema
    }
  }
};
controllers.create.swaggerDoc = {
  params: {
    body: '{model.jsonSchema()}'
  },
  responses: [
    {
      code: '201',
      title: 'Successfully created',
      schema: '{model.jsonSchema(fields)}'
    }, {
      code: '406',
      title: 'Wrong method usage (use `post ~/:id` to update an object)',
      schema: '{ModelAPIError.jsonSchema()}'
    }, {
      code: '422',
      title: 'Entity validation failed',
      schema: '{ModelAPIError.jsonSchema()}'
    }
  ]
};
controllers.update.swaggerDoc = {};
controllers.delete.swaggerDoc = {};
controllers.search.swaggerDoc = {};
controllers.callInstanceMethod.swaggerDoc = {};
controllers.callStaticMethod.swaggerDoc = {};
