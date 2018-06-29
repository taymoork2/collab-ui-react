import './cr-csv-download.scss';

import notificationsModuleName from 'modules/core/notifications';
import { CrCsvDownloadComponent } from './cr-csv-download.component';
import 'jquery-csv';

export default angular.module('core.shared.cr-csv-download', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  notificationsModuleName,
])
  .component('crCsvDownload', new CrCsvDownloadComponent())
  .name;
