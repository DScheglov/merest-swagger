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

var api = require('../../index'); // require('merest-swagger');

var TEST_PORT = 32001;
var TEST_URL = `http://127.0.0.1:${TEST_PORT}`;

describe("ModelAPIExpress extended", function() {

  it('swaggerDoc should be in ModelAPIExpress.prototype', function() {
    assert.ok(api.ModelAPIExpress.prototype.swaggerDoc);
    assert.ok(api.ModelAPIExpress.prototype.swaggerDoc instanceof Function);
  });

  it('exposeSwagger should be in ModelAPIExpress.prototype', function() {
    assert.ok(api.ModelAPIExpress.prototype.exposeSwagger);
    assert.ok(api.ModelAPIExpress.prototype.exposeSwagger instanceof Function);
  });

  it('exposeSwaggerUi should be in ModelAPIExpress.prototype', function() {
    assert.ok(api.ModelAPIExpress.prototype.exposeSwaggerUi);
    assert.ok(api.ModelAPIExpress.prototype.exposeSwaggerUi instanceof Function);
  });

});

describe("ModelAPIExpress.swaggerDoc()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init, db.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
        swaggerDoc = modelAPI.swaggerDoc({
          title: 'Merest Test API',
          path: '/api/v1/'
        });
        app.use('/api/v1/', modelAPI);
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

  it('should return correct basePath and info.title', function (done) {
    assert.equal(swaggerDoc.basePath, '/api/v1');
    assert.equal(swaggerDoc.info.title, 'Merest Test API');
    done();
  });

});

describe("ModelAPIExpress.exposeSwagger()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
        swaggerDoc = modelAPI.swaggerDoc({
          title: 'Merest Test API',
          path: '/api/v1/'
        });
        swaggerDoc = JSON.parse(JSON.stringify(swaggerDoc));
        modelAPI.exposeSwagger();
        app.use('/api/v1/', modelAPI);
        app.listen(TEST_PORT, next);
      }
    ], done);
  });

  after(function (done) {
    app.close(done);
  });

  it ('GET /api/v1/swagger.json 200 -- should return swaggerDoc', function (done) {

    request.get({
      url: util.format('%s/api/v1/swagger.json', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      if (typeof(body) == "string") {
        body = JSON.parse(body);
      }
      assert.deepEqual(body, swaggerDoc);
      done();
    });

  });

  it ('GET /api/v1/swagger.json 200 -- should return correct swagger document', function (done) {

    request.get({
      url: util.format('%s/api/v1/swagger.json', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      if (typeof(body) == "string") {
        body = JSON.parse(body);
      }
      spec.validate(body, function (err, result) {
        assert.ok(!err);
        assert.ok(!result);
        done();
      })
    });

  });

});

describe("Options: ModelAPIExpress.exposeSwagger()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
        swaggerDoc = modelAPI.swaggerDoc({
          title: 'Merest Test API',
          path: '/api/v1/'
        });
        swaggerDoc = JSON.parse(JSON.stringify(swaggerDoc));
        modelAPI.exposeSwagger('/api-docs', {
          beautify: true
        });
        app.use('/api/v1/', modelAPI);
        app.listen(TEST_PORT, next);
      }
    ], done);
  });

  after(function (done) {
    app.close(done);
  });

  it ('GET /api/v1/api-docs 200 -- should return swaggerDoc', function (done) {

    request.get({
      url: util.format('%s/api/v1/api-docs', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      if (typeof(body) == "string") {
        body = JSON.parse(body);
      }
      assert.deepEqual(body, swaggerDoc);
      done();
    });

  });

  it ('GET /api/v1/swagger.json 200 -- should return correct swagger document', function (done) {

    request.get({
      url: util.format('%s/api/v1/api-docs', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      if (typeof(body) == "string") {
        body = JSON.parse(body);
      }
      spec.validate(body, function (err, result) {
        assert.ok(!err);
        assert.ok(!result);
        done();
      })
    });

  });

});


describe("ModelAPIExpress.exposeSwaggerUi()", function (done) {

  before(function (done) {

    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress({
          title: 'Merest Test API',
          path: '/api/v1/'
        });
        modelAPI.expose(models.Person);
        modelAPI.exposeSwaggerUi(null, {
          cors: false
        });
        app.use('/api/v1/', modelAPI);
        app.listen(TEST_PORT, next);
      }
    ], done);
  });

  after(function (done) {
    app.close(done);
  });

  it ('GET /api/v1/swagger.json 200 -- should return correct swagger document', function (done) {

    request.get({
      url: util.format('%s/api/v1/swagger.json', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      if (typeof(body) == "string") {
        body = JSON.parse(body);
      }
      spec.validate(body, function (err, result) {
        assert.ok(!err);
        assert.ok(!result);
        done();
      })
    });

  });

  it ('GET /api/v1/swagger-ui 200 -- should return swagger-ui page', function (done) {

    request.get({
      url: util.format('%s/api/v1/swagger-ui', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      assert.ok(body.indexOf('<title>Swagger UI</title>') > 0);
      done();
    });

  });

  it ('GET /api/v1/swagger-ui/some-thing 405 -- should return 405', function (done) {

    request.get({
      url: util.format('%s/api/v1/swagger-ui/some-thing', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 405);
      done();
    });

  });

});

describe("ModelAPIExpress.exposeSwaggerUi()", function (done) {

  before(function (done) {

    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress({
          title: 'Merest Test API',
          path: '/api/v1/'
        });
        modelAPI.expose(models.Person);
        modelAPI.exposeSwagger('/api-docs')
        modelAPI.exposeSwaggerUi('/api-ui');
        app.use('/api/v1/', modelAPI);
        app.listen(TEST_PORT, next);
      }
    ], done);
  });

  after(function (done) {
    app.close(done);
  });

  it ('GET /api/v1/api-docs 200 -- should return correct swagger document', function (done) {

    request.get({
      url: util.format('%s/api/v1/api-docs', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      if (typeof(body) == "string") {
        body = JSON.parse(body);
      }
      spec.validate(body, function (err, result) {
        assert.ok(!err);
        assert.ok(!result);
        done();
      })
    });

  });

  it ('GET /api/v1/api-ui 200 -- should return swagger-ui page', function (done) {

    request.get({
      url: util.format('%s/api/v1/api-ui', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 200);
      assert.ok(body.indexOf('<title>Swagger UI</title>') > 0);
      done();
    });

  });

  it ('GET /api/v1/swagger-ui/some-thing 405 -- should return 405', function (done) {

    request.get({
      url: util.format('%s/api/v1/swagger-ui/some-thing', TEST_URL)
    }, function (err, res, body) {
      assert.ok(!err);
      assert.equal(res.statusCode, 405);
      done();
    });

  });

});
