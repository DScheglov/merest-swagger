'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var StrangeSchema = new Schema({
  n: Number,
  s: String,
  d: Date,
  b: Boolean,
  u: Schema.Types.ObjectId,
  r: {type: Schema.Types.ObjectId, ref: 'Book'},
  nestedDoc: {
    n: Number,
    s: String
  },
  se: {type: String, enum: ['a', 'b', 'c']},
  sr: {type: String, match: /read/i},
  an: [Number],
  as: [String],
  ad: [Date],
  ab: [Boolean],
  au: [Schema.Types.ObjectId],
  ar: [{type: Schema.Types.ObjectId, ref: 'Book'}],
  aNestedDoc: [{
    n: Number,
    s: String
  }],
  rn: {type: Number, required: true},
  rs: {type: String, required: true},
  rd: {type: Date, required: true},
  rb: {type: Boolean, required: true},
  ru: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rr: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Book'
  },
  rNestedDoc: {
    type: {
      n: Number,
      s: String,
      a: {type: Schema.Types.Mixed, required: true, default: {}}
    },
    required: true
  },
  rar: {
    type: [{type: Schema.Types.ObjectId, ref: 'Book'}],
    required: true
  },
  described: {
    type: String,
    description: 'Described field',
    required: true
  },
  anyTypeField: {type: Schema.Types.Mixed}
});

module.exports = exports = mongoose.model('Strange', StrangeSchema);
