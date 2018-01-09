import { SuiteCreateComponent } from './suite-create.component';
import './_suite-create.scss';
import hcsTestManagertServiceModule from '../shared';

export * from '../shared';

export default angular.module('hcs.taas.suiteCreate', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/config/config').default,
  hcsTestManagertServiceModule,
])
.component('suiteCreateModal', new SuiteCreateComponent())
.name;
