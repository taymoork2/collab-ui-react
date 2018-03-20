export * from './hcs-base';
import { HcsUpgradeService } from './hcs-upgrade.service';
import { HcsSetupModalService } from './hcs-setup-modal.service';

export * from './hcs-setup-modal.service';
export default angular
  .module('hcs.shared.services', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .service('HcsSetupModalService', HcsSetupModalService)
  .service('HcsUpgradeService', HcsUpgradeService)
  .name;
