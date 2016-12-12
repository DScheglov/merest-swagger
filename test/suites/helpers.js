var assert = require('assert');
var helpers = require('../../lib/helpers');

describe('evalStr', function() {

  it('should evaluate templated string with ctrl', function() {
    assert.equal(
      helpers.evalStr('`The controller name is ${ctrl.name}`', {name: 'Controller'}),
      'The controller name is Controller'
    )
  });

  it('should pass error when templated string refers to an undefined', function() {
    assert.equal(
      helpers.evalStr('`The controller name is ${ctrl1.name}`', {name: 'Controller'}),
      'ERROR (ctrl1 is not defined): `The controller name is ${ctrl1.name}`'
    )
  });

  it('should return the same value if passed number', function() {
    assert.equal(
      helpers.evalStr(10, {name: 'Controller'}),
      10
    );
  });

  it('should return the same value if passed array', function() {
    assert.deepEqual(
      helpers.evalStr([], {name: 'Controller'}),
      []
    );
  });

  it('should return the same value if passed object', function() {
    assert.deepEqual(
      helpers.evalStr({x: 1}, {name: 'Controller'}),
      {x: 1}
    );
  });

  it('should return string without evaluation', function() {
    assert.equal(
      helpers.evalStr('hero', {name: 'Controller'}),
      'hero'
    );
  });

  it('should return undefined if undefined passed', function() {
    assert.equal(
      helpers.evalStr(undefined, {name: 'Controller'}),
      undefined
    );
  });

});

describe('evalStrApi', function() {

  it('should evaluate templated string with ctrl', function() {
    assert.equal(
      helpers.evalStrApi('`The api name is ${api.name}`', {name: 'API'}),
      'The api name is API'
    )
  });

  it('should pass error when templated string refers to an undefined', function() {
    assert.equal(
      helpers.evalStrApi('`The api name is ${api1.name}`', {name: 'Controller'}),
      'ERROR (api1 is not defined): `The api name is ${api1.name}`'
    )
  });

  it('should return the same value if passed number', function() {
    assert.equal(
      helpers.evalStrApi(10, {name: 'API'}),
      10
    );
  });

  it('should return the same value if passed array', function() {
    assert.deepEqual(
      helpers.evalStrApi([], {name: 'API'}),
      []
    );
  });

  it('should return the same value if passed object', function() {
    assert.deepEqual(
      helpers.evalStrApi({x: 1}, {name: 'API'}),
      {x: 1}
    );
  });


  it('should return string without evaluation', function() {
    assert.equal(
      helpers.evalStrApi('hero', {name: 'API'}),
      'hero'
    );
  });

  it('should return undefined if undefined passed', function() {
    assert.equal(
      helpers.evalStrApi(undefined, {name: 'API'}),
      undefined
    );
  });

});
