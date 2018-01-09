import { TaasScheduleViewComponent } from './scheduleView.component';
import './_scheduleView.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.schedule', [
    require('angular-resource'),
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('taasScheduleView', new TaasScheduleViewComponent())
.name;
