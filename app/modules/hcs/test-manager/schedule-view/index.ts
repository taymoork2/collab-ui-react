import { TaasScheduleViewComponent } from './schedule-view.component';
import './_schedule-view.scss';

import hcsTestManagertServiceModule from '../shared';
import notifications from 'modules/core/notifications';

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
.name;
