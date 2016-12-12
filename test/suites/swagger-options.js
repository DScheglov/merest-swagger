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
        swaggerDoc = describeApi(modelAPI, {
          title: 'Sample API for Person model',
          path: '/'
        });
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

  it('shoild contain info.title', function(done) {
    assert.equal(swaggerDoc.info.title, 'Sample API for Person model');
    done();
  });

  it('shoild\'t contain basePath', function(done) {
    assert.ok(!swaggerDoc.basePath);
    done();
  });

});
