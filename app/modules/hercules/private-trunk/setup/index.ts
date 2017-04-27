import { PrivateTrunkSetupComponent } from './private-trunk-setup.component';
import { PrivateTrunkDomainComponent } from './private-trunk-domain.component';
import { PrivateTrunkDestinationComponent } from './private-trunk-destination.component';
import { PrivateTrunkSetupCompleteComponent } from './private-trunk-setup-complete.component';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
import 'modules/hercules/private-trunk/_private-trunk.scss';
import privateTrunkPrereq from 'modules/hercules/private-trunk/prereq';
import privateTrunkCertificate from 'modules/hercules/private-trunk/private-trunk-certificate';
export * from './private-trunk-setup';

export default angular
  .module('hercules.private-trunk-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
    privateTrunkService,
    privateTrunkCertificate,
    require('modules/hercules/services/uss-service'),
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
  ])
  .component('privateTrunkSetup', new PrivateTrunkSetupComponent())
  .component('privateTrunkDomain', new PrivateTrunkDomainComponent())
  .component('privateTrunkDestination', new PrivateTrunkDestinationComponent())
  .component('privateTrunkSetupComplete', new PrivateTrunkSetupCompleteComponent())
  .name;
