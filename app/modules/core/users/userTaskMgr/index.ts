import { UserTaskMgrComponent } from './user-task-mgr.component';
import { CsvUploadResultsComponent } from './csv-upload-results.component';
import { UserTaskMgrService } from './user-task-mgr.service';
import notifications from 'modules/core/notifications';
import modalServiceModule from 'modules/core/modal';

import './user-task-mgr.scss';
import './csv-upload-results.scss';

export * from './user-task-mgr.service';

export default angular
  .module('core.users.user-task-mgr', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    modalServiceModule,
    notifications,
  ])
  .component('userTaskMgr', new UserTaskMgrComponent())
  .component('csvUploadResults', new CsvUploadResultsComponent())
  .service('UserTaskMgrService', UserTaskMgrService)
  .name;
