'use strict';

/**
* File contains documentation for standard `merest` controllers
*/

var controllers = require('merest/lib/controllers');
var modelAPIError_schema = require('./model-api-error-jsonschema').E4xx;
var options_schema = require('./options-jsonschema');

var MODEL_SCHEMA_SEL_POP = endPoint => ';ctrl.model.jsonSchema(' +
  'ctrl.router.option("' + endPoint + '", "fields"), ' +
  'ctrl.router.option("' + endPoint + '", "populate")' +
')';

var MODEL_SCHEMA = ';ctrl.model.jsonSchema()';
var MODEL_SCHEMA_ALLFIELDS = ';ctrl.model.jsonSchema(' +
  'Object.keys(ctrl.model.schema.paths).filter(p=>p!="__v"&&p!="_id")' +
')';


 /**
  * Swagger documentation for OPTIONS
  */
controllers.options.swaggerDoc = {
  operationId: '`optionsFor_${ctrl.router.plural}`',
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success',
      schema: options_schema
    }
  }
};


/**
 * Swagger documentation for DETAILS
 */
controllers.find.swaggerDoc = {
  operationId: '`detailsOf_${ctrl.router.nameSingle}`',
  description: '`${ctrl.title}`',
  parameters: [{
    name: 'id',
    in: 'path',
    type: 'string',
    required: true
  }],
  responses: {
    '200': {
      description: '`The ${ctrl.router.nameSingle} was found successfully.`',
      schema: MODEL_SCHEMA_SEL_POP('details')
    },
    '404': {
      description: '`${ctrl.router.nameSingle} is not found by specified id`',
      schema: modelAPIError_schema
    }
  }
};


/**
 * Swagger documentation for CREATE
 */
controllers.create.swaggerDoc = {
  operationId: '`create_${ctrl.router.nameSingle}`',
  description: '`${ctrl.title}`',
  parameters: [{
    name: '`${ctrl.router.nameSingle}`',
    in: '`${ctrl.method==="get"?"query":"body"}`',
    schema: MODEL_SCHEMA,
    required: true
  }],
  responses: {
    '201': {
      description: 'Successfully created',
      schema: MODEL_SCHEMA_SEL_POP('create')
    },
    '406': {
      description: 'Wrong method usage (use `post ~/:id` to update an object)',
      schema: modelAPIError_schema
    },
    '422': {
      description: 'Entity validation failed',
      schema: modelAPIError_schema
    }
  }
};


/**
 * Swagger documentation for UPDATE
 */
controllers.update.swaggerDoc = {
  operationId: '`update_${ctrl.router.nameSingle}`',
  description: '`${ctrl.title}`',
  parameters:  [{
    name: 'id',
    in: 'path',
    type: 'string',
    required: true
  }, {
    name: '`${ctrl.router.nameSingle}`',
    in: '`${ctrl.method==="get"?"query":"body"}`',
    schema: MODEL_SCHEMA_ALLFIELDS
  }],
  responses: {
    '200': {
      description: 'Successfully updated',
      schema: MODEL_SCHEMA_SEL_POP('update')
    },
    '404': {
      description: '`${ctrl.router.nameSingle} is not found by specified id`',
      schema: modelAPIError_schema
    },
    '422': {
      description: 'Entity validation failed',
      schema: modelAPIError_schema
    }
  }
};


/**
 * Swagger documentation for DELETE
 */
controllers.delete.swaggerDoc = {
  operationId: '`delete_${ctrl.router.nameSingle}`',
  description: '`${ctrl.title}`',
  parameters: [{
    name: 'id',
    in: 'path',
    type: 'string',
    required: true
  }],
  responses: {
    '200': {
      description: 'Successfully deleted',
      schema: {}
    },
    '404': {
      description: '`${ctrl.router.nameSingle} is not found by specified id`',
      schema: modelAPIError_schema
    }
  }
};


/**
 * Swagger documentation for SEARCH
 */
controllers.search.swaggerDoc = {
  operationId: '`searchFor_${ctrl.router.plural}`',
  description: '`${ctrl.title}`',
  parameters: [{
    'x-remove': ';ctrl.router.option("search", "sort") === false',
    name: '_sort',
    in: 'query',
    type: 'string',
    description: 'The list of fields to order by: [-]field[,[-]field]'
  }, {
    'x-remove': ';ctrl.router.option("search", "limit") === false',
    name: '_limit',
    in: 'query',
    type: 'integer',
    description: 'The maximum number of documents in the response'
  }, {
    'x-remove': ';ctrl.router.option("search", "skip") === false',
    name: '_skip',
    in: 'query',
    type: 'integer',
    description: 'Number of documents should be skipped in the selection before responding'
  }, ';listQueryFields(ctrl)'],
  responses: {
    '200': {
      description: 'Successfully searched',
      schema: ';buildQuery(ctrl).jsonSchema()'
    }
  }
};


/**
 * Swagger documentation for exposed instance method
 */
controllers.callInstanceMethod.swaggerDoc = {
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success'
    }
  }
};


/**
 * Swagger documentation for exposed static method
 */
controllers.callStaticMethod.swaggerDoc = {
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success'
    }
  }
};


module.exports = exports = controllers;
