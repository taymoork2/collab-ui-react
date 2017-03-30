import { PrivateTrunkSetupComponent } from './privateTrunkSetup.component';
import { PrivateTrunkSetupDomainComponent } from './privateTrunkSetupDomain.component';
import privateTrunkPrereq from 'modules/hercules/privateTrunk/privateTrunkPrereq';

export default angular
  .module('hercules.private-trunk-setup', [
    'atlas.templates',
    'collab.ui',
    'pascalprecht.translate',
    privateTrunkPrereq,
  ])
  .component('privateTrunkSetup', new PrivateTrunkSetupComponent())
  .component('privateTrunkSetupDomain', new PrivateTrunkSetupDomainComponent())
  .name;
