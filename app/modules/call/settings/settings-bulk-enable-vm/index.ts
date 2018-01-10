import './settings-bulk-enable-vm.component.scss';

import { BulkEnableVmComponent } from './settings-bulk-enable-vm.component';
import { BulkEnableVmService } from './settings-bulk-enable-vm.service';
import featureToggleModule from 'modules/core/featureToggle';
export * from './settings-bulk-enable-vm.service';

export default angular
  .module('call.settings.bulk-enable-vm', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    featureToggleModule,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/userlist.service'),
    require('modules/huron/telephony/cmiServices'),
    require('modules/core/users/userCsv/userCsv.service'),
  ])
  .component('ucBulkEnableVm', new BulkEnableVmComponent())
  .service('BulkEnableVmService', BulkEnableVmService)
  .name;
