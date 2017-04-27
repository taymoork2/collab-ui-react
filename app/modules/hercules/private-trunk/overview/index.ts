import { PrivateTrunkOverviewComponent } from './private-trunk-overview.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/prereq';
import privateTrunkCertificate from 'modules/hercules/private-trunk/private-trunk-certificate';

export default angular
  .module('hercules.private-trunk-overview', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
    privateTrunkCertificate,
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
  ])
  .component('privateTrunkOverview', new PrivateTrunkOverviewComponent())
  .name;
