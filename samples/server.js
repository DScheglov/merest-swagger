var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // to support HTTP OPTIONS
var api = require('./api');
var describeApi = require('../index');
var swaggerTools = require('swagger-tools')

mongoose.connect('mongodb://localhost/merest-sample');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());



var swaggerDoc = describeApi(api, {
  title: 'Library Index',
  version: 'v1',
  host: 'ubuntu-local:1337',
  path: '/api/v1'
});

app.use('/api/v1/api-docs', function(res, res) {
  res.json(swaggerDoc);
});

swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
  // Serve the Swagger documents and Swagger UI
  api.use(middleware.swaggerUi({
    swaggerUi: '/swagger-ui'
  }));
  app.use('/api/v1', api); // exposing our API

});

// Start the server
app.listen(1337, function(){
  console.log('Express server is listening on port 1337');
  console.log('Swagger UI avaliable');
});
