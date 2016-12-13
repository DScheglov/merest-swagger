'use strict';

var merest = require('../index'); // extends ModelAPIExpress and returns merest
var models = require('./models');

var api = new merest.ModelAPIExpress({ options: false });

api.expose(models.Book, {
  fields: 'title year author',
  populate: { path: 'author', select: 'firstName lastName -_id' },
  search: { method: 'get', title: 'Let\'s search for books', populate: {} },
  options: false
});

api.expose(models.Person, {
  fields: 'firstName lastName',
  exposeStatic: {
    emailList: { method: 'get', title: 'The list of author\'s mails' }
  },
  expose: { Reverse: true },
  options: false
});

api.exposeSwaggerUi('/swagger-ui', {
  title: 'Library Index',
  host: 'ubuntu-local:1337',
  version: 'v1',
  path: '/api/v1',
  swaggerDoc: '/api-docs',
  beautify: true
});

module.exports = exports = api;
