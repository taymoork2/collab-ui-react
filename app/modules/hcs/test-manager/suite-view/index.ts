import { SuiteViewComponent } from './suite-view.component';
import './_suite-view.scss';

import hcsTestManagertServiceModule from '../shared';
import notifications from 'modules/core/notifications';

export * from '../shared';

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
.name;
