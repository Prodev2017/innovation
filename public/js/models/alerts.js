var AlertsItem = Backbone.Model.extend({
	defaults: {
		id: null,
		currency_src: null,
		currency_dest: null,
		rate_create: null,
		rate_ideal: null,
		rate_directional: null,
		rate_limit: null,
		amount: null,
		date_expire: null,
		date_disable: null,
		invoice_id: null
	}
});

var AlertsCollection = Backbone.Collection.extend({
	model: AlertsItem,
	url: '/api/alert'
});