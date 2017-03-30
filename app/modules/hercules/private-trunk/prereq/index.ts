import { PrivateTrunkPrereqComponent } from './private-trunk-prereq.component';
import { PrivateTrunkPrereqService } from './private-trunk-prereq.service';
import domainManagementService from 'modules/core/domainManagement';
export * from './private-trunk-prereq.service';

export default angular
  .module('hercules.private-trunk-prereq', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    domainManagementService,
  ])
  .component('privateTrunkPrereq', new PrivateTrunkPrereqComponent())
  .service('PrivateTrunkPrereqService', PrivateTrunkPrereqService)
  .name;
