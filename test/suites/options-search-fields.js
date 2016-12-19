'use strict';

var async = require('async');
var extendMongoose = require('mongoose-schema-jsonschema');
var mongoose = extendMongoose(require('mongoose'));
var request = require("request");
var util = require("util");
var assert = require('assert');
var spec = require('swagger-tools').specs.v2;
var api = require("merest");

var app = require('../setup/app');
var db = require('../setup/db');
var models = require('../models');

var describeApi = require('../../lib/describe');


describe("Restrictions for search by certain fields (HTTP POST): describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {
    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          search: {
            path: 'search',
            method: 'post'
          },
          queryFields: {
            firstName: true
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
        firstName: { type: 'string' }
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

describe("Restrictions for search by certain fields (HTTP GET): describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          queryFields: {
            firstName: true
          }
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

  it('should contain 3 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/{id}']);
    done();
  });

  it('shoild contain correct description for search operation', function(done) {
    var opers = swaggerDoc.paths['/people/'];

    assert.equal(opers['get'].parameters.length, 4);

    var searchQueryParam = opers['get'].parameters[
      opers['get'].parameters.length - 1
    ];

    assert.deepEqual(searchQueryParam, {
      name: 'firstName',
      type: 'string',
      in: 'query'
    });

    assert.deepEqual(
      opers['get'].responses['200'].schema, {
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
