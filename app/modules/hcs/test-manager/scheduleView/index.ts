import { TaasScheduleViewComponent } from './scheduleView.component';
import './_scheduleView.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';
import notifications from 'modules/core/notifications';

export default angular
  .module('hcs.taas.schedule', [
    require('angular-resource'),
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
    notifications,
  ])
.component('taasScheduleView', new TaasScheduleViewComponent())
.name;
