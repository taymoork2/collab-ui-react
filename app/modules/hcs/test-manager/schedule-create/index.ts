import { ScheduleCreateComponent } from './schedule-create.component';
import './_schedule-create.scss';

import hcsTestManagertServiceModule from '../shared';

export * from '../shared';

export default angular
  .module('hcs.taas.scheduleCreate', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('scheduleCreateModal', new ScheduleCreateComponent())
.name;
