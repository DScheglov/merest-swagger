'use strict';

if (module.parent) {
  var merest = require('merest');
  var methods = require('./lib/model-api-app');
  merest.ModelAPIExpress.prototype.swaggerDoc = methods.swaggerDoc;
  merest.ModelAPIExpress.prototype.exposeSwagger = methods.exposeSwagger;
  merest.ModelAPIExpress.prototype.exposeSwaggerUi = methods.exposeSwaggerUi;
  module.exports = exports = merest;
} else {

}
