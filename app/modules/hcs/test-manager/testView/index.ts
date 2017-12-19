import { TaasTestViewComponent } from './taasTestView.component';
import './_taasTestView.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';

export * from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.testView', [
    require('angular-resource'),
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('taasTestView', new TaasTestViewComponent())
.name;
