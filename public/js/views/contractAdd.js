var ContractAddView = Backbone.View.extend({

	render: function(){
		//load contract
		this.$el.html(Handlebars.templates.contractnew());

		this.delegateEvents({
			'click #submit-new-contract': 'save'
		});
		return this;
	},

	save: function(){
		this.processForm();

		this.model.save(this.model.attributes,
			{
				url: '/api/contract',
				
				success: function(model){
					contracts.add(model);
					$('#popup').modal('toggle').find('.modal-content').empty();
				}
			}
		);
	},

	processForm: function(){
		//validate form


		//add new contract
		this.model.set({
			id: null,
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
			object: this.$el.find('input[name="object"]').val()
		}, {merge: false});
	}

});