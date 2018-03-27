import { SsoCertificateTestComponent } from './sso-certificate-test.component';
import SsoCertificateSharedModuleName from 'modules/core/sso-certificate/shared';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import modalModuleName from 'modules/core/modal';
import notifications from 'modules/core/notifications';

export default angular.module('core.sso-certificate.sso-certificate-test', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  SsoCertificateSharedModuleName,
  multiStepModalModuleName,
  modalModuleName,
  notifications,
])
  .component('ssoCertificateTest', new SsoCertificateTestComponent())
  .name;
