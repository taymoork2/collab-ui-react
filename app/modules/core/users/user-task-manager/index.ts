import { UserTaskManagerModalComponent } from './user-task-manager.component';
import { CsvUploadResultsComponent } from './csv-upload-results.component';
import { TaskListItemComponent } from './task-list-item/task-list-item.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TaskListFilterComponent } from './task-list-filter/task-list-filter.component';
import { UserTaskManagerService } from './user-task-manager.service';
import { UserTaskStatusComponent } from './user-task-status.component';
import modalModuleName from 'modules/core/modal';
import notificationsModuleName from 'modules/core/notifications';
import coreSharedModuleName from 'modules/core/shared';
import featureToggleModuleName from 'modules/core/featureToggle';
import usersSharedModuleName from 'modules/core/users/shared';

import './user-task-manager.scss';
import './csv-upload-results.scss';

export * from './user-task-manager.service';

export default angular
  .module('core.users.user-task-manager', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/users/userCsv/userCsv.service'),
    modalModuleName,
    notificationsModuleName,
    coreSharedModuleName,
    featureToggleModuleName,
    usersSharedModuleName,
  ])
  .component('userTaskManagerModal', new UserTaskManagerModalComponent())
  .component('csvUploadResults', new CsvUploadResultsComponent())
  .component('userTaskListFilter', new TaskListFilterComponent())
  .component('userTaskListItem', new TaskListItemComponent())
  .component('userTaskList', new TaskListComponent())
  .component('userTaskStatus', new UserTaskStatusComponent())
  .service('UserTaskManagerService', UserTaskManagerService)
  .name;
