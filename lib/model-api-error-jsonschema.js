'use strict';

module.exports = exports = {
  E4xx: {
    title: 'ModelAPIError',
    type: 'object',
    properties: {
      error: { type: 'boolean' },
      code: { type: 'string' },
      message: { type: 'string' }
    }
  },
  E422: {
    title: 'EntityValidationError',
    type: 'object',
    properties: {
      error: { type: 'boolean' },
      code: { type: 'string' },
      message: { type: 'string' },
      errors: {}
    }
  },
  E500: {
    title: 'InternalError',
    type: 'object',
    properties: {
      error: { type: 'boolean' },
      message: { type: 'string' },
      stack: {}
    }
  }
}
