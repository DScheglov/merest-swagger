var async = require('async');
var mongoose = require('mongoose');
var request = require("request");
var util = require("util");
var assert = require('assert');

var app = require('../setup/app');
var db = require('../setup/db');
var models = require('../models');
var api = require('merest');
var describeApi = require('../../index');
var modelAPI;

var testPort = 30023;
var testUrl = 'http://localhost:' + testPort;

describe("describe(modelAPI)", function (done) {

  beforeEach(function (done) {

    async.waterfall([
      app.init, db.init,
      db.fixtures.bind(null, {
        Person: '../fixtures/people'
      }),
      function (next) {
        modelAPI = new api.ModelAPIExpress();
        modelAPI.expose(models.Person);
        app.use('/api/v1/', modelAPI);
        app.listen(testPort, next);
      }
    ], done);
  });

  afterEach(function (done) {
    async.waterfall([db.close, app.close], done)
  });


  it("should return swagger documentation", function (done) {
    var swaggerDoc = describeApi(modelAPI);
    console.log(JSON.stringify(swaggerDoc, null, '  '));
    done();
  });

});
