import { CiscoCollaborationCloudCertificateStoreComponent } from './cisco-collaboration-cloud-certificate-store.component';
import { CiscoCollaborationCloudCertificateService } from './cisco-collaboration-cloud-certificate.service';
import featureToggle from 'modules/core/featureToggle';
export * from './cisco-collaboration-cloud-certificate.service';

export default angular
  .module('hercules.cisco-collaboration-cloud-certificates', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/notifications').default,
    featureToggle,
  ])
  .component('ciscoCollaborationCloudCertificateStore', new CiscoCollaborationCloudCertificateStoreComponent())
  .service('CiscoCollaborationCloudCertificateService', CiscoCollaborationCloudCertificateService)
  .name;
