import { SuiteViewComponent } from './suite-view.component';
import { SuiteCreateComponent } from './suite-create.component';
import './_suite.scss';

import hcsTestManagertServiceModule from '../shared';
import notifications from 'modules/core/notifications';

export default angular
  .module('hcs.taas.suiteView', [
    require('angular-resource'),
    require('modules/core/cards').default,
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
    notifications,
  ])
  .component('taasSuiteView', new SuiteViewComponent())
  .component('suiteCreateModal', new SuiteCreateComponent())
  .name;
