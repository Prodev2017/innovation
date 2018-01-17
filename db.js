const moment = require('moment');
// const userData = {
//     name: 'John Doe',
//     email: 'test@example.com',
//     password: db.User.hashPassword('justlogmein')
//   }
//   db.User.create(userData).then((err, user) => {

//     console.log(user.get({
//       plain: true
//     }));
//   }).catch((err) => {
//     console.log('======', err);
//   })
//   console.log(db.User.hashPassword('justlogmein'))




// {
//   "development": {
//       "username": "ocws",
//       "password": "qj.lKZ0CwS",
//       "database": "ocws_dev",
//       "host": "database",
//       "port":"",
//       "logging":true,
//       "dialect": "mysql"
//   },
//   "test": {
//     "dialect": "sqlite",
//     "storage": ":memory:"
//   },
//   "production": {
//     "username": "ocws",
//     "password": "qj.lKZ0CwS",
//     "database": "ocws_dev",
//     "host": "database",
//     "dialect": "mysql"
//   }
// }

// HOSTNAME: database
// USER: ocws
// DATABASE: ocws_dev
// PASSWORD: qj.lKZ0CwS


// function toYYYYMMDD(original) {
//   var momentObj = moment(original, 'DD-MM-YYYY');
//   var momentString = momentObj.format('YYYY-MM-DD'); // 2016-07-15

//   return momentString;
// }

// var dateString = '15-07-2016';
// var today = moment();
// var ofdays = moment('2016-12-08', 'YYYY-MM-DD');
// var val = today.diff(ofdays, 'months')
// console.log(val);

// console.log(aa || 0);
console.log('1');
setTimeout(function(){
    console.log('2');
},0)
console.log('3');
// var socket = require('socket.io-client')('http://data01.infra.napal-innovation.xyz:8091');
// socket.on('connect', function () {
//   console.log('socket connected');
// });
// socket.on('activity', function (data) {
//   console.log(data);
//   socket.emit('just', 'okay');
// });
// socket.on('disconnect', function () {
//   console.log('disconnected');
// });




// $(function () {

//     var ContractItem = Backbone.Model.extend({
//       url: '/api/contract',
//       defaults: {
//         id: null,
//         number: null,
//         rate: null,
//         amount: null
//       }
//     });

//     var ContractsCollection = Backbone.Collection.extend({
//       model: ContractItem,
//       url: '/api/contract'
//     });

//     var ContractsList = Backbone.View.extend({
//       /*template: Handlebars.compile(
//         '{{#each models}}<div><strong>Name</strong> {{attributes.number}}; <strong>Rate</strong> {{attributes.rate}}; <strong>Amount</strong> {{attributes.amount}}</div>{{/each}}'
//       ),*/

//       initialize: function () {
//         this.listenTo(this.collection, 'sync', this.render);
//       },

//       render: function () {
//         return this;
//       }
//     });

//     var ContractAdd = Backbone.View.extend({

//       render: function () {
//         //load contract
//         this.$el.html(Handlebars.templates.contractnew());

//         this.delegateEvents({
//           'click #submit-new-contract': 'save'
//         });
//         return this;
//       },

//       save: function () {
//         this.processForm();

//         this.model.save(this.model.attributes,
//           {
//             success: function (model) {
//               contracts.add(model);
//               $('#close-new-contract-form').click();
//             }
//           }
//         );
//       },

//       processForm: function () {
//         //validate form


//         //add new contract
//         this.model.set({
//           id: null,
//           number: this.$el.find('input[name="number"]').val(),
//           rate: this.$el.find('input[name="rate"]').val(),
//           amount: this.$el.find('input[name="amount"]').val(),
//           currency_src: /[^/]*/.exec(this.$el.find('select[name="pair"]').val())[0],
//           currency_dest: /[^/]*$/.exec(this.$el.find('select[name="pair"]').val())[0],
//           date_buy: this.$el.find('input[name="date_buy"]').val(),
//           date_open: this.$el.find('input[name="date_open"]').val(),
//           date_close: this.$el.find('input[name="date_close"]').val(),
//           comment: this.$el.find('input[name="comment"]').val(),
//           project: this.$el.find('input[name="project"]').val(),
//           object: this.$el.find('input[name="object"]').val(),
//           user_id: 4 //TODO: this should be added on BE
//         });
//       }

//     });

//     var contracts = new ContractsCollection();
//     contracts.fetch();

//     var contractsList = new ContractsList({ collection: contracts });
//     var contractAdd = new ContractAdd({ model: new ContractItem() });

//     $('#contracts-list').html(contractsList.render().el);
//     $('#popup .modal-content').html(contractAdd.render().el);

//     /** alert socket */
//     var SocketModel = Backbone.Model.extend({
//       initialize: function () {
//         console.log('model initialized')
//         this.on('change', this.notifyEachChange, this)
//       },

//       notifyEachChange: function (model, options) {
//         if (options.unset) {
//           console.log('model removed')
//         } else {
//           console.log('model was changed')
//         }
//       },
//     })

//     var AlertView = Backbone.View.extend({
//       el: '#alert',
//       events: {
//         'click a#showalert': 'showAlert'
//       },
//       initialize: function (options) {
//         var view = this
//         view.socket = io("http://localhost:3000")
//         view.model = new SocketModel()

//         view.socket.on('alert', function (node) {
//           var $node = $(`			 
//           <span class="badge bg-green">${node.length}</span>				
//         `)
//           // view.model.set(node.id, $node)

//           view.$el.find("#showalert").append($node)
//           $node.on('click', function () {
//             view.socket.emit('alert', "node");
//           })
//         })
//         console.log('view initialized')
//       }
//     })

//     var ActivityView = Backbone.View.extend({
//       el: '#recent_activity',
//       events: {
//         'click': ''
//       },
//       initialize: function (options) {
//         var view = this
//         view.socket = io("http://localhost:3000")
//         // view.socket.emit('retrieve-all-nodes')
//         view.model = new SocketModel()

//         view.socket.on('activity', function (activity) {
//           console.log(activity);
//           var items = `<span class="badge bg-green">${activity.length}</span>`;
//           var $node = $(items);
//           // view.model.set(node.id, $node)

//           view.$el.find(".messages").append($node)
//           $node.on('click', function () {
//             view.socket.emit('alert', "node")
//           })
//         })
//         console.log('view initialized')
//       }
//     })

//     var alert = new AlertView();
//     var activity = new ActivityView();


//   });

//   var MyModel = Backbone.Model.extend({
//     initialize: function () {
//       console.log('model initialized')
//       this.on('change', this.notifyEachChange, this)
//     },

//     notifyEachChange: function (model, options) {
//       if (options.unset) {
//         console.log('model removed')
//       } else {
//         console.log('model was changed')
//       }
//     },
//   })

//   //   var MyView = Backbone.View.extend({
//   // 	el: '#my-backbone-app',
//   // 	events: {
//   // 	  'click button#add-new-node': 'addNewNode'
//   // 	},
//   // 	initialize: function (options) {
//   // 	  var view = this
//   // 	  view.socket = io("https://pubsub-example-with-backbone.herokuapp.com/")
//   // 	  view.socket.emit('retrieve-all-nodes')
//   // 	  view.model = new MyModel()

//   // 	  view.socket.on('node-added', function (node) {
//   // 		var $node = $(`
//   // 		  <li>
//   // 			<span>${node.id}</span>
//   // 			<button>x</button>
//   // 		  </li>
//   // 		`)
//   // 		view.model.set(node.id, $node)

//   // 		view.$el.find("ul#nodes").append($node)
//   // 		$node.on('click', function () {
//   // 		  view.socket.emit('remove-node', node)
//   // 		})
//   // 	  })

//   // 	  view.socket.on('node-removed', function (node) {
//   // 		view.model.get(node.id).remove()
//   // 		view.model.unset(node.id, {})
//   // 	  })
//   // 	  console.log('view initialized')
//   // 	},

//   // 	addNewNode: function () {
//   // 	  this.socket.emit('add-node', {}, function (obj) {
//   // 		console.log(obj)
//   // 	  })
//   // 	}
//   //   })


//   //   var view = new MyView()