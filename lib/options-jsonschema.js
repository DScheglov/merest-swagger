
module.exports = exports = {
  title: 'List of options',
  type: 'array',
  items: {
    title: 'Option parameters',
    type: 'array',
    items: { type: 'string' },
    minItems: 3, maxItems: 3
  }
};
