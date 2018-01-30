import { ResourceViewComponent } from './resource-view.component';
import { ResourceCreateComponent } from './resource-create.component';
import './_resource.scss';

import notifications from 'modules/core/notifications';
import hcsTestManagertServiceModule from '../shared';

export default angular
  .module('hcs.taas.resources', [
    require('angular-resource'),
    require('angular-translate'),
    require('modules/core/cards').default,
    require('@collabui/collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
    notifications,
  ])
.component('taasResourceView', new ResourceViewComponent())
.component('resourceCreateModal', new ResourceCreateComponent())
.name;
