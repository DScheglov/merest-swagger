
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BookSchema = new Schema({
	title: {type: String, required: true, index: true, descr: 'The title of the book'},
	year: {type: Number, required: true, index: true, descr: 'The year when book issued'},
	author: {
		type: [{type: Schema.Types.ObjectId, required: true, ref: 'Person'}],
		index: true,
    descr: 'The author(s) of book'
	},
	description: { type: String, descr: 'The book\'s annotation.' }
});

module.exports = exports = mongoose.model('Book', BookSchema);
