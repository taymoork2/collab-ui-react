import { PrivateTrunkSetupComponent } from './private-trunk-setup.component';
import { PrivateTrunkDomainComponent } from './private-trunk-domain.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/prereq';

export default angular
  .module('hercules.private-trunk-setup', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    privateTrunkPrereq,
  ])
  .component('privateTrunkSetup', new PrivateTrunkSetupComponent())
  .component('privateTrunkDomain', new PrivateTrunkDomainComponent())
  .name;
