var ContractsListView = Backbone.View.extend({	

	initialize: function(){
 		//this.listenTo(this.collection, 'sync', this.render); 		
		this.listenTo(this.collection, 'update', this.render);
		this.listenTo(this.collection, 'change', this.render);
	},

	render: function(){

		this.constructGantt();

		return this;
	},

	constructGantt: function(){
		$('#gantt').html(''); //clear div

		var list = [];

		for(i in this.collection.models){
			var item = this.collection.models[i].attributes;
			var d_open = moment(item.date_open).format('YYYY-MM-DD');
			var d_close = moment(item.date_close).format('YYYY-MM-DD');

			list.push({
				axisLabel: item.number,
	              bar: {
	                dateStart: d_open,
	                dateEnd: d_close,
	                levels: [
	                    {
	                        level: 0.92,
	                        class: 'step-1'
	                    }
	                ],
	              },
	              attributes: {
	                'data-contract-id': item.id,
	              }
			});
		}

		Gantt('#gantt', {
		        onItemClick: function(e) {
		        	//get the ID
		          	var id = $(this).data('contract-id');

		          	//render contract edit view
		          	contractEditView.model = contracts.get(id);
					$('#popup .modal-content').html(contractEditView.render().el);

		          	//open modal box
		          	$('#popup').modal();
	        },
	        toolbar: false,
	        data: list
      	});
	}
});