import { TaasTestViewComponent } from './taasTestView.component';
import './_taasTestView.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';
import notifications from 'modules/core/notifications';

export * from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.testView', [
    require('angular-resource'),
    require('modules/core/cards').default,
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
    notifications,
  ])
.component('taasTestView', new TaasTestViewComponent())
.name;
