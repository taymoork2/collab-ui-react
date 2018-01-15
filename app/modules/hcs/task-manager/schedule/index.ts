import { TaasScheduleViewComponent } from './schedule-view.component';
import { ScheduleCreateComponent } from './schedule-create.component';
import './_schedule.scss';

import notifications from 'modules/core/notifications';
import hcsTestManagertServiceModule from '../shared';

export default angular
  .module('hcs.taas.schedule', [
    require('angular-resource'),
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
    notifications,
  ])
.component('taasScheduleView', new TaasScheduleViewComponent())
.component('scheduleCreateModal', new ScheduleCreateComponent())
.name;
