import { PrivateTrunkPrereqComponent } from './private-trunk-prereq.component';
import { PrivateTrunkPrereqService } from './private-trunk-prereq.service';
import domainManagementService from 'modules/core/domainManagement';
export * from './private-trunk-prereq.service';

export default angular
  .module('hercules.private-trunk-prereq', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/featureToggle').default,
    domainManagementService,
  ])
  .component('privateTrunkPrereq', new PrivateTrunkPrereqComponent())
  .service('PrivateTrunkPrereqService', PrivateTrunkPrereqService)
  .name;
