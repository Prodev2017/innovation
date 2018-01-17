var InvoicesItem = Backbone.Model.extend({
	defaults: {
		id: null,
		number: null,
		amount:null,
		purpose:null,
		supplier:null,
		rate: null,
		date_paid: null
	}
});

var InvoicesCollection = Backbone.Collection.extend({
	model: InvoicesItem,
	url: '/api/invoice'
});