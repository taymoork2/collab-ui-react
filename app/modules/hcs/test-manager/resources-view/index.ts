import { ResourceViewComponent } from './resources-view.component';
import './_resources-view.scss';

import hcsTestManagertServiceModule from '../shared';
import notifications from 'modules/core/notifications';

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
.name;
