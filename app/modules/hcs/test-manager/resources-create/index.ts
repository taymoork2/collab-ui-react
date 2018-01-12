import { ResourcesCreateComponent } from './resources-create.component';
import './_resources-create.scss';

import hcsTestManagertServiceModule from '../shared';

export * from '../shared';

export default angular
  .module('hcs.taas.resourcesCreate', [
    require('angular-translate'),
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('resourcesCreateModal', new ResourcesCreateComponent())
.name;
