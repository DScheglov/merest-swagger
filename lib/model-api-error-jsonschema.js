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
  E500: {
    title: 'ModelAPIError',
    type: 'object',
    properties: {
      error: { type: 'boolean' },
      message: { type: 'string' },
      stack: {}
    }
  }
}
