require([
    'dojo/text!plss/templates/Geo_NAD83.html',
    'dojo/text!plss/templates/Geo_WGS84_NAD27.html',
    'dojo/text!plss/templates/Grid_NAD83StatePlane.html',
    'dojo/text!plss/templates/Grid_NAD27StatePlane.html',
    'dojo/text!plss/templates/Grid_Utm.html',

    'agrc/widgets/locate/TRSsearch',

    'ijit/widgets/upload/MultiFileUploader',

    'app/main',

    'dojo/_base/lang',
    'dojo/_base/event',

    'dojo/dom-construct',
    'dojo/dom-class',

    'dojo/dom',
    'dojo/on',
    'dojo/html',
    'dojo/query',
    'dojo/parser',


    'dojo/domReady!'
], function(
    nad83,
    wgs84,
    nad83tatePlane,
    nad27StatePlane,
    utm,

    Trs,

    Uploader,

    settings,

    lang,
    events,

    domConstruct,
    domClass,

    dom,
    on,
    html,
    query,
    parser
) {
    var trs = new Trs({
        apiKey: settings.apiKey,
        requireSection: true,
        formName: 'township'
    }, 'trsNode');

    var uploader = new Uploader({
        max: 10,
        labelText: 'Extra Pages',
        moreLabel: 'Add Another Page'
    }, 'uploaderNode');

    uploader.startup();
    trs.startup();

    var geoNode = dom.byId('geographicNode'),
        gridNode = dom.byId('gridNode');

    html.set(geoNode, wgs84);
    html.set(gridNode, nad83tatePlane);

    var swapTemplateForGeographic = function(evt) {
        console.log('swapTemplateForGeographic');

        var value = evt.target.value;
        switch (value) {
        case 'WGS84 Geographic':
            html.set(geoNode, wgs84);
            break;
        case 'NAD27 Geographic':
            html.set(geoNode, wgs84);
            break;
        case 'NAD83 Geographic':
            html.set(geoNode, nad83);
            break;
        }
    };

    var swapTemplateForGrid = function(evt) {
        console.log('swapTemplateForGrid');

        var value = evt.target.value;
        switch (value) {
        case 'NAD83 State Plane':
            html.set(gridNode, nad83tatePlane);
            break;
        case 'NAD83 UTM Zone 12N':
            html.set(gridNode, utm);
            break;
        case 'NAD83 UTM Zone 11N':
            html.set(gridNode, utm);
            break;
        case 'NAD27 State Plane':
            html.set(gridNode, nad27StatePlane);
            break;
        }
    };

    var form = dom.byId('cornerForm');

    var validateAll = function(evt) {
        console.log('validateAll');

        var valid = true;
        var formNodes = query('[data-required="true"]', form);

        //reset validation
        formNodes.forEach(function(node) {
            domClass.remove(node.parentElement, 'has-error');
            domClass.remove(node.parentElement, 'has-success');
        });

        //validate input
        formNodes.forEach(function(node) {
            if (!node.value || lang.trim(node.value) === '') {
                domClass.add(node.parentElement, 'has-error');
                valid = false;
            } else {
                domClass.add(node.parentElement, 'has-success');
            }
        });

        if (!valid) {
            events.stop(evt);
        }

        var add = valid ? 'hidden' : 'show',
            remove = valid ? 'show' : 'hidden';

        domClass.replace(dom.byId('messageNode'), add, remove);


        return valid;
    };
    var validate = function(evt) {
        console.log('validate');

        var node = evt.target;

        domClass.remove(node.parentElement, 'has-error');
        domClass.remove(node.parentElement, 'has-success');

        if (!node.value || lang.trim(node.value) === '') {
            domClass.add(node.parentElement, 'has-error');
        } else {
            domClass.add(node.parentElement, 'has-success');
        }
    };

    on(dom.byId('geographic'), 'change', swapTemplateForGeographic);
    on(dom.byId('grid'), 'change', swapTemplateForGrid);
    on(form, 'submit', validateAll);
    on(form, 'input:change', validate);
    on(form, 'select:change', validate);
    on(form, 'textarea:change', validate);

    parser.parse();
    //            Populatr.init(true, {
    //                '#cornerForm': {             // CSS selector to select the form
    //                    'county': 'Davis',     // 'Input name': 'Input value'
    //                    'collectionDate': '2014-01-14',
    //                    'blmpointid': 'UT260160S0120E0_640340',
    //                    'accuracy': 'Recreational Grade (+/-) 30m',
    //                    'sectionCorner': 'N 1/4',
    //                    'monumentStatus': 'Lost',
    //                    'description': 'Coordinates were determined by GPS RTK'+
    //                                  ' survey method with base receiver at Beaver County GPS Control Point “Laho.”'+
    //                                  ' Coordinate data obtained by single side shot method with no adjustment.  '+
    //                                  'Two measurements made to this corner, each with a '+
    //                                  'different initialization, and then averaged.  ' +
    //                                  'No other adjustment.',
    //                    'notes': 'Base location derived using OPUS solution, Point location using '+
    //                              'Trimble RTK observed control point.  '+
    //                              'Found 1983 BLM aluminum cap in line with N-S fence on south side of County Road',
    //                    'Coordinate.NorthingDegrees': 111,
    //                    'Coordinate.NorthingMinutes': 11,
    //                    'Coordinate.NorthingSeconds': 51.23532,
    //                    'Coordinate.EastingDegrees': -41,
    //                    'Coordinate.EastingMinutes': 10,
    //                    'Coordinate.EastingSeconds': 11.23532,
    //                    'Coordinate.ElipsoidHeight': 50.5,
    //                    'Grid.HorizontalUnits': 'International Feet',
    //                    'Grid.Adjustment': 'NGS 2011',
    //                    'Grid.Northing': 414290,
    //                    'Grid.Easting': 4755566,
    //                    'Grid.Elevation': 100
    //                }
    //            });
});
