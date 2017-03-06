'use strict';

const async = require('async');
const extendMongoose = require('mongoose-schema-jsonschema');
const mongoose = extendMongoose(require('mongoose'));
const request = require("request");
const util = require("util");
const assert = require('assert');
const spec = require('swagger-tools').specs.v2;
const api = require("merest");

const app = require('../setup/app');
const db = require('../setup/db');
const models = require('../models');

const describeApi = require('../../lib/describe');


describe("Restrictions for search by certain fields (HTTP POST): describeApi()", function (done) {

  let swaggerDoc;

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

    assert.equal(opers['get'].parameters.length, 13);

    var searchQueryParam = opers['get'].parameters[3];

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

describe("Restrictions for search by certain fields and operators (HTTP GET): describeApi()", function (done) {

  var swaggerDoc;

  before(function (done) {

    async.waterfall([
      app.init,
      function (next) {
        var modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person, {
          queryFields: {
            _id: { eq: true },
            firstName: { re: true, eq: false }
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
    let opers = swaggerDoc.paths['/people/'];

    assert.equal(opers['get'].parameters.length, 5);

    let searchQueryParam = opers['get'].parameters[3];

    assert.deepEqual(searchQueryParam, {
      name: '_id',
      type: 'string',
      pattern: '^[0-9a-fA-F]{24}$',
      in: 'query'
    });

    searchQueryParam = opers['get'].parameters[4];

    assert.deepEqual(searchQueryParam, {
      name: 'firstName__re',
      type: 'string',
      in: 'query',
      description: 'firstName matches to the regexp represented by a value (/pattern/mods syntax is allowed)'
    });

    done();
  });

});
