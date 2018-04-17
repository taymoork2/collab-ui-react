import { SsoCertificateCheckComponent } from './sso-certificate-check.component';
import SsoCertificateSharedModuleName from 'modules/core/sso-certificate/shared';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import notifications from 'modules/core/notifications';

export default angular.module('core.sso-certificate.sso-certificate-check', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  SsoCertificateSharedModuleName,
  multiStepModalModuleName,
  notifications,
])
  .component('ssoCertificateCheck', new SsoCertificateCheckComponent())
  .name;
