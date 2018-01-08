import { TaasSuiteViewComponent } from './taasSuiteView.component';
import './_taasSuiteView.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';
import notifications from 'modules/core/notifications';

export * from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.suiteView', [
    require('angular-resource'),
    require('modules/core/cards').default,
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
    notifications,
  ])
.component('taasSuiteView', new TaasSuiteViewComponent())
.name;
