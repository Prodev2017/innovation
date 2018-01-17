var Gantt = (function() {
  var $ = require('jquery');
  var d3 = require('d3');
  var moment = require('moment');

  var getWidth = function(element) {
    var tempStyle = {
      position: 'absolute',
      visibility: 'hidden',
      display: 'block',
    };
    var prevStyle = {};
    var $elm = $(element);
    var w;

    w = $elm.width();
    if (!w) {
      var $cmp = $elm;

      while ($cmp && window.getComputedStyle($cmp[0]).display != 'none') {
        $cmp = $cmp.parent();
      }

      Object.keys(tempStyle).forEach(function(k) {
        prevStyle[k] = $cmp.css(k);
        $cmp.css(k, tempStyle[k]);
      });
      w = $elm.width();
      Object.keys(tempStyle).forEach(function(k) {
        $cmp.css(k, prevStyle[k]);
      });
    }
    return w;
  }

  var builder = function(element, options) {
    var width = getWidth(element);
    var padding = 10;
    var labelWidth = 100;
    var labelPadding = 5;
    var plotAreaWidth = width - padding*2 - labelWidth;
    var barHeight = 25;
    var barMargin = 2;
    var svg, canvas, toolbar;

    var items = [];

    var TriggerEvent = function(type, data) {
      var chartEvent;

      if (CustomEvent) {
        chartEvent = new CustomEvent('chart:' + type, {
          detail: data
        });
      } else if (document.createEvent) {
        chartEvent = document.createEvent('CustomEvent');
        chartEvent.initCustomEvent('chart:'+type, true, true, data);
      }

      return chartEvent;
    };

    this._initToolbar = function() {
      if (toolbar) {
        toolbar.remove();
      }

      toolbar = d3.select(element).insert('div', ':first-child').attr('class', 'toolbar');
      toolbar.append('button').attr('class', 'zoom-out').text("\u2212");
      toolbar.append('button').attr('class', 'zoom-in').text("+");
    };

    this._initCanvas = function() {
      if (svg) {
        svg.remove();
      }
      svg = d3.select(element)
        .append('svg').attr('class', 'gantt').attr('width', width);
      svg.append('defs');
      canvas = svg.append("g").attr("transform", "translate("+labelWidth+", 0)");
    };

    //getData(this);
    var _self = this;

    d3.select(window).on('resize', function() {
      width = getWidth(element);
      plotAreaWidth = width - padding*2 - labelWidth;
      console.log('RESIZE TO: ', width);
      _self.rebuild();
    });

    this.rebuild = function(data) {
      if (data) {
        items = data;
      }
      this._initCanvas();

      if (options.toolbar) {
        this._initToolbar();
      }

      if (!items || !items.length) {
        this.destroy();
        return;
      }

      var defaultLabels = {
        left: '',
        right: '',
        tooltip: ''
      };
      var minDate, maxDate, longestLabel;
      var height = (barHeight + barMargin) * items.length;
      var barNames = [];
      var scaleFactor = 1;

      svg.attr('height', height + 60);
      items.forEach(function(val, idx) {
        var start = moment(val.bar.dateStart).valueOf();
        var end = moment(val.bar.dateEnd).valueOf();

        if (!maxDate || end > maxDate) {
          maxDate = end;
        }

        if (!minDate || start < minDate) {
          minDate = start;
        }

        barNames.push(val.axisLabel);
        val.labels = $.extend({}, defaultLabels, val.labels);
        if (!val.bar.levels) {
          val.bar.levels = [];
        }
      });

      minDate = moment(minDate);
      startDate = moment(minDate);
      maxDate = moment(maxDate).add(2, 'days');

      if (options.viewport && options.viewport.dateStart) {
        minDate = moment(options.viewport.dateStart);
      }
      if (options.viewport && options.viewport.dateEnd) {
        maxDate = moment(options.viewport.dateEnd).add(2, 'days');
      }

      var totalInterval = maxDate.diff(minDate, 'days');
      var fr_FR = {
        "dateTime": "%A, le %e %B %Y, %X",
        "date": "%d/%m/%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        "shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
        "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        "shortMonths": ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
      };

      d3.timeFormatDefaultLocale(fr_FR);

      var xScale = d3.scaleTime()
	      .domain([d3.timeDay.floor(minDate.toDate()), d3.timeDay.ceil(maxDate.toDate())])
		    .range([padding, plotAreaWidth+padding]);
      var yScale = d3.scaleBand()
        .domain(barNames)
        .range([0, height]);

      var xAxis = d3.axisBottom()
				.scale(xScale)
				.tickFormat(d3.timeFormat("%d %b"))
        .tickSize/*Outer*/(0);
      var xGrid = d3.axisBottom()
				.scale(xScale);
				//.ticks(moment(maxDate).diff(minDate, 'days'));
        // xAxis.scale().ticks().length;

      var yAxis = d3.axisLeft()
        .scale(yScale)
        .tickSize(0);
        //.tickFormat(function(d) { return items[d].axisLabel; });
      var yGrid = d3.axisRight()
    		.scale(yScale);

      var gAxisX = canvas.append("g")
  			.attr("class", "x top axis")
        .call(xAxis);

/*      function timeScaleStep(timeScale) {
        timeScale || (timeScale = Global.timeScale);
        var d1 = timeScale.domain()[0];
        var d2 = timeScale.domain()[1];
        var days = timeScale.ticks().length;

        return (timeScale(d2) - timeScale(d1)) / days;
      }*/

      if (options.viewport && options.viewport.highlightStart && options.viewport.highlightEnd) {
        canvas.append('rect')
          .attr('clip-path', 'url(#barClip)')
          .attr("class", "highlight shade before")
          .attr('x', 0)
          .attr('data-x-initial', 0)
          .attr('y', 0)
          .attr('height', height)
          .attr('width', xScale(moment(options.viewport.highlightStart).toDate()))
          .attr('data-width-initial', xScale(moment(options.viewport.highlightStart).toDate()));

        canvas.append('rect')
          .attr('clip-path', 'url(#barClip)')
          .attr("class", "highlight shade after")
          .attr('x', xScale(moment(options.viewport.highlightEnd).toDate()))
          .attr('data-x-initial', xScale(moment(options.viewport.highlightEnd).toDate()))
          .attr('y', 0)
          .attr('height', height)
          .attr('width', xScale(maxDate.toDate()) - xScale(moment(options.viewport.highlightEnd).toDate()))
          .attr('data-width-initial', xScale(maxDate.toDate()) - xScale(moment(options.viewport.highlightEnd).toDate()));
      }

      canvas.selectAll(".x.top.axis .tick text")
        .attr('text-anchor', 'start')
        .attr("transform", "translate(0, "+(height + barMargin / 2).toString() +")");
//        .attr('transform', 'translate(' + (timeScaleStep(xScale) * .3) + ', 0)');

      canvas.append("g")
				.attr("class","x grid")
				.call(xGrid.tickSize(height, 0, 0).tickFormat(""));
      canvas.selectAll('g.x.grid .tick line').attr('stroke', '#ebebeb');

      canvas.append("g")
  			.attr("class","y grid")
  			.call(yGrid.tickSize(width, 0, 0).tickFormat(""));
      canvas.selectAll('g.y.grid .tick line').attr('stroke', '#ebebeb');
  		/*canvas.append("g")
  				.attr("class","y left axis")
          .attr("transform", "translate(10, 0)")
          .call(yAxis);*/

      svg.select('defs').append('clipPath')
        .attr('id', 'ticketLabelClip')
        .append('rect')
        .attr('x', -labelWidth + labelPadding)
        .attr('y', 0)
        .attr('height', (barHeight+barMargin)*(items.length+1))
        .attr('width', labelWidth);

      var barClip = svg.select('defs').append('clipPath').attr('id', 'barClip');
      barClip.append('rect')
        .attr('x', labelPadding)
        .attr('y', 0)
        .attr('height', (barHeight+barMargin)*(items.length+2))
        .attr('width', width);

      var today = new Date();
      var todayTick = canvas.append("rect")
        .attr("x", function(d) { return xScale(today); })
        .attr("data-x-initial", function(d) { return xScale(today); })
        .attr("y", 0)
        .attr("class","tick today")
        .attr('clip-path', 'url(#barClip)')
        .attr("width", 1)
        .attr("height", height + barHeight + 5);
      var todayText = canvas.append("svg:text")
        .attr("class","tick today")
        .attr('clip-path', 'url(#barClip)')
        .attr("x", function(d) { return xScale(today) - 25; })
        .attr("data-x-initial", function(d) { return xScale(today) - 25; })
        .attr("y", height + barHeight + barMargin * 0.7 + 5)
        .text(d3.timeFormat("%d %b")(today));

      var itemClickFn = function() {
        if (options && options.onItemClick) {
          var args = arguments;
          options.onItemClick.apply(this, args);
        }
      };

      var zoomBh = d3.zoom()
        .translateExtent([[xScale(minDate.toDate()), 0], [xScale(maxDate.toDate()), (height + barHeight)]])
        .scaleExtent([0.25, 4])
        .on("zoom", zoom_actions);

      function zoom_actions() {
        var scale_k = d3.event.transform.k;
        scaleFactor = scale_k;

        gAxisX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));

        percentGroup.selectAll('rect.times.bar')
          .attr('width', function(d) { return +d3.select(this).attr('data-width-initial') * scale_k; })
          .attr('x', function(d) { return +d3.select(this).attr('data-x-initial') * scale_k + (+d3.event.transform.x); });
        barGroup.selectAll('text.percent.label')
          .attr('x', function(d) { return +d3.select(this).attr('data-x-initial') * scale_k + (+d3.event.transform.x); });

        canvas.selectAll(".x.top.axis .tick text")
          .attr('text-anchor', 'start')
          .attr("transform", "translate(0, "+(height + barMargin / 2).toString() +")");

        if (options.viewport && options.viewport.highlightStart && options.viewport.highlightEnd) {
          var borderLine = function(d) {
            var bl = +d3.select(this).attr('data-x-initial') * scale_k + (+d3.event.transform.x);
            return bl > 0 ? bl : 0;
          };

          canvas.selectAll(".highlight.shade.before")
          .attr('width', borderLine);

          canvas.selectAll(".highlight.shade.after")
          .attr('x', borderLine)
          .attr('width', function() {
            var r = width - borderLine.call(this);
            return r > 0 ? r : 0;
          });
        }

        todayTick.attr('x', function(d) { return +d3.select(this).attr('data-x-initial') * scale_k + (+d3.event.transform.x); });
        todayText.attr('x', function(d) { return todayTick.attr('x') - 25; });
      }

      zoomBh(svg);

      if (toolbar) {
        toolbar.select('.zoom-in').on('click', function() {
          scaleFactor *= 2;
          if (scaleFactor > 4) {
            scaleFactor = 4;
          }
          zoomBh.scaleTo(svg, scaleFactor);
        });

        toolbar.select('.zoom-out').on('click', function() {
          scaleFactor /= 2
          if (scaleFactor < 0.25) {
            scaleFactor = 0.25;
          }
          zoomBh.scaleTo(svg, scaleFactor);
        });
      }

      var barGroup = canvas.append("g")
				.attr("class","chart")
				.selectAll("rect")
				.data(items)
				.enter()
        .append('g')
        .attr("class","bargroup")
        .on('click', itemClickFn)
        .each(function(d) {
          var bg = d3.select(this);
          d3.keys(d.attributes).forEach(function(attr) {
            bg.attr(attr, d.attributes[attr]);
          });
        });

      var yAxisLabels = barGroup.append("g")
        .attr('class', 'axislabel')
        .attr('clip-path', 'url(#ticketLabelClip)');

      // Define the div for the tooltip
      var tooltip;

      var tooltipOn = function(d) {
        if (!d.labels.tooltip) {
          return;
        }

        tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

        tooltip.transition()
          .duration(200)
          .style("opacity", .9);

        var node = tooltip.node();
        tooltip.html(d.labels.tooltip)
          .style("position", "absolute")
          .style("text-align", "center")
          //.style("width", "220px")
          .style("font-style", "italic")
          .style("height", "2em")
          .style("border", "1px solid #000")
          .style("padding", "0 10px")
          .style("background-color", "#fff")
          .style("left", (document.body.clientWidth / 2 - node.getBoundingClientRect().width / 2) + "px")
          .style("top", (d3.event.pageY - 35) + "px");
      };

      var tooltipOff = function(d) {
        tooltip.transition()
          .duration(500);
        tooltip.remove();
      };

      yAxisLabels.append('rect')
        .attr("class","ticket")
        .attr("x", -labelWidth + labelPadding)
        .attr("y", function(d) { return yScale(d.axisLabel) + barMargin / 2; })
        .attr("width", labelWidth)
        .attr("height", barHeight);

      yAxisLabels.append('svg:text')
        .attr("x", -labelWidth + labelPadding * 2)
        .attr("y", function(d) { return yScale(d.axisLabel) + barMargin / 2 + barHeight/1.9; })
        .attr('dominant-baseline', 'central')
        .text(function(d) { return d.axisLabel; });

      var widthThreshold = 180;
      var percentGroup = barGroup.append("g")
        .attr('clip-path', 'url(#barClip)');
      var barIntervalGroup = percentGroup.append("g")
      .on('mouseover', tooltipOn)
      .on('mouseout', tooltipOff)
      .each(function(d) {
        var tooltipLabel = d.labels.tooltip;
        var xCoordinate = xScale(d3.timeDay.floor(moment(d.bar.dateStart).toDate()));
        var yCoordinate = yScale(d.axisLabel) + barMargin / 2;

        //d.bar.levels.push({level: 1});

        d.bar.levels.sort(function(a, b) {
          return a.level - b.level;
        }).reverse();

        d._view = {
          totalWidth: Math.ceil(plotAreaWidth/totalInterval * (moment(d.bar.dateEnd).diff(d.bar.dateStart, 'days')+1))
        };

        var g = d3.select(this);
        var rowbars = g.selectAll('rect')
          .data(d.bar.levels)
          .enter();

        rowbars.append('rect')
          .attr("class", function(lv) {
            return "times bar"
              + (d.bar.class ? ' ' + d.bar.class : '')
              + (lv.class ? ' ' + lv.class : '');
          })
          .attr("x", xCoordinate)
          .attr("y", yCoordinate)
          .attr("data-x-initial", xCoordinate)
  				.attr("width", function(lv) {
            //console.log('LVL', lv, d._view.totalWidth, d._view.totalWidth * lv.level);
            return d._view.totalWidth * lv.level;
            //return Math.ceil(plotAreaWidth/totalInterval * (moment(d.bar.dateEnd).diff(d.bar.dateStart, 'days')+1));
  				})
          .attr("data-width-initial", function(lv) {
            //console.log('LVL', lv, d._view.totalWidth, d._view.totalWidth * lv.level);
            return d._view.totalWidth * lv.level;
            //return Math.ceil(plotAreaWidth/totalInterval * (moment(d.bar.dateEnd).diff(d.bar.dateStart, 'days')+1));
  				})
  				.attr("height", barHeight);

          g.insert('rect', ':first-child')
            .attr("class","times bar" + (d.bar.class ? ' ' + d.bar.class : ''))
            .attr("x", xCoordinate)
            .attr("y", yCoordinate)
            .attr("data-x-initial", xCoordinate)
            .attr("width", d._view.totalWidth)
            .attr("data-width-initial", d._view.totalWidth)
            .attr("height", barHeight)
      });

      percentGroup.append("svg:text")
        .attr('class', function(d) {
          var r = 'percent label';
          if (d._view.totalWidth < widthThreshold) {
            r += ' outside'
          }
          return r;
        })
        .attr('dominant-baseline', 'central')
        .attr('x', function(d) {
          var barwidth = d._view.totalWidth;
          if (barwidth > widthThreshold) {
            return xScale(d3.timeDay.floor(moment(d.bar.dateStart).toDate())) + 10;
          } else {
            return xScale(d3.timeDay.floor(moment(d.bar.dateStart).toDate())) + barwidth + 5;
          }
        })
        .attr('data-x-initial', function(d) {
          var barwidth = d._view.totalWidth;
          if (barwidth > widthThreshold) {
            return xScale(d3.timeDay.floor(moment(d.bar.dateStart).toDate())) + 10;
          } else {
            return xScale(d3.timeDay.floor(moment(d.bar.dateStart).toDate())) + barwidth + 5;
          }
        })
        .attr('y', function(d) { return yScale(d.axisLabel) + barMargin / 2 + barHeight*.5; })
        .text(function(d) {
          var barwidth = d._view.totalWidth;
          var t = d.labels.left;
          if (barwidth < widthThreshold) {
            t += ' ' + d.labels.right;
          }
          return t;
        });

      percentGroup.append("svg:text")
        .attr('class', 'percent label')
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .attr('x', function(d) { return xScale(d3.timeDay.floor(moment(d.bar.dateEnd).toDate())) - 5*d.labels.right.length; })
        .attr('data-x-initial', function(d) { return xScale(d3.timeDay.floor(moment(d.bar.dateEnd).toDate())) - 5*d.labels.right.length; })
        .attr('y', function(d) { return yScale(d.axisLabel) + barHeight*.5; })
        .text(function(d) {
          var t = d.labels.right;
          if (d._view.totalWidth < widthThreshold) {
            t = '';
          }
          return t;
        })
        .on('click', itemClickFn);

      //zoomBh.translateTo(svg, xScale(startDate.toDate()), 0)
    };

    this.destroy = function() {
      svg.remove();
      if (toolbar) {
        toolbar.remove();
      }
    };

    this.rebuild(options.data);
  };

  return builder;
})();

if (module) {
  module.exports = Gantt;
}
