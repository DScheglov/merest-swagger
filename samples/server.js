var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // to support HTTP OPTIONS
var path = require('path');
var serveStatic = require('serve-static');
var api = require('./api');
require('../index'); // extending ModelAPIExpress

mongoose.connect('mongodb://localhost/merest-sample');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

api.exposeSwagger('/swagger.json', {
    title: 'Library Index',
    host: 'ubuntu-local:1337',
    version: 'v1',
    path: '/api/v1',
    beautify: '  '
})
// api.exposeSwaggerUi({
//   title: 'Library Index',
//   host: 'ubuntu-local:1337',
//   version: 'v1',
//   path: '/api/v1',
//   swaggerUi: '/swagger-ui',
//   apiDocs: '/swagger.json'
// }, (err, api) => {
//   app.use('/api/v1', api);
// })
//

api.exposeSwaggerUi('/swagger-ui');

app.use('/api/v1', api);

// Start the server
app.listen(1337, function() {
  console.log('Express server is listening on port 1337');
  console.log('Swagger UI avaliable');
});
