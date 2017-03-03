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


describe("readonly: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          readonly: '_id __v'
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


  it('should containt model Person without _id and __v', function(done) {
    let PersonSchema = swaggerDoc.definitions.Person;
    assert.ok(PersonSchema.properties._id == undefined);
    assert.ok(PersonSchema.properties.__v == undefined);
    done();
  });

  it('should containt model Person_Update without _id and __v', function(done) {
    let PersonSchema = swaggerDoc.definitions.Person_Update;
    assert.ok(PersonSchema.properties._id == undefined);
    assert.ok(PersonSchema.properties.__v == undefined);
    done();
  });

});
