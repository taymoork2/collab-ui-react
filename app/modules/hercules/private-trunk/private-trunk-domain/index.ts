import { PrivateTrunkDomainComponent } from './private-trunk-domain.component';
import privateTrunkPrereq from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';

export default angular
  .module('hercules.private-trunk-domain', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
  ])
  .component('privateTrunkDomain', new PrivateTrunkDomainComponent())
  .name;
