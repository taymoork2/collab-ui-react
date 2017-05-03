import { PrivateTrunkOverviewSettingsComponent } from './private-trunk-overview-settings.component';
import privateTrunkPrereq from 'modules/hercules/private-trunk/private-trunk-prereq';
import privateTrunkCertificate from 'modules/hercules/private-trunk/private-trunk-certificate';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
export default angular
  .module('hercules.private-trunk-overview-settings', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
    privateTrunkCertificate,
    privateTrunkService,
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
  ])
  .component('privateTrunkOverviewSettings', new PrivateTrunkOverviewSettingsComponent())
  .name;
