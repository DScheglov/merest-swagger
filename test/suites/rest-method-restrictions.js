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


describe("Readonly exposition: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress({
          options: false
        });
        modelAPI.expose(models.Person, {
          options: false,
          create: false,
          update: false,
          delete: false
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
    });
  });

  it('should contain 2 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/people/', '/people/{id}']);
    done();
  });

  it('shoild contain 1 operation for /people/ path', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    assert.deepEqual(Object.keys(opers), ['get']);

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

  it('shoild contain 1 operation for /people/{id} path', function(done) {
    var opers = swaggerDoc.paths['/people/{id}'];
    assert.deepEqual(Object.keys(opers), ['get']);
    assert.equal(
      opers['get'].responses['200'].schema.$ref,
      '#/definitions/Person_Response'
    );
    done();
  });

  it('should contain 5 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E500',
      'Person_Response'
    ])
    done();
  });

});
