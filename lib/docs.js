'use strict';

/**
* File contains documentation for standard `merest` controllers
*/

var controllers = {};
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
controllers.options = {
  tags: ['`${ctrl.router.nameSingle}`', '_meta'],
  operationId: '`optionsFor_${ctrl.router.plural}`',
  summary: 'API Options',
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success',
      schema: { $ref: '#/definitions/Options' },
      examples: {
        'application/json': ';ctrl.router._urls'
      }
    },
    '405': { $ref: '#/responses/405' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for DETAILS
 */
controllers.findById = {
  tags: ['`${ctrl.router.nameSingle}`'],
  operationId: '`detailsOf_${ctrl.router.nameSingle}`',
  summary: '`Details of ${ctrl.router.nameSingle}`',
  description: '`${ctrl.title}`',
  parameters: [{
    name: 'id',
    in: 'path',
    type: 'string',
    pattern: '`${ctrl.router.apiOptions.matchId}`',
    required: true
  }],
  responses: {
    '200': {
      description: '`The ${ctrl.router.nameSingle} was found successfully.`',
      schema: MODEL_SCHEMA_SEL_POP('details')
    },
    '404': {
      description: '`${ctrl.router.nameSingle} is not found by specified id`',
      schema: { $ref: '#/definitions/modelAPIError_E4xx' }
    },
    '405': { $ref: '#/responses/405' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for CREATE
 */
controllers.create = {
  tags: ['`${ctrl.router.nameSingle}`'],
  operationId: '`create_${ctrl.router.nameSingle}`',
  summary: '`Create ${ctrl.router.nameSingle}`',
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
      schema: { $ref: '#/definitions/modelAPIError_E4xx' }
    },
    '405': { $ref: '#/responses/405' },
    '422': { $ref: '#/responses/422' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for UPDATE
 */
controllers.update = {
  tags: ['`${ctrl.router.nameSingle}`'],
  operationId: '`update_${ctrl.router.nameSingle}`',
  summary: '`Update ${ctrl.router.nameSingle}`',
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
      schema: { $ref: '#/definitions/modelAPIError_E4xx' }
    },
    '405': { $ref: '#/responses/405' },
    '422': { $ref: '#/responses/422' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for DELETE
 */
controllers.delById = {
  tags: ['`${ctrl.router.nameSingle}`'],
  operationId: '`delete_${ctrl.router.nameSingle}`',
  summary: '`Delete ${ctrl.router.nameSingle}`',
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
      schema: { $ref: '#/definitions/deleteResponse' }
    },
    '404': {
      description: '`${ctrl.router.nameSingle} is not found by specified id`',
      schema: { $ref: '#/definitions/modelAPIError_E4xx' }
    },
    '405': { $ref: '#/responses/405' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for SEARCH
 */
controllers.search = {
  tags: ['`${ctrl.router.nameSingle}`'],
  operationId: '`searchFor_${ctrl.router.plural}`',
  summary: '`Search for ${ctrl.router.plural}`',
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
    },
    '405': { $ref: '#/responses/405' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for exposed instance method
 */
controllers.callInstanceMethod = {
  tags: ['`${ctrl.router.nameSingle}`'],
  summary: '`${ctrl.title.substr(0, 120)}`',
  description: '`${ctrl.title}`',
  parameters: [{
    name: 'id',
    type: 'string',
    in: 'path'
  }],
  responses: {
    '200': {
      description: 'Success'
    },
    '405': { $ref: '#/responses/405' },
    '500': { $ref: '#/responses/500' }
  }
};


/**
 * Swagger documentation for exposed static method
 */
controllers.callStaticMethod = {
  tags: ['`${ctrl.router.nameSingle}`'],
  summary: '`${ctrl.title.substr(0, 120)}`',
  description: '`${ctrl.title}`',
  responses: {
    '200': {
      description: 'Success'
    },
    '405': { $ref: '#/responses/405' },
    '500': { $ref: '#/responses/500' }
  }
};


module.exports = exports = controllers;
