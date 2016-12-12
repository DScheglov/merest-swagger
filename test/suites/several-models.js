'use strict';

var async = require('async');
var extendMongoose = require('mongoose-schema-jsonschema');
var mongoose = extendMongoose(require('mongoose'));
var request = require("request");
var util = require("util");
var assert = require('assert');
var spec = require('swagger-tools').specs.v2;

var app = require('../setup/app');
var db = require('../setup/db');
var models = require('../models');
var api = require("merest");

var describeApi = require('../../lib/describe');


describe("Exposing Book & Person: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
        modelAPI.expose(models.Book);
        app.use('/api/v1/', modelAPI);
        swaggerDoc = describeApi(modelAPI);
        next()
      }
    ], done);
  });

  after(function (done) {
    db.close(done);
  });

  it('should return a valid swagger document', function (done) {

    spec.validate(swaggerDoc, function (err, result) {
      assert.ok(!err);
      assert.ok(!result);
      done();
    })

  });

  it('should contain 5 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, [
      '/',
      '/people/', '/people/{id}',
      '/books/', '/books/{id}'
    ]);
    done();
  });

  it('shoild contain 1 operation for root path', function(done) {
    var opers = swaggerDoc.paths['/'];
    assert.deepEqual(Object.keys(opers), ['options']);
    assert.equal(
      opers['options'].responses['200'].schema.$ref,
      '#/definitions/Options'
    );
    done();
  });

  it('shoild contain 3 operation for /people/ path', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    assert.deepEqual(Object.keys(opers), ['options', 'get', 'post']);
    assert.equal(
      opers['options'].responses['200'].schema.$ref,
      '#/definitions/Options'
    );
    assert.deepEqual(
      opers['get'].responses['200'].schema, {
        title: 'List of people',
        type: 'array',
        items: {
          $ref: '#/definitions/Person_Response'
        }
      }
    );
    assert.equal(
      opers['post'].parameters[0].schema.$ref,
      '#/definitions/Person'
    );
    assert.equal(
      opers['post'].responses['201'].schema.$ref,
     '#/definitions/Person_Response'
    );
    done();
  });

  it('shoild contain 3 operation for /people/{id} path', function(done) {
    var opers = swaggerDoc.paths['/people/{id}'];
    assert.deepEqual(Object.keys(opers), ['get', 'post', 'delete']);
    assert.equal(
      opers['get'].responses['200'].schema.$ref,
      '#/definitions/Person_Response'
    );
    assert.equal(opers['post'].parameters[0].name, 'id');
    assert.equal(
      opers['post'].parameters[1].schema.$ref,
      '#/definitions/Person_Update'
    );
    assert.equal(
      opers['post'].responses['200'].schema.$ref,
      '#/definitions/Person_Response'
    );
    assert.equal(
      opers['delete'].responses['200'].schema.$ref,
      '#/definitions/deleteResponse'
    );
    done();
  });

  it('shoild contain 3 operation for /books/ path', function(done) {
    var opers = swaggerDoc.paths['/books/'];
    assert.deepEqual(Object.keys(opers), ['options', 'get', 'post']);
    assert.equal(
      opers['options'].responses['200'].schema.$ref,
      '#/definitions/Options'
    );
    assert.deepEqual(
      opers['get'].responses['200'].schema, {
        title: 'List of books',
        type: 'array',
        items: {
          $ref: '#/definitions/Book_Response'
        }
      }
    );
    assert.equal(
      opers['post'].parameters[0].schema.$ref,
      '#/definitions/Book'
    );
    assert.equal(
      opers['post'].responses['201'].schema.$ref,
     '#/definitions/Book_Response'
    );
    done();
  });

  it('shoild contain 3 operation for /books/{id} path', function(done) {
    var opers = swaggerDoc.paths['/books/{id}'];
    assert.deepEqual(Object.keys(opers), ['get', 'post', 'delete']);
    assert.equal(
      opers['get'].responses['200'].schema.$ref,
      '#/definitions/Book_Response'
    );
    assert.equal(opers['post'].parameters[0].name, 'id');
    assert.equal(
      opers['post'].parameters[1].schema.$ref,
      '#/definitions/Book_Update'
    );
    assert.equal(
      opers['post'].responses['200'].schema.$ref,
      '#/definitions/Book_Response'
    );
    assert.equal(
      opers['delete'].responses['200'].schema.$ref,
      '#/definitions/deleteResponse'
    );
    done();
  });

  it('should contain 11 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'deleteResponse',
      'Person_Response',
      'Person',
      'Person_Update',
      'Book_Response',
      'Book',
      'Book_Update'
    ]);
    done();
  });

});
