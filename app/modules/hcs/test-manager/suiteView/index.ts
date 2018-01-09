import { TaasSuiteViewComponent } from './taasSuiteView.component';
import './_taasSuiteView.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';

export * from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.suiteView', [
    require('angular-resource'),
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('taasSuiteView', new TaasSuiteViewComponent())
.name;
