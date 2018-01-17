
$(function () {

	if ($("#page-pilotage").length > 0) {

		//init collections and models
		contracts = new ContractsCollection();
		contracts.fetch();

		contractModel = new ContractItem();

		//init views
		contractsListView = new ContractsListView({ collection: contracts });
		contractAddView = new ContractAddView({ model: contractModel });
		contractEditView = new ContractEditView({ model: contractModel });

		$('#contract-add').click(function () {
			$('#popup .modal-content').html(contractAddView.render().el);
		});
	}

	if ($("#page-gestion").length > 0) {

		//init collections and models
		invoices = new InvoicesCollection();
		invoices.fetch();

		invoiceModel = new InvoicesItem();
		// init view
		invoiceEditview = new InvoiceEditView({ model: invoiceModel });

		$("#invoice-edit").click(function () {
			var id = $(this).data('invoice-id');
			invoiceEditview.model = invoices.get(id);
			$('#popup .modal-content').html(invoiceEditview.render().el);

		})
	}

	if ($("#alert_list").length > 0) {

		alerts = new AlertsCollection();
		alerts.fetch();

		// alertModel = new AlertsItem();
		alertsListView = new AlertsListView({ collection: alerts });
		alertsListView.render().el;
	}

	/** notification socket */
	var SocketModel = Backbone.Model.extend({
		initialize: function () {
			console.log('model initialized');
			this.on('change', this.notifyEachChange, this);
		},

		notifyEachChange: function (model, options) {
			if (options.unset) {
				console.log('model removed');
			} else {
				console.log('model was changed');
			}
		},
	})

	var NotificationView = Backbone.View.extend({
		el: '#notification',
		events: {
			'click #hasread': 'hasread',
			'click .read-item': 'readitem'
		},
		initialize: function (options) {
			var view = this;
			// view.socket = io("http://data01.infra.napal-innovation.xyz:8091");
			// view.socket = io("localhost:3000");
			console.log('----------', window.lastread_activity_id);
			view.model = new SocketModel();

			socket.on('notification', function (notifications) {
				console.log(notifications, socket.id);
				if (notifications.length > 0) {
					view.$el.find("#count").html(notifications.length);
				}
				else {
					view.$el.find("#count").html('');
				}

				var items = [];
				notifications.map(function (notification) {
					var detail = JSON.parse(notification.detail);
					items += ` <li class="read-item">
                    <a>
                      <span class="image">
                        <img src="/img/gentelella/avatar.jpg" alt="Profile Image" />
                      </span>
                      <span>
                        <span>${notification.User.name}</span>
                        <span class="time">${moment(notification.time_performed).fromNow()}</span>
                      </span>
                      <span class="message">
                        ${detail.action} ${detail.type} ${detail.id}.
                      </span>
                    </a>
                  </li>`
				})
				view.$el.find("#menu1").html(items);

			});
			console.log('view initialized');
		},
		hasread: function () {
			if (this.$el.find("#count").html() > 0) {
				setTimeout(function () {
					console.log(socket.id);
					socket.emit('notification', socket.id);
				}, 10000)
			}
		},
		readitem: function (e) {
			// console.log(e.target.id);
		}

	})

	var ActivityView = Backbone.View.extend({
		el: '#recent_activity',
		events: {
			'click': ''
		},
		initialize: function (options) {
			var view = this;
			moment.lang('fr-FR');
			moment.locale('fr');

			// view.socket.emit('retrieve-all-nodes')
			view.model = new SocketModel();
			var items = [];
			socket.on('activity', function (activities) {

				activities.map(function (activity) {
					var detail = JSON.parse(activity.detail);
					items += `<li>
					<img src="/img/gentelella/avatar.jpg" class="avatar" alt="Avatar">
						<div class="message_wrapper">
							<h4 class="heading">${activity.User.name} <span>${moment(activity.time_performed).fromNow()} </span></h4>
							<blockquote class="message">${detail.action} ${detail.type} ${detail.id}.</blockquote>
						</div>
				</li>`
				})
				view.$el.find(".messages").html(items);
			})
			console.log('view initialized');
		}
	})

	var notification = new NotificationView();
	var activity = new ActivityView();

});