var merest = require('merest');
var models = require('./models');

var api = new merest.ModelAPIExpress();
api.expose(models.Book, {
  fields: 'title year author',
  populate: {
    path: 'author',
    select: 'firstName lastName'
  }
});

api.expose(models.Person, {
  fields: 'firstName lastName'
})

module.exports = exports = api;
