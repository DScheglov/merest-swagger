'use strict';

module.exports = exports = buildQuery;

function buildQuery(ctrl) {
  var Q = ctrl.model.find();
  var fields = ctrl.router.option('search', 'fields');
  var populate = ctrl.router.option('search', 'populate');
  if (fields) Q.select(fields);
  if (populate) Q.populate(populate);
  return Q;
};
