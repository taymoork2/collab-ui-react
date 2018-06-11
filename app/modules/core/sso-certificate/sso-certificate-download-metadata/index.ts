import { SsoCertificateDownloadMetadataComponent } from './sso-certificate-download-metadata.component';
import SsoCertificateSharedModuleName from 'modules/core/sso-certificate/shared';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notifications from 'modules/core/notifications';

export default angular.module('core.sso-certificate.sso-certificate-download-metadata', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  SsoCertificateSharedModuleName,
  multiStepModalModuleName,
  notifications,
])
  .component('ssoCertificateDownloadMetadata', new SsoCertificateDownloadMetadataComponent())
  .name;
