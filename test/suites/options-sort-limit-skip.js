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


describe("Limitation disabled: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          limit: false
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

  it('shoildn\'t contain _limit parameter in search parameter list', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    var params = opers['get'].parameters;

    assert.deepEqual(params.map(p => p.name), [
      '_sort',
      '_skip',
      'firstName',
      'lastName',
      'email',
      'isPoet',
      '_id',
      '__v'
    ]);
    done();
  });

});

describe("Skipping disabled: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          skip: false
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

  it('shoildn\'t contain _skip parameter in search parameter list', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    var params = opers['get'].parameters;

    assert.deepEqual(params.map(p => p.name), [
      '_sort',
      '_limit',
      'firstName',
      'lastName',
      'email',
      'isPoet',
      '_id',
      '__v'
    ]);
    done();
  });

});

describe("Sorting disabled: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          sort: false
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

  it('shoildn\'t contain _sort parameter in search parameter list', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    var params = opers['get'].parameters;

    assert.deepEqual(params.map(p => p.name), [
      '_limit',
      '_skip',
      'firstName',
      'lastName',
      'email',
      'isPoet',
      '_id',
      '__v'
    ]);
    done();
  });

});

describe("Search configured as simple List: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          sort: false,
          limit: false,
          skip: false,
          queryFields: {}
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

  it('shoildn\'t contain parameter list for search end point', function(done) {
    var opers = swaggerDoc.paths['/people/'];
    assert.ok(!opers['get'].parameters);
    done();
  });

});
