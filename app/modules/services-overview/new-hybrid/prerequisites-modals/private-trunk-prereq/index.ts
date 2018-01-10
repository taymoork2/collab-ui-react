import { PrivateTrunkPrereqComponent } from './private-trunk-prereq.component';
import { PrivateTrunkPrereqService } from './private-trunk-prereq.service';
import domainManagementService from 'modules/core/domainManagement';
import HybridServicesPrerequisitesHelperServiceModuleName from 'modules/services-overview/new-hybrid/prerequisites-modals/hybrid-services-prerequisites-helper.service';
import NotificationModuleName from 'modules/core/notifications';
export * from './private-trunk-prereq.service';

export default angular
  .module('hercules.private-trunk-prereq', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/core/featureToggle').default,
    domainManagementService,
    HybridServicesPrerequisitesHelperServiceModuleName,
    NotificationModuleName,
  ])
  .component('privateTrunkPrereq', new PrivateTrunkPrereqComponent())
  .service('PrivateTrunkPrereqService', PrivateTrunkPrereqService)
  .name;
