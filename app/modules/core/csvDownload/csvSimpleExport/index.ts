import { CsvSimpleExportComponent } from './csvSimpleExport.component';

import './_csv-simple-export.scss';

export default angular
  .module('core.csvDownload.csvSimpleExport', [
    require('angular-sanitize'),
    require('ng-csv/build/ng-csv'),
    require('@collabui/collab-ui-ng').default,
  ])
  .component('csvSimpleExport', new CsvSimpleExportComponent())
  .name;
