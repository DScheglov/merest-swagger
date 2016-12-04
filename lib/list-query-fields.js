'use strict';

function listQueryFields(ctrl) {
  var fields = ctrl.router.queryFields;
  if (fields) {
    fields = Object.keys(fields).filter(f => fields[f]);
  } else {
    fields = Object.keys(ctrl.model.schema.paths);
  }
  return fields.reduce(
    (list, f) => {
      var schema = ctrl.model.schema.paths[f].jsonSchema();
      if (schema.type === 'object') return list;
      if (schema.type === 'array') {
        schema = schema.items;
        if (['object', 'array'].indexOf(schema.type) >= 0) return list;
      }
      if (ctrl.method === 'get') {
        schema = {
          name: f,
          in: 'query',
          type: schema.type
        }
      } else {
        schema = {
          name: f,
          in: 'body',
          schema: schema
        }
      }
      list.push(schema);
      return list;
    }, []
  );
}

module.exports = exports = listQueryFields;
