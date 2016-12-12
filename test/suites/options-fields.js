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


describe("Common fields restrictios for list and instance: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {
    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
    		  fields: {
    			  _id: false,
    			  firstName: true,
    			  email: true
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

  it('should contain 3 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/{id}']);
    done();
  });

});

describe("Separate fields restrictios for list and instance: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {
    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person,{
          fields: {
            _id: false,
            firstName: true,
            email: true
          },
          search: {
            fields: {
              lastName: true
            }
          },
          create: {
            fields: '_id'
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

  it('should contain 3 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/{id}']);
    done();
  });

  it('should contain 10 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'deleteResponse',
      'searchFor_people_Response',
      'Person',
      'create_Person_Response',
      'Person_Response',
      'Person_Update'
    ])
    done();
  });

});
