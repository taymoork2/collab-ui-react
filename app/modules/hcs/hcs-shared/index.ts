import { HcsUpgradeService } from './hcs-upgrade.service';
import { HcsSetupModalService, HcsSetupModalSelect } from './hcs-setup-modal.service';
import { HcsLicenseService } from './hcs-license.service';
import { HcsControllerService } from './hcs-controller.service';

import './hcs-no-data.scss';
import './hcs-card.scss';

export * from './hcs-base';
export * from './hcs-license';
export * from './hcs-delete-modal';
export * from './hcs-swprofile';
export * from './hcs-controller';
export * from './hcs-upgrade';
export { HcsUpgradeService,
         HcsSetupModalService,
         HcsSetupModalSelect,
         HcsLicenseService,
         HcsControllerService };

export default angular
  .module('hcs.shared.services', [
    require('@collabui/collab-ui-ng').default,
    require('angular-resource'),
  ])
  .service('HcsSetupModalService', HcsSetupModalService)
  .service('HcsUpgradeService', HcsUpgradeService)
  .service('HcsLicenseService', HcsLicenseService)
  .service('HcsControllerService', HcsControllerService)
  .name;
