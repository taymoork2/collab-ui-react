import { PrivateTrunkDomainComponent } from './private-trunk-domain.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/private-trunk-prereq';

export default angular
  .module('hercules.private-trunk-domain', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
  ])
  .component('privateTrunkDomain', new PrivateTrunkDomainComponent())
  .name;
