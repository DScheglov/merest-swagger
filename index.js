'use strict';

var merest = require('merest');
var methods = require('./lib/model-api-app');
if (!merest.ModelAPIExpress.prototype.SWAGGER_SUPPORT) {
  throw new Error('The installed version of merest is not supported. Do: npm update merest');
}
merest.ModelAPIExpress.prototype.swaggerDoc = methods.swaggerDoc;
merest.ModelAPIExpress.prototype.exposeSwagger = methods.exposeSwagger;
merest.ModelAPIExpress.prototype.exposeSwaggerUi = methods.exposeSwaggerUi;

module.exports = exports = merest;
