import { CheckCertificateComponent } from './check-certificate/check-certificate.component';
import { CertificateTypeComponent } from './certificate-type/certificate-type.component';
import { DownloadMetadataFileComponent } from './download-metadata-file/download-metadata-file.component';
import { TestSsoComponent } from './test-sso/test-sso.component';
import { SsoCertificateService } from './sso-certificate.service';
import notifications from 'modules/core/notifications';
import modalModuleName from 'modules/core/modal';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import './sso-certificate.scss';

export * from './sso-certificate.service';

export default angular.module('core.sso-certificate', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  require('modules/core/scripts/services/authinfo'),
  notifications,
  modalModuleName,
  multiStepModalModuleName,
])
  .component('checkCertificate', new CheckCertificateComponent())
  .component('certificateType', new CertificateTypeComponent())
  .component('downloadMetadataFile', new DownloadMetadataFileComponent())
  .component('testSso', new TestSsoComponent())
  .service('SsoCertificateService', SsoCertificateService)
  .name;
