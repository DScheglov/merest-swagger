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


describe("Populating author of Book: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
        modelAPI.expose(models.Book, { populate: 'author' });
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

  it('should contain schema for populazed authof of book', function(done) {
    var Book_Response = swaggerDoc.definitions.Book_Response;
    var Book_Update = swaggerDoc.definitions.Book_Update;
    var Person_jsonSchema = models.Person.jsonSchema();
    delete Person_jsonSchema.required;

    assert.deepEqual(
      Book_Response.properties.author.items,
      Object.assign({
        'x-ref': 'Person',
        'description': 'Refers to Person'
      }, Person_jsonSchema)
    );

    assert.deepEqual(Book_Update.properties.author.items, {
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
      'x-ref': 'Person',
      'description': 'Refers to Person'
    });
    done();
  });

});
