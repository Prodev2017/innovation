var InvoicesListView = Backbone.View.extend({

	initialize: function () {
		this.listenTo(this.collection, 'reset', this.render);
		this.listenTo(this.collection, 'add', this.render);
		this.listenTo(this.collection, 'change', this.render);
		this.listenTo(this.collection, 'remove', this.render);
	},

	render: function () {

		this.$el.html(Handlebars.templates.invoiceslist(this.collection.models));
		
		// this.invoicesList();

		return this;
	},

	invoicesList: function () {

		console.log('===========', this.collection.models);
		$('#invoices_list').html(''); //clear div

		var list = [];
	

		for (i in this.collection.models) {
			var item = this.collection.models[i].attributes;
			console.log(item);
			list += `
			<tr>
			<td class="a-center ">
				<input type="checkbox" class="flat" name="table_records">
			</td>
			<td>02/11/16</td>
			<td>${item.purpose}</td>
			<td>${item.supplier}</td>
			<td class="no-ws">${item.amount}</td>
			<td>1,10680</td>
			<td class="text-ocws-red">-0,15%</td>
			<td>30/07/17</td>
			<td class="project_progress">
				<div class="progress progress_sm">
					<div class="progress-bar bg-green" role="progressbar" data-transitiongoal="31"></div>
				</div>
				<small>31% Complete</small>
			</td>
			<td class="text-ocws-red no-ws">-16 858,15€</td>
			<td class="text-ocws-green no-ws">39 846,15€</td>
			</tr>
			`
		}
		$('#invoices_list').html(list);
	}
});