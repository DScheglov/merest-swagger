module.exports = exports = {
  title: 'ModelAPIError',
  type: 'object',
  properties: {
    error: { type: 'boolean' },
    code: { type: 'string' },
    message: { type: 'string' },
    stack: {}
  }
}
