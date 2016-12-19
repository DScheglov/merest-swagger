[![Build Status](https://travis-ci.org/DScheglov/merest-swagger.svg?branch=master)](https://travis-ci.org/DScheglov/merest-swagger)
[![Coverage Status](https://coveralls.io/repos/github/DScheglov/merest-swagger/badge.svg?branch=master)](https://coveralls.io/github/DScheglov/merest-swagger?branch=master)
# merest-swagger

The extension of `merest` that provides SWAGGER documentation support.

## Installation

```shell
npm i --save merest-swagger
```

**merest-swagger** doesn't install the **merest**, so you should do it by yourself.

## Recommended Installation

```shell
npm i --save merest merest-swagger mongoose express body-parser method-override
```

## Documentation
[http://dscheglov.github.io/merest/](http://dscheglov.github.io/merest/)

## Example

```javascript
'use strict';

const merest = require('merest-swagger'); // to support SwaggerUI
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

// Defining model
const mongoose = require('mongoose');
const Contact = mongoose.model('Contact', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  tags: [String]
}));
mongoose.connect('mongodb://localhost/merest-sample');

const app = express();
// Creating the Express application to serve API
const api = new merest.ModelAPIExpress({
  title: 'Contact List API',
  host: 'localhost:8000', // Assign correct host that could be accessed from your network
  path: '/api/v1',
  options: false // we do not need the OPTIONS any more
});

app.use(bodyParser.json()); // Parsing JSON-bodies
app.use(methodOverride()); // Supporting HTTP OPTIONS and HTTP DELETE methods

api.expose(Contact); // Exposing our API
api.exposeSwaggerUi(); // Exposing swagger-ui

app.use('/api/v1', api); // mounting API as usual sub-application

app.listen(8000, () => {
  console.log('Express server listening on port 8000');
});
```

Going to **swagger-ui** in browser: `http://localhost:8000/swagger-ui`

![swagger-ui](http://dscheglov.github.io/merest/images/merest-swagger.gif)
