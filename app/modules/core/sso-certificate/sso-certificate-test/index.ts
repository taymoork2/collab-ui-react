import { SsoCertificateTestComponent } from './sso-certificate-test.component';
import ssoCertificateSharedModuleName from 'modules/core/sso-certificate/shared';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import modalModuleName from 'modules/core/modal';
import xmlServiceModuleName from 'modules/core/shared/xml-service';
import notifications from 'modules/core/notifications';

export default angular.module('core.sso-certificate.sso-certificate-test', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  ssoCertificateSharedModuleName,
  multiStepModalModuleName,
  modalModuleName,
  xmlServiceModuleName,
  notifications,
])
  .component('ssoCertificateTest', new SsoCertificateTestComponent())
  .name;
