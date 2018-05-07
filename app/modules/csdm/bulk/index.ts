import { BulkComponent } from './bulk.component';
import { BulkModalComponent } from './bulkModal.component';
import { BulkDeleteComponent } from './bulkDelete.component';
import { BulkExportComponent } from './bulkExport.component';

require('./_bulk.scss');

export default angular
  .module('Csdm.bulk', [
    'Csdm.services',
    require('angular-resource'),
    require('angular-translate'),
    require('angular-sanitize'),
    require('modules/core/scripts/services/missing-translation-handler.factory').default,
    require('modules/core/analytics'),
  ])
  .component('bulk', new BulkComponent())
  .component('bulkModal', new BulkModalComponent())
  .component('bulkDelete', new BulkDeleteComponent())
  .component('bulkExport', new BulkExportComponent())
  .name;
