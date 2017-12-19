import { TaasResourceViewComponent } from './resources.component';
import './_resources.scss';

import hcsTestManagertServiceModule from 'modules/hcs/test-manager/shared';

export default angular
  .module('hcs.taas.resources', [
    require('angular-resource'),
    require('angular-translate'),
    require('collab-ui-ng').default,
    require('modules/core/config/config').default,
    hcsTestManagertServiceModule,
  ])
.component('taasResourceView', new TaasResourceViewComponent())
.name;
