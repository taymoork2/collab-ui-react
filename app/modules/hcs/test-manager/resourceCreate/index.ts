import { ResourceCreateComponent } from './resourceCreate.component';
import './_resourceCreate.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';

export * from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.resourceCreate', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('resourceCreateModal', new ResourceCreateComponent())
.name;
