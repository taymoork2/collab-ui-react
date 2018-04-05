import { HcsUpgradeService } from './hcs-upgrade.service';
import { HcsSetupModalService, HcsSetupModalSelect } from './hcs-setup-modal.service';

export * from './hcs-base';
export { HcsUpgradeService, HcsSetupModalService, HcsSetupModalSelect };

export default angular
  .module('hcs.shared.services', [
    require('@collabui/collab-ui-ng').default,
    require('angular-resource'),
  ])
  .service('HcsSetupModalService', HcsSetupModalService)
  .service('HcsUpgradeService', HcsUpgradeService)
  .name;
