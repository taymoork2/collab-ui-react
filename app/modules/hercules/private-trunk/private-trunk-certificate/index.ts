import { PrivateTrunkCertificateComponent } from './private-trunk-certificate.component';
import { PrivateTrunkCertificateService } from './private-trunk-certificate.service';

export * from './private-trunk-certificate.service';

export default angular
  .module('hercules.private-trunk-certificate', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('privateTrunkCertificate', new PrivateTrunkCertificateComponent())
  .service('PrivateTrunkCertificateService', PrivateTrunkCertificateService)
  .name;
