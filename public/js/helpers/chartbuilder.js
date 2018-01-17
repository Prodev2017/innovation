var moment = require('moment');
Highcharts.setOptions({
  global: {
    useUTC: false
  },
  lang: {
    months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
    shortMonths: ["janv.", "févr.", "mars", "avril", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    decimalPoint: ','
  }
});

var roundFloat = function(number, places) {
  return (+(Math.round(number + "e+" + places)  + "e-" + places)).toFixed(places);
}

var ChartEvent = function(type, data) {
  var chartEvent;

  if (type != 'reload' && type != 'alertset' && type != 'readyForRate') {
    throw new Exception('Wrong chart event type');
  }

  if (typeof CustomEvent === 'function') {
    chartEvent = new CustomEvent('chart:' + type, {
      detail: data
    });
  } else if (document.createEvent) {
    chartEvent = document.createEvent('CustomEvent');
    chartEvent.initCustomEvent('chart:'+type, true, true, data);
  }

  return chartEvent;
};

var chartBuilder = {};
chartBuilder.buildChart = function(baseElement, config) {
  if ('string' === typeof(baseElement)) {
    baseElement = document.querySelector(baseElement);
  }
  var builder;
  var alertLevels = {
    ideal: {
      id: 'alert-ideal',
      color: 'green',
      label: {
        text: 'Taux cible',
        style: {
          color: 'green',
        }
      }
    },
    minimal: {
      id: 'alert-minimal',
      color: 'red',
      label: {
        text: 'Taux limite',
        style: {
          color: 'red',
        }
      }
    },
    intermediaire: {
      id: 'alert-intermediaire',
      color: 'orange',
      label: {
        text: 'Taux directionnel',
        style: {
          color: 'orange',
        }
      }
    }
  };

  var afterSetExtremes = function(e) {
    var from_date = moment(e.min).format('YYYY-MM-DD');
    var to_date = moment(e.max).format('YYYY-MM-DD');
    var chart = this.chart;
      // console.log('From', from_date, builder._from_date);
      // console.log('To', to_date, builder._to_date);
      if (from_date == builder.fromDate && to_date == builder.toDate) {
        return;
      }
      builder._from_date = from_date;
      builder._to_date = to_date;
      chart.showLoading('Chargement des données...');
      $.getJSON('/js/exampledata.json', function(data){
        var sdata = [];
        Object.keys(data.quotes).forEach(function(d){
          sdata.push([
            moment(d).valueOf(),
            data.quotes[d]
            ]);
        });
        chart.series[0].setData(sdata, (sdata.length > 1));
        chart.hideLoading();

        var yExtremes = builder._chart.yAxis[0].getExtremes();
        builder._initial_min = yExtremes.min;
        builder._initial_max = yExtremes.max;

        var evt = ChartEvent('reload', {
          min: data.min,
          avg: data.avg,
          max: data.max,
        });
        baseElement.dispatchEvent(evt);
        plotLevels(chart);
      });
    };

    var plotLevels = function(chart) {
      var axis = chart.yAxis[0];
      var extremes = {
        min: axis.getExtremes().min,
        max: axis.getExtremes().max
      };
      var rescale = false;

      Object.keys(alertLevels).forEach(function(alert) {
        axis.removePlotLine(alertLevels[alert].id);
        var level = alertLevels[alert].value;
        if (!level) {
          return;
        }

        var labelText = alertLevels[alert].label.text;
        labelText = Highcharts.numberFormat(level, 4) + ' - ' + labelText;

        if (level < extremes.min) {
          extremes.min = level;
          rescale = true;
        }
        if (level > extremes.max) {
          extremes.max = level;
          rescale = true;
        }

        axis.addPlotLine({
          id: alertLevels[alert].id,
          value: alertLevels[alert].value,
          color: alertLevels[alert].color,
          label: {
            text: labelText,
            style: alertLevels[alert].label.style,
          },
          dashStyle: 'ShortDash',
          width: 1,
          zIndex: 20,
        });

        if (alert == 'ideal') {
          var ideal = level;
          var current = chart.series[0].points.slice(-1)[0].y;
          var pc = roundFloat((ideal/current - 1)  * 100, 2);
          var evt = ChartEvent('alertset', {
            percent: pc,
          });
          baseElement.dispatchEvent(evt);
        }
      });

      if (rescale) {
        axis.setExtremes(extremes.min, extremes.max);
      }
    };

    var plotChart = function(data){
      if (builder._chart) {
        clearInterval(builder._refresh_interval);
        builder._chart.destroy();
      }

      var plotSeries = [{
        name: data.currencies,
        data: data.points,
        type: 'area',
        id: 'dataseries',
        tooltip: {
          valueDecimals: 4
        },
        color: '#0088cf',
        fillColor: 'rgba(31,143,202,.2)',/*'#7cb5ec',/*'#0088cf', /* {
          linearGradient: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 1
          },
          stops: [
            [0, Highcharts.getOptions().colors[0]],
            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
          ]
        }*/
        threshold: null
      }];

      var refreshRate = function() {
        var evt = ChartEvent('readyForRate', {
          src: builder._from_currency,
          dest: builder._to_currency
        });
        baseElement.dispatchEvent(evt);
      };

      if (data.alert) {
        Object.keys(alertLevels).forEach(function(k) {
          if (data.alert.levels[k] && data.alert.triggered[k]) {
            return;
          }
          alertLevels[k].value = data.alert.levels[k];
        });

        var alertTitle = function(t) {
          switch (t) {
            case 'ideal':
            t = 'Cible';
            break;
            case 'intermediaire':
            t = 'Directionnel';
            break;
            case 'minimal':
            t = 'Limite';
            break;
          }

          return t;
        }

        if (data.alert.triggered) {
          plotSeries.push({
            data: Object.keys(data.alert.triggered).map(function(k) {
              return {
                x: moment(data.alert.triggered[k]).valueOf(),
                title: alertTitle(k),
                text: alertLevels[k].label.text,
              }
            }),
            onSeries: 'dataseries',
            shape: 'squarepin',
            type: 'flags',
            color: 'black',
          });
        }

        plotSeries.push({
          data: [{
            x: moment(data.alert.created).valueOf(),
            title: 'Création',
            text: 'Création alerte',
            color: 'blue',
          }, {
            x: moment(data.alert.expires).valueOf(),
            title: 'Cloture',
            text: "Cloture de l'alerte"
          }],
          shape: 'squarepin',
          type: 'flags',
          color: 'red',
        });
      }

      builder._chart = Highcharts.stockChart(baseElement, {
        chart: {
          backgroundColor: 'transparent',
        },
        rangeSelector: {
          buttons: [{
            type: 'ytd',
            text: '1erJan'
          }, {
            type: 'day',
            count: 1,
            text: '1j'
          }, {
            type: 'day',
            count: 5,
            text: '5j'
          }, {
            type: 'day',
            count: 15,
            text: '15j'
          }, {
            type: 'month',
            count: 1,
            text: '1m'
          }, {
            type: 'month',
            count: 3,
            text: '3m'
          }, {
            type: 'month',
            count: 6,
            text: '6m'
          }, {
            type: 'year',
            count: 1,
            text: '1an'
          }, {
            type: 'year',
            count: 3,
            text: '3ans'
          }, {
            type: 'year',
            count: 5,
            text: '5ans'
          }],
          allButtonsEnabled: true,
          inputEnabled: false, // it supports only days
          selected: 4
        },
        scrollbar: {
          //enabled: false,
          liveRedraw: false
        },
        yAxis: {
          title: {
            text: 'Taux devise'
          },
          opposite: false,
        },
        xAxis: {
          events: {
            afterSetExtremes: afterSetExtremes,
          },
        },
        navigator: {
          adaptToUpdatedData: false,
          height: 0,
          series: {
            data: data.points
          },
        },
        series: plotSeries
      }, function() {
        var extremesStart = moment().subtract(1, 'months').valueOf();
        if (data.alert) {
          extremesStart = moment(data.alert.created, 'YYYY-MM-DD').subtract(6, 'hours').valueOf();
        }

        this.xAxis[0].setExtremes(
          extremesStart,
          moment().valueOf());

        var evt = ChartEvent('readyForRate', {
          src: builder._from_currency,
          dest: builder._to_currency
        });
        baseElement.dispatchEvent(evt);
        builder._refresh_interval = setInterval(refreshRate, 60000);
        if (data.alert) {
          plotLevels(this);
        }
      });
    };

    builder = function() {
      if (builder._chart) {
        builder._chart.showLoading('Chargement des données...');
      }
      $.getJSON('/js/exampledata.json', function(data) {
        builder._from_currency = data.src;
        builder._to_currency = data.dest;
        var plotdata = {
          currencies: data.src + '/' + data.dest,
          points: [],
          minval: data.min,
          maxval: data.max,
          alert: null,
        };
        Object.keys(data.quotes).forEach(function(d) {
          plotdata.points.push([
            moment(d).valueOf(),
            data.quotes[d]
            ]);
        });
        if (builder._chart) {
          builder._chart.hideLoading();
        }
        if (!config.noAlertLevels && data.alert) {
          plotdata.alert = data.alert;
        }
        plotChart(plotdata);
      })
    };
    builder._from_date = moment().subtract(5, 'years').format('YYYY-MM-DD');
    builder._to_date = moment().format('YYYY-MM-DD');
    builder._from_currency = config.fromCurrency;
    builder._to_currency = config.toCurrency;
    builder._chart = null;
    builder._initial_min = null;
    builder._initial_max = null;
    builder._refresh_interval = null;

    var currencyGetSetter = function(prop) {
      return {
        get: function() { return builder[prop]; },
        set: function(x) {
          builder[prop] = x;
          if (config.fromAlert) {
            delete config['fromAlert'];
          }
          if (builder._from_currency == builder._to_currency) {
            return;
          }
          builder._from_date = moment().subtract(5, 'years').format('YYYY-MM-DD');
          builder._to_date = moment().format('YYYY-MM-DD');
          builder();
        }
      };
    };
    var dateGetSetter = function(prop) {
      return {
        get: function() { return builder[prop]; },
        set: function(x) {
          builder[prop] = x;
          builder._chart.xAxis[0].setExtremes(moment(builder._from_date).valueOf(),
            moment(builder._to_date).valueOf());
        }
      };
    };
    var setAlertLevel = function(alert, level) {
      if (!builder._chart || !alertLevels[alert]) {
        return;
      }
      resetAlertLevel(alert);
      if (!level) {
        return;
      }
      level = parseFloat(level.replace(',', '.'));
      alertLevels[alert].value = level;
      plotLevels(builder._chart);
    };

    var resetAlertLevel = function(alert) {
      var level = alertLevels[alert].value;
      var yExtremes = builder._chart.yAxis[0].getExtremes();
      var cExtremes = {min: null, max: null};

      cExtremes.min = Object.keys(alertLevels).reduce(function(prev, curr, idx) {
        return Math.min(alertLevels[prev], alertLevels[curr]);
      });
      cExtremes.min = cExtremes.min < builder._initial_min ?  cExtremes.min : builder._initial_min;
      cExtremes.max = Object.keys(alertLevels).reduce(function(prev, curr, idx) {
        return Math.max(alertLevels[prev], alertLevels[curr]);
      });
      cExtremes.max = cExtremes.max > builder._initial_max ?  cExtremes.max : builder._initial_max;

      builder._chart.yAxis[0].setExtremes(cExtremes.min, cExtremes.max);

      if (builder._chart && alertLevels[alert]) {
        builder._chart.yAxis[0].removePlotLine(alertLevels[alert].id);
        alertLevels[alert].value = 0;
      }

      if (alert == 'ideal') {
        var evt = ChartEvent('alertset', {
          percent: null,
        });
        baseElement.dispatchEvent(evt);
      }
    };
    var chartDestroy = function() {
      if (builder._chart) {
        builder._chart.destroy();
      }
      if (builder._refresh_interval) {
        clearInterval(builder._refresh_interval);
      }
    };
    var chartRebuild = function() {
      builder._from_date = moment().subtract(5, 'years').format('YYYY-MM-DD');
      builder._to_date = moment().format('YYYY-MM-DD');
      builder();
    };
    chartWrapper = {};
    Object.defineProperty(chartWrapper, 'fromDate', dateGetSetter('_from_date'));
    Object.defineProperty(chartWrapper, 'toDate', dateGetSetter('_to_date'));
    Object.defineProperty(chartWrapper, 'fromCurrency', currencyGetSetter('_from_currency'));
    Object.defineProperty(chartWrapper, 'toCurrency', currencyGetSetter('_to_currency'));
    Object.defineProperty(chartWrapper, 'setAlertLevel', {get: function() {
      return setAlertLevel;
    }});
    Object.defineProperty(chartWrapper, 'resetAlertLevel', {get: function() {
      return resetAlertLevel;
    }});
    Object.defineProperty(chartWrapper, 'destroy', {get: function() {
      return chartDestroy;
    }});
    Object.defineProperty(chartWrapper, 'rebuild', {get: function() {
      return chartRebuild;
    }});
    Object.defineProperty(chartWrapper, 'container', {get: function() {
      return baseElement;
    }});
    builder();
    return chartWrapper;
  };
module.exports = chartBuilder;