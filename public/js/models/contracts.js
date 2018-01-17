var ContractItem = Backbone.Model.extend({
	defaults: {
		id: null,
		number: null,
		rate: null,
		amount: null,
		currency_src: null,
		currency_dest: null,
		date_buy: null,
		date_open: null,
		date_close: null,
		comment: null,
		project: null,
		object: null
	}
});

var ContractsCollection = Backbone.Collection.extend({
	model: ContractItem,
	url: '/api/contract'
});