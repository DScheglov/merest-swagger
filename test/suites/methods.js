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


describe("Exposing static method [POST]: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          exposeStatic: {
            emailList: true
          }
        });
        app.use('/api/v1', modelAPI);
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

  it('should contain 4 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/email-list', '/people/{id}']);
    done();
  });

  it('shoild contain 1 operation for /people/email-list', function(done) {
    var opers = swaggerDoc.paths['/people/email-list'];
    assert.equal(opers['post'].operationId, 'Person_statics_emailList');
    assert.deepEqual(Object.keys(opers), ['post']);
    assert.deepEqual(
      opers['post'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });


  it('should contain 9 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'ANY',
      'deleteResponse',
      'Person_Response',
      'Person',
      'Person_Update'
    ])
    done();
  });

});

describe("Exposing static method [GET]: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          exposeStatic: {
            emailList: {
              method: 'get',
              path: 'mail-list'
            }
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

  it('should contain 4 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/mail-list', '/people/{id}']);
    done();
  });

  it('shoild contain 1 operation for /people/mail-list', function(done) {
    var opers = swaggerDoc.paths['/people/mail-list'];
    assert.deepEqual(Object.keys(opers), ['get']);
    assert.deepEqual(
      opers['get'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });


  it('should contain 9 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'ANY',
      'deleteResponse',
      'Person_Response',
      'Person',
      'Person_Update'
    ])
    done();
  });

});


describe("Exposing instance methods [GET]: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          expose: {
            Reverse: { method: 'get' },
            toUpperCase: { method: 'get' }
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

  it('should contain 5 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, [
      '/', '/people/', '/people/{id}',
      '/people/{id}/reverse',
      '/people/{id}/to-upper-case'
    ]);
    done();
  });

  it('shoild contain 1 operation for /people/{id}/reverse', function(done) {
    var opers = swaggerDoc.paths['/people/{id}/reverse'];
    assert.deepEqual(Object.keys(opers), ['get']);
    assert.deepEqual(
      opers['get'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });

  it('shoild contain 1 operation for /people/{id}/to-upper-case', function(done) {
    var opers = swaggerDoc.paths['/people/{id}/to-upper-case'];
    assert.deepEqual(Object.keys(opers), ['get']);
    assert.deepEqual(
      opers['get'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });

  it('should contain 9 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'ANY',
      'deleteResponse',
      'Person_Response',
      'Person',
      'Person_Update'
    ])
    done();
  });

});

describe("Exposing all methods [POST]: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          expose: { '*': true },
          exposeStatic: { '*': true }
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

  it('should contain 6 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, [
      '/', '/people/',
      '/people/email-list',
      '/people/{id}',
      '/people/{id}/to-upper-case',
      '/people/{id}/reverse'
    ]);
    done();
  });

  it('shoild contain 1 operation for /people/email-list', function(done) {
    var opers = swaggerDoc.paths['/people/email-list'];
    assert.deepEqual(Object.keys(opers), ['post']);
    assert.deepEqual(
      opers['post'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });

  it('shoild contain 1 operation for /people/{id}/reverse', function(done) {
    var opers = swaggerDoc.paths['/people/{id}/reverse'];
    assert.deepEqual(Object.keys(opers), ['post']);
    assert.deepEqual(
      opers['post'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });

  it('shoild contain 1 operation for /people/{id}/to-upper-case', function(done) {
    var opers = swaggerDoc.paths['/people/{id}/to-upper-case'];
    assert.deepEqual(Object.keys(opers), ['post']);
    assert.deepEqual(
      opers['post'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });

  it('should contain 9 model definitions', function(done) {
    var models = Object.keys(swaggerDoc.definitions);
    assert.deepEqual(models, [
      'modelAPIError_E4xx',
      'modelAPIError_E422',
      'modelAPIError_E500',
      'Options',
      'ANY',
      'deleteResponse',
      'Person_Response',
      'Person',
      'Person_Update'
    ])
    done();
  });

});


describe("Exposing new method static method [GET]: describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          expose: {
            showMail: {
              path: '/mail',
              method: 'get',
              exec: function(options, cb) {
                cb({mail: this.email});
              }
            }
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

  it('should contain 4 paths', function(done) {
    var paths = Object.keys(swaggerDoc.paths);
    assert.deepEqual(paths, ['/', '/people/', '/people/{id}', '/people/{id}/mail']);
    done();
  });

  it('shoild contain 1 operation for /people/{id}/mail', function(done) {
    var opers = swaggerDoc.paths['/people/{id}/mail'];
    assert.deepEqual(Object.keys(opers), ['get']);
    assert.deepEqual(
      opers['get'].responses['200'].schema,
      { $ref: '#/definitions/ANY' }
    );
    done();
  });

});
