import { PrivateTrunkSetupComponent } from './private-trunk-setup.component';
import { PrivateTrunkDomainComponent } from './private-trunk-domain.component';
import { PrivateTrunkDestinationComponent } from './private-trunk-destination.component';
import { PrivateTrunkCertificateComponent } from './private-trunk-certificate.component';
import { PrivateTrunkSetupCompleteComponent } from './private-trunk-setup-complete.component';
import { PrivateTrunkService } from './private-trunk.service';
import 'modules/hercules/private-trunk/_private-trunk.scss';
import privateTrunkPrereq from 'modules/hercules/private-trunk/prereq';
export * from './private-trunk-setup';
export * from './private-trunk.service';

export default angular
  .module('hercules.private-trunk-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
    require('modules/hercules/services/uss-service'),
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
  ])
  .component('privateTrunkSetup', new PrivateTrunkSetupComponent())
  .component('privateTrunkDomain', new PrivateTrunkDomainComponent())
  .component('privateTrunkDestination', new PrivateTrunkDestinationComponent())
  .component('privateTrunkCertificate', new PrivateTrunkCertificateComponent())
  .component('privateTrunkSetupComplete', new PrivateTrunkSetupCompleteComponent())
  .service('PrivateTrunkService', PrivateTrunkService)
  .name;
