import { SchedulerComponent } from './scheduler.component';
import './_scheduler.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';

export * from 'modules/hcs/test-manager/shared';
export * from 'modules/hcs/test-manager/scheduler/dateObj';

export default angular
  .module('hcs.taas.scheduler', [
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('tsmModal', new SchedulerComponent())
.name;
