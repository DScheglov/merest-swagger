var merest = require('merest');
var models = require('./models');

var api = new merest.ModelAPIExpress({
  options: false
});
api.expose(models.Book, {
  options: false,
  search: {
    path: '/search',
    method: 'get',
    title: 'Let\'s search for books'
  },
  fields: 'title year author',
  populate: {
    path: 'author',
    select: 'firstName lastName -_id'
  }
});

api.expose(models.Person, {
  options: false,
  fields: 'firstName lastName',
  exposeStatic: {
    emailList: {
      method: 'get',
      title: 'The list of author\'s mails'
    }
  },
  expose: {
    Reverse: true
  }
})

module.exports = exports = api;
