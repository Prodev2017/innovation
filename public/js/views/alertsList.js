
var AlertView = Backbone.View.extend({
	tagName: 'tr',
	attributes: function () {
		return {
			class: "player-" + this.model.cid
		};
	},
	events: {
		'click a#remove-alert': 'cancel'
	},
	initialize: function () {
		this.model.on('change', this.render, this);
		this.model.on('remove', this.remove, this);
	},
	render: function () {
		var item = this.model.attributes;
		var today = moment();
		var ofdays = moment(item.date_expire);
		var $node = `					
						<td class="font-bold">${item.Invoice.supplier} ${item.Invoice.number}</td>
						<td>${item.currency_dest}  > ${item.currency_src}</td>
						<td class="font-bold">1,1377</td>
						<td>${item.rate_directional}</td>
						<td>${item.amount}$</td>
						<td class="font-bold">${ofdays.diff(today,'days')} jours</td>
						<td>${moment(item.date_expire).format('DD/MM/YYYY')}</td>
						<td><a href="javascript:;" class="text-ocws-orange">Modifier <br />Enregistrer l'achat</a></td>
						<td class=" last"><a href="javascript:;" id="remove-alert"><i class="fa fa-trash"></i></a></td>
				`
		this.$el.html($node);
		return this;
	},
	cancel: function () {

		this.model.destroy({
			success: function (model) {
				this.model.set({ canceled: true });
				this.collection.remove(this.model);
			}
		});

	}
})


var AlertsListView = Backbone.View.extend({

	initialize: function () {
		this.collection.on('sync', this.render, this);
		// this.listenTo(this.collection, 'reset', this.render);
		// this.listenTo(this.collection, 'add', this.render);
		// this.listenTo(this.collection, 'change', this.render);
		// this.listenTo(this.collection, 'remove', this.render);
	},

	render: function () {
		// this.$el.html(Handlebars.templates.alertslist(this.collection.models));
		this.collection.forEach(this.alertsList, this);
		// this.alertsList();

		return this;
	},
	alertsList: function (model) {

		var alertView = new AlertView({
			model: model,
			collection: this.collection
		});
		$('#alert_body').append(alertView.render().el);
	},
	remove: function () {
		this.$el.remove();
	}
	// $('#alert_body').html(''); //clear div

	// 	var list = [];
	// 	console.log('alert');

	// 	for (i in this.collection.models) {
	// 		var item = this.collection.models[i].attributes;
	// 		var $node = `
	// 			< tr class="even" >
	// 				<td class="font-bold">ALERTE 1</td>
	// 				<td>EUR > USD</td>
	// 				<td class="font-bold">1,1377</td>
	// 				<td>1,1200</td>
	// 				<td>123 450 000$</td>
	// 				<td class="font-bold">139 jours</td>
	// 				<td>30/11/2017</td>
	// 				<td><a href="javascript:;" class="text-ocws-orange">Modifier <br />Enregistrer l'achat</a></td>
	// 				<td class=" last"><a href="javascript:;" id="remove-alert"><i class="fa fa-trash"></i></a></td>
	// 		</tr >`
	// 		list += $node;
	// 		$node.on('click', function () {
	// 			console.log('sss');
	// 		})
	// 	}
	// 	$('#alert_body').html(list);
	// },
	// delete: function () {
	// 	console.log('alert delete');
	// }

});