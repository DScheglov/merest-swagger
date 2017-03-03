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
    assert.deepEqual(params.map(p => p.name).sort(), [
      '__v',
      '__v__ex',
      '__v__gt',
      '__v__gte',
      '__v__in',
      '__v__lt',
      '__v__lte',
      '__v__ne',
      '__v__nin',
      '_id',
      '_id__ex',
      '_id__in',
      '_id__ne',
      '_id__nin',
      '_skip',
      '_sort',
      'email',
      'email__ex',
      'email__gt',
      'email__gte',
      'email__in',
      'email__lt',
      'email__lte',
      'email__ne',
      'email__nin',
      'email__re',
      'firstName',
      'firstName__ex',
      'firstName__gt',
      'firstName__gte',
      'firstName__in',
      'firstName__lt',
      'firstName__lte',
      'firstName__ne',
      'firstName__nin',
      'firstName__re',
      'isPoet',
      'isPoet__ex',
      'lastName',
      'lastName__ex',
      'lastName__gt',
      'lastName__gte',
      'lastName__in',
      'lastName__lt',
      'lastName__lte',
      'lastName__ne',
      'lastName__nin',
      'lastName__re'
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

    assert.deepEqual(params.map(p => p.name).sort(), [
      '__v',
      '__v__ex',
      '__v__gt',
      '__v__gte',
      '__v__in',
      '__v__lt',
      '__v__lte',
      '__v__ne',
      '__v__nin',
      '_id',
      '_id__ex',
      '_id__in',
      '_id__ne',
      '_id__nin',
      '_limit',
      '_sort',
      'email',
      'email__ex',
      'email__gt',
      'email__gte',
      'email__in',
      'email__lt',
      'email__lte',
      'email__ne',
      'email__nin',
      'email__re',
      'firstName',
      'firstName__ex',
      'firstName__gt',
      'firstName__gte',
      'firstName__in',
      'firstName__lt',
      'firstName__lte',
      'firstName__ne',
      'firstName__nin',
      'firstName__re',
      'isPoet',
      'isPoet__ex',
      'lastName',
      'lastName__ex',
      'lastName__gt',
      'lastName__gte',
      'lastName__in',
      'lastName__lt',
      'lastName__lte',
      'lastName__ne',
      'lastName__nin',
      'lastName__re'
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
    assert.deepEqual(params.map(p => p.name).sort(), [
      '__v',
      '__v__ex',
      '__v__gt',
      '__v__gte',
      '__v__in',
      '__v__lt',
      '__v__lte',
      '__v__ne',
      '__v__nin',
      '_id',
      '_id__ex',
      '_id__in',
      '_id__ne',
      '_id__nin',
      '_limit',
      '_skip',
      'email',
      'email__ex',
      'email__gt',
      'email__gte',
      'email__in',
      'email__lt',
      'email__lte',
      'email__ne',
      'email__nin',
      'email__re',
      'firstName',
      'firstName__ex',
      'firstName__gt',
      'firstName__gte',
      'firstName__in',
      'firstName__lt',
      'firstName__lte',
      'firstName__ne',
      'firstName__nin',
      'firstName__re',
      'isPoet',
      'isPoet__ex',
      'lastName',
      'lastName__ex',
      'lastName__gt',
      'lastName__gte',
      'lastName__in',
      'lastName__lt',
      'lastName__lte',
      'lastName__ne',
      'lastName__nin',
      'lastName__re'
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
