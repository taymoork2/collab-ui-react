import { TaasResourceViewComponent } from './resources.component';
import './_resources.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';
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
.component('taasResourceView', new TaasResourceViewComponent())
.name;
