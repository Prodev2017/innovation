/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
    $BODY = $('body'),
    $MENU_TOGGLE = $('#menu_toggle'),
    $SIDEBAR_MENU = $('#sidebar-menu'),
    $SIDEBAR_FOOTER = $('.sidebar-footer'),
    $LEFT_COL = $('.left_col'),
    $RIGHT_COL = $('.right_col'),
    $NAV_MENU = $('.nav_menu'),
    $FOOTER = $('footer');

// Sidebar
$(document).ready(function() {
    // TODO: This is some kind of easy fix, maybe we can improve this
    var setContentHeight = function () {
        // reset height
        $RIGHT_COL.css('min-height', $(window).height());

        var bodyHeight = $BODY.outerHeight(),
            footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
            leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

        // normalize content
        contentHeight -= $NAV_MENU.height() + footerHeight;

        $RIGHT_COL.css('min-height', contentHeight);
    };

    $SIDEBAR_MENU.find('a').on('click', function(ev) {
        var $li = $(this).parent();

        if ($li.is('.active')) {
            $li.removeClass('active active-sm');
            $('ul:first', $li).slideUp(function() {
                setContentHeight();
            });
        } else {
            // prevent closing menu if we are on child menu
            if (!$li.parent().is('.child_menu')) {
                $SIDEBAR_MENU.find('li').removeClass('active active-sm');
                $SIDEBAR_MENU.find('li ul').slideUp();
            }
            
            $li.addClass('active');

            $('ul:first', $li).slideDown(function() {
                setContentHeight();
            });
        }
    });

    // toggle small or large menu
    $MENU_TOGGLE.on('click', function() {
        if ($BODY.hasClass('nav-md')) {
            $SIDEBAR_MENU.find('li.active ul').hide();
            $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
        } else {
            $SIDEBAR_MENU.find('li.active-sm ul').show();
            $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
        }

        $BODY.toggleClass('nav-md nav-sm');

        setContentHeight();

        $('.dataTable').each ( function () { $(this).dataTable().fnDraw(); });
    });

    // check active menu
    $SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

    $SIDEBAR_MENU.find('a').filter(function () {
        return this.href == CURRENT_URL;
    }).parent('li').addClass('current-page').parents('ul').slideDown(function() {
        setContentHeight();
    }).parent().addClass('active');

    // recompute content when resizing
    $(window).smartresize(function(){  
        setContentHeight();
    });

    setContentHeight();

    // fixed sidebar
    if ($.fn.mCustomScrollbar) {
        $('.menu_fixed').mCustomScrollbar({
            autoHideScrollbar: true,
            theme: 'minimal',
            mouseWheel:{ preventDefault: true }
        });
    }
});
// /Sidebar

// Panel toolbox
$(document).ready(function() {
    $('.collapse-link').on('click', function() {
        var $BOX_PANEL = $(this).closest('.x_panel'),
            $ICON = $(this).find('i'),
            $BOX_CONTENT = $BOX_PANEL.find('.x_content');
        
        // fix for some div with hardcoded fix class
        if ($BOX_PANEL.attr('style')) {
            $BOX_CONTENT.slideToggle(200, function(){
                $BOX_PANEL.removeAttr('style');
            });
        } else {
            $BOX_CONTENT.slideToggle(200); 
            $BOX_PANEL.css('height', 'auto');  
        }

        $ICON.toggleClass('fa-chevron-up fa-chevron-down');
    });

    $('.close-link').click(function () {
        var $BOX_PANEL = $(this).closest('.x_panel');

        $BOX_PANEL.remove();
    });
});
// /Panel toolbox

// Tooltip
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip({
        container: 'body'
    });
});
// /Tooltip

// Progressbar
$(document).ready(function() {
	if ($(".progress .progress-bar")[0]) {
	    $('.progress .progress-bar').progressbar();
	}
});
// /Progressbar

// Switchery
$(document).ready(function() {
    if ($(".js-switch")[0]) {
        var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
        elems.forEach(function (html) {
            var switchery = new Switchery(html, {
                color: '#26B99A'
            });
        });
    }
});
// /Switchery

// iCheck
$(document).ready(function() {
    if ($("input.flat")[0]) {
        $(document).ready(function () {
            $('input.flat').iCheck({
                checkboxClass: 'icheckbox_flat-green',
                radioClass: 'iradio_flat-green'
            });
        });
    }
});
// /iCheck

// Table
$('table input').on('ifChecked', function () {
    checkState = '';
    $thisTable = $(this).closest('table');
    $(this).parent().parent().parent().addClass('selected');
    countChecked($thisTable);
});
$('table input').on('ifUnchecked', function () {
    checkState = '';
    $thisTable = $(this).closest('table');
    $(this).parent().parent().parent().removeClass('selected');
    countChecked($thisTable);
});

var checkState = '';

$('.bulk_action input').on('ifChecked', function () {
    checkState = '';
    $thisTable = $(this).closest('table');
    $(this).parent().parent().parent().addClass('selected');
    countChecked($thisTable);
});
$('.bulk_action input').on('ifUnchecked', function () {
    checkState = '';
    $thisTable = $(this).closest('table');
    $(this).parent().parent().parent().removeClass('selected');
    countChecked($thisTable);
});
$('.bulk_action input#check-all').on('ifChecked', function () {
    checkState = 'all';
    $thisTable = $(this).closest('table');
    countChecked($thisTable);
});
$('.bulk_action input#check-all').on('ifUnchecked', function () {
    checkState = 'none';
    $thisTable = $(this).closest('table');
    countChecked($thisTable);
});

function countChecked($table) {
    if (checkState === 'all') {
        $("input[name='table_records']", $table).iCheck('check');
    }
    if (checkState === 'none') {
        $("input[name='table_records']", $table).iCheck('uncheck');
    }

    // var checkCount = $("input[name='table_records']:checked", $table).length;

    // if (checkCount) {
    //     $('.column-title', $table).hide();
    //     $('.bulk-actions', $table).show();
    //     $('.action-cnt', $table).html(checkCount + ' Records Selected');
    // } else {
    //     $('.column-title', $table).show();
    //     $('.bulk-actions', $table).hide();
    // }
}

// Accordion
$(document).ready(function() {
    $(".expand").on("click", function () {
        $(this).next().slideToggle(200);
        $expand = $(this).find(">:first-child");

        if ($expand.text() == "+") {
            $expand.text("-");
        } else {
            $expand.text("+");
        }
    });
});

// NProgress
if (typeof NProgress != 'undefined') {
    $(document).ready(function () {
        NProgress.start();
    });

    $(window).on('load', function() {
        NProgress.done();
    });
}


// Highstock chart
$(document).ready(function() {

    if ( $('#paires_suivies').length > 0 ) {
        var chartBuilder = require('./helpers/chartbuilder');
        chartBuilder.buildChart('#paires_suivies', {
            noAlertLevels: true,
            fromCurrency: 'EUR',
            toCurrency: 'USD',
        });
    }
});


// pilotage datetimepicker
$('.pilotage_timepicker').each(function() {
    $(this).datetimepicker({
        defaultDate: new Date(),
        format: 'DD/MM/YYYY',
    });
});

//dataTables 
$('table.gestion-table').each(function() {
    var $this = $(this),
        thRow = $('.main-thead-tr > th', $this),
        inputId = 'var_clmn_all',
        furnisseursIndx = thRow.index($(".furnisseurs_clmn", $this)),
        montantIndx = thRow.index($(".montant_clmn", $this)),
        coursIndx = thRow.index($(".cours_clmn", $this)),
        varIndx = thRow.index($("#var_clmn", $this)),
        gpSpotIndx = thRow.index($(".gp_spot_clmn", $this)),
        gpCtIndx = thRow.index($(".gp_ct_clmn", $this)),
        numFormatUSD = $.fn.dataTable.render.number( ' ', '\,', 2, '$ ' ).display,
        numFormatEUR = $.fn.dataTable.render.number( ' ', '\,', 2, '', ' €' ).display,
        numFormatVAR = $.fn.dataTable.render.number( '', '\,', 2, '', '%' ).display;

    var thisTable = $this.DataTable({
        paging: false,
        fixedHeader: {
            header: false,
            footer: true,
        },
        columnDefs: [
            { targets: 'no-sort', orderable: false },
            { targets: 0, orderable: false},
            { 
                targets: montantIndx,
                render: function ( data, type, row, meta ) {
                    if (montantIndx == -1) return data;
                    return numFormatUSD(data);
                }
            },
            { 
                targets: gpSpotIndx,
                render: function ( data, type, row, meta ) {
                    if (gpSpotIndx == -1) return data;
                    return numFormatEUR(data);
                }
            },
            { 
                targets: gpCtIndx,
                render: function ( data, type, row, meta ) {
                    if (gpCtIndx == -1) return data;
                    return numFormatEUR(data);
                }
            },
            { 
                targets: varIndx,
                render: function ( data, type, row, meta ) {
                    if (varIndx == -1) return data;
                    return numFormatVAR(data);
                }
            },
            {
                targets: coursIndx,
                render: function ( data, type, row, meta ) {
                    if (coursIndx == -1) return data;
                    return data.replace(/\./g, ',');
                }
            }
        ],
        initComplete: function () {
            this.api().columns('.ocws-table-filter').every( function () {
                var column = this;
                var id = $(column.header()).attr('id');
                var clmnHeader = $(column.header());
                if (id == 'var_clmn') {
                    clmnHeader.find('.dropdown-menu').append(
                        '<div class="radio"><label for="var_clmn_all" data-id="var_clmn"><input type="radio" id="var_clmn_all" checked name="var_clmn" value="3" />All</label></div>' +
                        '<div class="radio"><label for="var_clmn_critical" data-id="var_clmn"><input type="radio" id="var_clmn_critical" name="var_clmn" class="critical" value="3" />Critical (> 3%, < -3%)</label></div>' +
                        '<div class="radio"><label for="var_clmn_warning" data-id="var_clmn"><input type="radio" id="var_clmn_warning" name="var_clmn" class="warning" value="2" />Warning (> 2%, < -2%)</label></div>'
                    );
                    $('[name="'+id+'"]').iCheck({radioClass: 'iradio_flat-green'});
                } else {
                    var filterCont = '';
                    filterCont += '<table class="filter-table"><tbody><tr><td><div class="checkbox"><label for="select_all_'+id+'" data-id="'+id+'"><input type="checkbox" id="select_all_'+id+'" value="" name="'+id+'" />Select All</label></div></td></tr>';
                    column.data().unique().sort().each( function ( d, j ) {
                        filterCont += '<tr><td><div class="checkbox"><label for="'+id+'_'+d+'" data-id="'+id+'"><input type="checkbox" id="'+id+'_'+d+'" name="'+id+'" value="'+d+'" />'+d+'</label></div></td></tr>';
                    } );
                    filterCont += '</tbody></table>';
                    clmnHeader.find('.dropdown-menu').append(filterCont);
                    $('[name="'+id+'"], #select_all_'+id).iCheck({checkboxClass: 'icheckbox_flat-green'});
                }
                $('label[data-id="'+id+'"], label[data-id="'+id+'"] ins').on( 'click', function () {
                    var val = '';
                    var thisId = $(this).is('[for]') ? $(this).attr('for') : $(this).closest('label').attr('for');
                    if (id == 'var_clmn') {
                        inputId = thisId;
                        if (thisId == 'var_clmn_all') {
                            clmnHeader.removeClass('filter-active');
                        } else {
                            clmnHeader.addClass('filter-active');
                        }
                    } else if (thisId == 'select_all_'+id) {
                        column.search( '', true, false );
                        clmnHeader.removeClass('filter-active');
                    } else {
                        $('[name="'+id+'"]:checked').each(function() {
                            (val == '') ? val = $(this).val() : val = val + '|' + $(this).val();
                        });
                        column.search( val, true, false );
                        if (val == '') {
                            clmnHeader.removeClass('filter-active');
                        } else {
                            clmnHeader.addClass('filter-active');
                        }
                    }
                    varFilter();
                });
                $('#select_all_'+id).on('ifChecked ifUnchecked', function(event) {
                    if (event.type == 'ifChecked') {
                        $('[name="'+id+'"]').iCheck('check');
                    } else {
                        $('[name="'+id+'"]').iCheck('uncheck');
                    }
                    varFilter();
                });
            });
        },
        footerCallback: function ( row, data, start, end, display ) {
            var api = this.api(), data;
            var rowsCount = api.page.info().end;
            // Remove the formatting to get integer data for summation
            var intVal = function ( i ) {
                return typeof i === 'string' ?
                i.replace(/[\$,]/g, '')*1 :
                typeof i === 'number' ?
                i : 0;
            };

            // Montant EN USD TOTAL
            if (montantIndx >= 0) {
                totalMontant = api
                .column( montantIndx, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
                $( api.column( montantIndx ).footer() ).html( numFormatUSD(totalMontant) );
            }

            // GAIN/PERTE DE CHANGE SPOT TOTAL
            if (gpSpotIndx >= 0) {
                totalGpSpot = api
                .column( gpSpotIndx, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
                $( api.column( gpSpotIndx ).footer() ).html( numFormatEUR(totalGpSpot) );
            }

            // GAIN/PERTE DE CHANGE C-T TOTAL
            if (gpCtIndx >= 0) {
                totalGpCT = api
                .column( gpCtIndx, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0 );
                $( api.column( gpCtIndx ).footer() ).html( numFormatEUR(totalGpCT) );
            }

            // NOM DES FOURNISSEURS TOTAL
            if (furnisseursIndx >= 0) {
                $( api.column( furnisseursIndx ).footer() ).html( rowsCount );
            }

            if (rowsCount == 0) rowsCount = 1;
            // COURS DU DEVIS VALIDE AVERAGE
            if (coursIndx >= 0) {
                averageCours = api
                .column( coursIndx, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);
                $( api.column( coursIndx ).footer() ).html( parseFloat(averageCours/rowsCount).toFixed(5) );
            }

            // VAR inf. AVERAGE
            if (varIndx >= 0) {
                averageVar = api
                .column( varIndx, { page: 'current'} )
                .data()
                .reduce( function (a, b) {
                    return intVal(a) + intVal(b);
                }, 0);
                $( api.column( varIndx ).footer() ).html( numFormatVAR(parseFloat(averageVar/rowsCount).toFixed(2)) );
            }
        }
    });
    function varFilter() {
        $.fn.dataTable.ext.search.push(
            function( settings, data, dataIndex ) {
                var var_num = (data[varIndx] != undefined) ? parseFloat(data[varIndx].replace(/,/g, '.'), 10) : 0;
                if (inputId == 'var_clmn_all') {
                    return true;
                } else if (inputId == 'var_clmn_critical' && ( (var_num >= 3 || var_num <= -3) ) ) {
                    return true;
                } else if (inputId == 'var_clmn_warning' && ( (var_num >= 2 && var_num <= 3) || (var_num <= -2 && var_num >= -3) ) ){
                    return true;
                }
                return false;
            }
        );
        thisTable.draw();
    };
    $this.find('.dropdown-toggle').click(function(e) {
        $(this).trigger('click.bs.dropdown');
        $(this).parent().find('.dropdown-menu, .dropdown-menu-right').children().click(function(e) {
            e.stopPropagation();
        })
        e.stopPropagation();
        e.preventDefault();
    });
    $('.filter-table').DataTable({
        searching: false,
        ordering:  false,
        paging: false,
        info: false,
        columns: [{ title: "" }],
    });
    $('#reset_filters', $this).on('click', function() {
        inputId = 'var_clmn_all';
        $('#var_clmn_all', $this).iCheck('check');
        $('.filter-table input', $this).iCheck('uncheck');
        $('th.filter-active', $this).removeClass('filter-active');
        thisTable.search( '' ).columns().search( '' );
        varFilter();
    });
});

$('table.ocsw-modals-table').each(function() {
        var $this = $(this),
            montantIndx = $('thead tr > th', $this).index($(".montant_clmn", $this)),
            coursIndx = $('thead tr > th', $this).index($(".cours_clmn", $this)),
            numFormatUSD = $.fn.dataTable.render.number( ' ', '\,', 2, '$ ' ).display;

        $this.DataTable({
            searching: false,
            ordering:  false,
            paging: false,
            info: false,
            columnDefs: [
                { 
                    targets: montantIndx,
                    render: function ( data, type, row, meta ) {
                        return numFormatUSD(data);
                    }
                },
                {
                    targets: coursIndx,
                    render: function ( data, type, row, meta ) {
                        return data.replace(/\./g, ',');
                    }
                }
            ],
        });
});

// init select2 in bootstral modals
$('.modal').on('shown.bs.modal', function (event) {
    $(this).find('.select2_single').select2();
});

// hide this modal and open next(bootstrap modals buttons)
$('button[data-next-target]').on('click', function() {
    var parentModal = $(this).closest('.modal');
    var target = $(this).data('next-target');
    parentModal.on('hidden.bs.modal', function() {
        $(target).modal('show');
    });
    parentModal.modal('hide');
});

// open single invoice modal on row click
$('#invoices_list tr').on('click', function() {
    $('.single-invoice-modal').modal('show');
});