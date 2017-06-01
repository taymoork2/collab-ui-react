import { CsvSimpleExportComponent } from './csvSimpleExport.component';

import './_csv-simple-export.scss';

export default angular
  .module('core.csvDownload.csvSimpleExport', [
    require('angular-sanitize'),
    require('ng-csv/build/ng-csv'),
    require('collab-ui-ng').default,
    require('scripts/app.templates'),
  ])
  .component('csvSimpleExport', new CsvSimpleExportComponent())
  .name;
