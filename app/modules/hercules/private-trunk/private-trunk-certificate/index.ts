import { PrivateTrunkCertificateComponent } from './private-trunk-certificate.component';
import { PrivateTrunkCertificateService } from './private-trunk-certificate.service';
import featureToggle from 'modules/core/featureToggle';
export * from './private-trunk-certificate.service';

export default angular
  .module('hercules.private-trunk-certificate', [
    require('collab-ui-ng').default,
    require('angular-translate'),
    require('modules/hercules/services/cert-service').default,
    require('modules/hercules/services/certificate-formatter-service').default,
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/notifications').default,
    featureToggle,
  ])
  .component('privateTrunkCertificate', new PrivateTrunkCertificateComponent())
  .service('PrivateTrunkCertificateService', PrivateTrunkCertificateService)
  .name;
