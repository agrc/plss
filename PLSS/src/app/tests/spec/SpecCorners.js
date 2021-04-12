require([
    'app/Corners',

    'dojo/_base/window',

    'dojo/dom-style',
    'dojo/dom-attr',
    'dojo/dom-construct',

    'agrc/widgets/map/BaseMap',

    'dojo/domReady!'
], function (
    Corner,

    win,

    domStyle,
    domAttr,
    domConstruct,

    Map
) {
    describe('app/Corners', function () {
        var testWidget;
        window.AGRC = {
            urls: {
                points: 'http://mapserv.utah.gov/arcgis/rest/services/PLSS/MapServer',
                tieSheets: 'http://turngps.utah.gov/pdf/tiesheets/'
            }
        };

        beforeEach(function () {
            var map = new Map(domConstruct.create('div', {}, win.body()));
            testWidget = new Corner({
                map: map
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Corner));
        });

        describe('zooms to corner', function () {
            it('builds the right query string', function () {
                testWidget._zoom('UT260090N0070E0_200400');

                expect(testWidget.queryParams.where).toEqual('POINTID=\'UT260090N0070E0_200400\'');
            });

            it('builds the right url', function () {
                testWidget._zoom('UT260090N0070E0_200400');

                expect(testWidget.queryTask.url).toEqual('http://mapserv.utah.gov/arcgis/rest/services/PLSS/MapServer/4');
            });

            it('shows progress somehow', function () {
                testWidget.corner.value = '1';
                testWidget.zoom();

                expect(domAttr.has(testWidget.zoomButton, 'disabled')).toBeTruthy();
            });

            it('shows a graphic and zooms to it', function () {
                spyOn(testWidget.map, 'setExtent');

                testWidget._success({
                    'displayFieldName': 'TieSheet_Name',
                    'fieldAliases': {
                        'POINTID': 'Corner Point Identifier'
                    },
                    'geometryType': 'esriGeometryPoint',
                    'spatialReference': {
                        'wkid': 26912,
                        'latestWkid': 26912
                    },
                    'fields': [{
                        'name': 'POINTID',
                        'type': 'esriFieldTypeString',
                        'alias': 'Corner Point Identifier',
                        'length': 24
                    }],
                    'features': [{
                        'attributes': {
                            'POINTID': 'UT260090N0070E0_200400'
                        },
                        'geometry': {
                            'x': 484322.20999999996,
                            'y': 4595420.6500000004
                        }
                    }]
                });

                expect(testWidget._graphic.geometry.x).toEqual(484322.20999999996);
                expect(testWidget.map.setExtent).toHaveBeenCalled();
            });
        });

        describe('show tie sheet', function () {
            it('bulds the right url', function () {
                spyOn(testWidget, '_openWindow');

                testWidget.corner.value = '1';
                testWidget.showTieSheet();

                expect(testWidget._openWindow).toHaveBeenCalledWith('http://turngps.utah.gov/pdf/tiesheets/1.pdf');
            });
        });
    });
});
