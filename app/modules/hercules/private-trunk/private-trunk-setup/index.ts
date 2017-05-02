import { PrivateTrunkSetupComponent } from './private-trunk-setup.component';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
import 'modules/hercules/private-trunk/_private-trunk.scss';
import privateTrunkPrereq from 'modules/hercules/private-trunk/private-trunk-prereq';
import privateTrunkCertificate from 'modules/hercules/private-trunk/private-trunk-certificate';
import privateTrunkDomain from 'modules/hercules/private-trunk/private-trunk-domain';
import privateTrunkDestination from 'modules/hercules/private-trunk/private-trunk-destination';
import privateTrunkSetupComplete from 'modules/hercules/private-trunk/private-trunk-setup-complete';

export * from './private-trunk-setup';

export default angular
  .module('hercules.private-trunk-setup', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hercules/services/uss-service'),
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
    privateTrunkPrereq,
    privateTrunkService,
    privateTrunkDomain,
    privateTrunkDestination,
    privateTrunkCertificate,
    privateTrunkSetupComplete,
  ])
  .component('privateTrunkSetup', new PrivateTrunkSetupComponent())
  .name;
