var InvoiceEditView = Backbone.View.extend({

	initialize: function () {
		this.listenTo(this.model, 'change', this.render);
	},

	render: function () {
		//load invoice
		this.$el.html(Handlebars.templates.invoiceedit(this.model.attributes));

		// this.delegateEvents({
		// 	'click #submit-edit-invoice': 'edit',
		// 	'click #remove-invoice': 'delete'
		// });
		return this;
	},

	edit: function () {
		console.log('invoice update');
		this.processForm();

		this.model.save(this.model.attributes,
			{
				success: function (model) {
					$('#popup').modal('toggle').find('.modal-content').empty();
				}
			}
		);
	},

	delete: function () {
		if (confirm("Delete invoice?")) {
			this.model.destroy({
				success: function (model) {
					invoices.remove(model.get('id'));
					$('#close-invoice-form').click();
					$('#popup .modal-content').empty();
				}
			});
		}
	},

	processForm: function () {
		//add new contract
		this.model.set({
			number: this.$el.find('input[name="number"]').val(),
			rate: this.$el.find('input[name="rate"]').val(),
			amount: this.$el.find('input[name="amount"]').val(),
			purpose: this.$el.find('input[name="purpose"]').val(),
			date_paid: this.$el.find('input[name="date_paid"]').val(),
			supplier: this.$el.find('input[name="supplier"]').val(),
		});
	}
});