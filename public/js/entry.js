/* Vendor scripts */
var jQuery = require('jquery');
window.jQuery = window.$ = jQuery;
require('bootstrap');
require('bootstrap-progressbar/bootstrap-progressbar');
require('bootstrap-daterangepicker');
require('eonasdan-bootstrap-datetimepicker');
require('icheck');
var moment = require('moment');
window.moment = moment;
// require('moment/locale/en');
require('moment/locale/fr');
moment.lang('fr-FR');
moment.locale('fr');
require('select2')($);

/* DataTables */
require('datatables.net')();
require('datatables.net-fixedheader')();

/* Backbone */
var Backbone = require('backbone');
window.Backbone = Backbone;

/* Handlebars */
window.Handlebars = require('handlebars/runtime');
require('./helpers/handlebars-helpers');
require('./templates');

/* ECharts lib */
window.echarts = require('echarts');

/* Highstock */
var Highcharts = require('highcharts/highstock');
window.Highcharts = Highcharts;
// Load module after Highcharts is loaded
require('highcharts/modules/exporting')(Highcharts);


/* Gantt lib */
window.Gantt = require('./gantt/gantt');

/* Models */
// require('./models/contracts');

/* Views */
// require('./views/contractsList');
// require('./views/contractAdd');
// require('./views/contractEdit');

/* Helpers */
require('./helpers/smartresize');

/* Custom OCWS js */
require('./custom');