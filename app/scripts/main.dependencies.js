require('@collabui/collab-amcharts/amcharts/amcharts.js');
require('@collabui/collab-amcharts/amcharts/pie.js');
require('@collabui/collab-amcharts/amcharts/serial.js');
require('@collabui/collab-amcharts/amcharts/funnel.js');
require('@collabui/collab-amcharts/amcharts/gantt.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/export.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/fabric.js/fabric.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/blob.js/blob.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/jszip/jszip.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/FileSaver.js/FileSaver.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/pdfmake/pdfmake.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/pdfmake/vfs_fonts.js');
require('@collabui/collab-amcharts/amcharts/plugins/export/libs/xlsx/xlsx.js');
require('@collabui/collab-amcharts/amcharts/themes/light.js');
requireAll(require.context('file-loader?name=amcharts/images/[name].[ext]?[hash]!@collabui/collab-amcharts/amcharts/images', false));

require('@atlas/bmmp/cisco-bmmp.js');

require('typeahead.js/dist/typeahead.bundle.js');
require('draggable.js/draggable.js');

require('ng-csv/build/ng-csv.js');

require('api-check/dist/api-check.js');
require('angular-formly/dist/formly.js');
require('@collabui/collab-ui-formly/dist/collab-formly.js');

require('angular-ui-grid/ui-grid.js');

require('bootstrap-tokenfield');
require('moment-timezone/builds/moment-timezone-with-data-2010-2020.js');
require('moment-range/dist/moment-range.js');

require('jquery-csv/src/jquery.csv.js');
require('angular-timer/dist/angular-timer.js');
require('angularjs-slider/dist/rzslider.min.js');
require('ng-file-upload/dist/ng-file-upload.js');

require('jstimezonedetect');

require('ng-tags-input/build/ng-tags-input.js');

require('angular-cache/dist/angular-cache.js');

require('clipboard');
require('ngclipboard');
require('query-command-supported/dist/queryCommandSupported.js');
require('ical.js/build/ical.js');
require('angular-ical/dist/js/angular-ical.js');
require('oclazyload');

require('expose-loader?_!lodash'); // expose current lodash as a global since `pdfmake` is overwriting the previous global to custom 3.1.0

function requireAll(requireContext) {
  return requireContext.keys().map(requireContext);
}
