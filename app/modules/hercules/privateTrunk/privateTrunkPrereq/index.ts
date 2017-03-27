import { PrivateTrunkPrereqComponent } from './privateTrunkPrereq.component';
import { PrivateTrunkPrereqService } from './privateTrunkPrereq.service';
import domainManagementService from 'modules/core/domainManagement';
export * from './privateTrunkPrereq.service';

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
