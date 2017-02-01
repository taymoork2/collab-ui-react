import { UserCsvExportComponent } from './userCsvExport.component';
import { UserCsvResultsComponent } from './userCsvResults.component';
import csvDownloadModule from 'modules/core/csvDownload';

import './_user-csv.scss';

export default angular
  .module('core.users.userCsv', [
    'atlas.templates',
    'collab.ui',
    csvDownloadModule,
    // TODO - This is NOT a complete set of dependencies! Must detangle from csvDownload module first.
  ])
  .component('crUserCsvExport', new UserCsvExportComponent())
  .component('crUserCsvResults', new UserCsvResultsComponent())
  .name;
