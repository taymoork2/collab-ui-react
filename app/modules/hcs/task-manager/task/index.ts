import { TaskViewComponent } from './task-view.component';
import './_task.scss';

import notifications from 'modules/core/notifications';
import hcsTestManagertServiceModule from '../shared';

export default angular
  .module('hcs.taas.testView', [
    require('angular-resource'),
    require('modules/core/cards').default,
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    notifications,
    hcsTestManagertServiceModule,
  ])
  .component('taasTaskView', new TaskViewComponent())
  .name;
