import { PrivateTrunkOverviewSettingsComponent } from './private-trunk-overview-settings.component';
import privateTrunkCertificate from 'modules/hercules/service-settings/cisco-collaboration-cloud-certificate-store';
import privateTrunkPrereq from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import privateTrunkService from 'modules/hercules/private-trunk/private-trunk-services';
import privateTrunkDeactivate from 'modules/hercules/private-trunk/private-trunk-deactivate';
import privateTrunkDomain from 'modules/hercules/private-trunk/private-trunk-domain';

export default angular
  .module('hercules.private-trunk-overview-settings', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    privateTrunkPrereq,
    privateTrunkCertificate,
    privateTrunkService,
    privateTrunkDeactivate,
    privateTrunkDomain,
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
  ])
  .component('privateTrunkOverviewSettings', new PrivateTrunkOverviewSettingsComponent())
  .name;
