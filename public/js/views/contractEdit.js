var ContractEditView = Backbone.View.extend({

	initialize: function(){
		this.listenTo(this.model, 'change', this.render);
	},

	render: function(){
		//load contract
		this.$el.html(Handlebars.templates.contractedit(this.model.attributes));

		this.delegateEvents({
			'click #submit-edit-contract': 'edit',
			'click #remove-contract': 'delete'
		});
		return this;
	},

	edit: function(){
		this.processForm();

		this.model.save(this.model.attributes,
			{
				success: function(model){
					$('#popup').modal('toggle').find('.modal-content').empty();
				}
			}
		);
	},

	delete: function(){
		if (confirm("Delete contract?")) {
			this.model.destroy({
				success: function(model){
					contracts.remove(model.get('id'));
					$('#close-contract-form').click();
					$('#popup .modal-content').empty();
				}
			});
		}		
	},

	processForm: function(){
		//add new contract
		this.model.set({
			number: this.$el.find('input[name="number"]').val(),
			rate: this.$el.find('input[name="rate"]').val(),
			amount: this.$el.find('input[name="amount"]').val(),
			currency_src: /[^/]*/.exec(this.$el.find('select[name="pair"]').val())[0],
			currency_dest: /[^/]*$/.exec(this.$el.find('select[name="pair"]').val())[0],
			date_buy: this.$el.find('input[name="date_buy"]').val(),
			date_open: this.$el.find('input[name="date_open"]').val(),
			date_close: this.$el.find('input[name="date_close"]').val(),
			comment: this.$el.find('textarea[name="comment"]').val(),
			project: this.$el.find('input[name="project"]').val(),
			object: this.$el.find('input[name="object"]').val(),
		});
	}
});