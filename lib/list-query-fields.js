'use strict';

function listQueryFields(ctrl) {
  var fields = ctrl.router.queryFields;
  if (fields) {
    fields = Object.keys(fields).filter(f => fields[f]);
  } else {
    fields = Object.keys(ctrl.model.schema.paths);
  }

  if (ctrl.method !== 'get') {
    var param = {
      name: 'searchQuery',
      in: 'body',
      schema: {
        title: `${ctrl.router.model.modelName}_Search`,
        type: 'object'
      }
    };
    param.schema.properties = fields.reduce((props, f) => {
      props[f] = ctrl.model.schema.paths[f].jsonSchema();
      delete props[f].__required;
      return props;
    }, {});
    return param;
  }

  return fields.reduce(
    (list, f) => {
      var schema = ctrl.model.schema.paths[f].jsonSchema();
      if (schema.type === 'object') return list;
      if (schema.type === 'array') {
        schema = schema.items;
        if (schema.type === 'object' || schema.type ==='array') return list;
      }
      var param = {
        name: f,
        in: 'query',
        type: schema.type
      };
      if (schema.description) param.description = schema.description;
      list.push(param);
      return list;
    }, []
  );
}

module.exports = exports = listQueryFields;
