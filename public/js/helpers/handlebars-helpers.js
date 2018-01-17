/*
 * If equality block helper. Renders the block if `value1` equals `value2` (strict).
 * {{#eq a b}} content {{/eq}}
*/
Handlebars.registerHelper('eq', function(value1, value2, options) {
    if (value1 === value2) {
    	return options.fn(this);
    }
    else {
    	return options.inverse(this);
    }
});

/*
 * A formatDate helper to format date using moment js.
 * {{formatDate 'MM/DD/YYYY' date}}
*/
Handlebars.registerHelper('formatDate', function(formatString, date) {
	var moment = global.moment;

    formatString = (typeof formatString)=='string' ? formatString : '';

    return moment(date || new Date()).format(formatString);
});