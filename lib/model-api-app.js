'use strict';
var extendMongoose = require('mongoose-schema-jsonschema');
var mongoose = extendMongoose(require('mongoose'));
var serveStatic = require('serve-static');
var _path = require('path');
var cors = require('cors');

var describeApi = require('./describe');

/**
 * swaggerDoc   builds Swagger document for the API
 *
 * @param  {Object} [options]   api description parameters (http://dscheglov.github.io/merest/ModelAPIExpress.html)
 * @param  {String} [options.title]   the title of API
 * @param  {String} [options.path]   the path of the API
 * @param  {String} [options.version]   the API version
 * @param  {String} [options.host]   the host name of the API
 * @return {Object}           Swagger document
 */
function swaggerDoc(options) {
  this.__swaggerDoc = this.__swaggerDoc || describeApi(this, options);
  return this.__swaggerDoc;
};


/**
 * exposeSwagger   exposes the swagger document. If document is not created
 * the method forces model description;
 *
 * @param {String} [path='/swagger.json']   path to mount swagger document
 * @param  {Object} [options]   options for swagger document exposition
 * @param  {boolean} [options.cors=true]   should the swagger doc be exposed with CORS
 * @param  {String} [options.beautify]    the separator for JSON beautifier
 *
 * @return {ModelAPIExpress}         the API object
 */
function exposeSwagger(path, options) {
  if (typeof path !== 'string') {
    options = path;
    path = null;
  }
  path = path || '/swagger.json';
  options = options || {};
  var needCors = options.cors; delete options.cors;
  var beautify = options.beautify; delete options.beautify;
  beautify = beautify === true ? '  ' : beautify;
  this.__swaggerDocURL = path;
  this.__swaggerDocJSON = JSON.stringify(
    this.swaggerDoc(options), null, beautify
  );
  if (needCors !== false) {
    this.get(path, cors(), swaggerJSON.bind(this));
  } else {
    this.get(path, swaggerJSON.bind(this));
  }
  return this;
}


/**
 * exposeSwaggerUi   exposes swagger ui application
 *
 * @param  {String} [path='/swagger-ui']   the path to mount swagger ui app
 * @param  {Object} [options]  options to expose swagger ui
 * @param  {String} [options.swaggerDoc='/swagger.json']  the path to mount swagger document
 * @param  {boolean} [options.cors=true]   should the swagger doc be exposed with CORS
 * @param  {String} [options.beautify]    the separator for JSON beautifier for swagger document
 * @param  {String} [options.title]   the title of API
 * @param  {String} [options.path]   the path of the API
 * @param  {String} [options.version]   the API version
 * @param  {String} [options.host]   the host name of the API
 *
 * @return {ModelAPIExpress}         the API object
 */
function exposeSwaggerUi(path, options) {
  if (typeof path !== 'string') {
    options = path;
    path = null;
  }
  options = options || {};
  var swaggerDoc = options.swaggerDoc;  delete options.swaggerDoc;

  if (!this.__swaggerDocURL) {
    this.exposeSwagger(swaggerDoc || '', options);
  };

  var uiPath = _path.join(__dirname, '../swagger-ui');
  this.__swaggerUiStaticMiddleware = serveStatic(uiPath, {});

  this.__swaggerUiPath = path || '/swagger-ui';
  this.use(this.__swaggerUiPath, swaggerUi.bind(this));

  return this;
};


function swaggerJSON(req, res, next) {
  res.type('application/json');
  res.send(this.__swaggerDocJSON);
}



function swaggerUi(req, res, next) {
  if (req.path === '/') {
    var swaggerApiDocsURL = _path.join(this.mountpath, this.__swaggerDocURL);
    res.setHeader('Swagger-API-Docs-URL', swaggerApiDocsURL);
  }

  return this.__swaggerUiStaticMiddleware(req, res, next);
}



module.exports = exports = {
  swaggerDoc: swaggerDoc,
  exposeSwagger: exposeSwagger,
  exposeSwaggerUi: exposeSwaggerUi
};
