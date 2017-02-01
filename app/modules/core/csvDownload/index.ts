import { CsvDownloadService, CsvDownloadTypes } from './csvDownload.service';
import { CsvDownloadComponent } from './csvDownload.component';
import { ExtractTarService } from './extractTar.service';
import notificationsModule from 'modules/core/notifications';
import featureToggleModule from 'modules/core/featureToggle';

let analyticsModule = require('modules/core/analytics');
let userListServiceModule = require('modules/core/scripts/services/userlist.service');

import './_csv-download.scss';

export { CsvDownloadService, CsvDownloadTypes, ExtractTarService };

export default angular
  .module('core.csvDownload', [
    'ngResource',
    'atlas.templates',
    'collab.ui',
    analyticsModule,
    featureToggleModule,
    notificationsModule,
    userListServiceModule,
    'core.users.userCsv', // WARNING: This is creating a circular dependency!!
  ])
  .service('CsvDownloadTypes', CsvDownloadTypes)
  .service('CsvDownloadService', CsvDownloadService)
  .component('csvDownload', new CsvDownloadComponent())
  .service('ExtractTarService', ExtractTarService)
  .name;
