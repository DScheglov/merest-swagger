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


describe("Simplest model exposition: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
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

  it('should contain 3 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/{id}']);
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

  it('should contain 8 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'deleteResponse',
      'Person_Response',
      'Person',
      'Person_Update'
    ])
    done();
  });

});

describe("Searching by POST-method: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          search: {
            method: 'post',
            path: 'search'
          }
        });
        app.use('/api/v1/', modelAPI);
        swaggerDoc = describeApi(modelAPI);
        next();
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

  it('should contain 4 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/search', '/people/{id}']);
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

  it('shoild contain 2 operation for /people/ path', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    assert.deepEqual(Object.keys(opers), ['options', 'post']);
    assert.equal(
      opers['options'].responses['200'].schema.$ref,
      '#/definitions/Options'
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

  it('shoild contain 1 operation for /people/search path', function(done) {
    var opers = swaggerDoc.paths['/people/search'];
    assert.deepEqual(Object.keys(opers), ['post']);

    var searchQueryParam = opers['post'].parameters[
      opers['post'].parameters.length - 1
    ];

    assert.deepEqual(searchQueryParam.schema, {
      title: 'Person_Search',
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        email: { type: 'string' },
        isPoet: { type: 'boolean', default: false },
        _id: { type: 'string', format: 'uuid', pattern: '^[0-9a-fA-F]{24}$' },
        __v: { type: 'number' }
      }
    });

    assert.deepEqual(
      opers['post'].responses['200'].schema, {
        title: 'List of people',
        type: 'array',
        items: {
          $ref: '#/definitions/Person_Response'
        }
      }
    );
    done();
  });

});


describe("Strange model exposition: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Strange);
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

});


describe("Model exposition w/o CRUD: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress({ options: false });
        modelAPI.expose(models.Person, {
          create: false,
          update: false,
          search: false,
          delete: false,
          details: false,
          options: false,
          expose: { Reverse: true }
        });
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

});
