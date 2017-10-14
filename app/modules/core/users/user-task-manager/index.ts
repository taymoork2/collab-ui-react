import { UserTaskManagerModalComponent } from './user-task-manager.component';
import { CsvUploadResultsComponent } from './csv-upload-results.component';
import { UserTaskManagerService } from './user-task-manager.service';
import notificationsModule from 'modules/core/notifications';
import modalServiceModule from 'modules/core/modal';

import './user-task-manager.scss';
import './csv-upload-results.scss';

export * from './user-task-manager.service';

export default angular
  .module('core.users.user-task-manager', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    modalServiceModule,
    notificationsModule,
  ])
  .component('userTaskManagerModal', new UserTaskManagerModalComponent())
  .component('csvUploadResults', new CsvUploadResultsComponent())
  .service('UserTaskManagerService', UserTaskManagerService)
  .name;
