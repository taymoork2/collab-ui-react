import '../sso-certificate.scss';

import { CheckCertificateComponent } from './check-certificate.component';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';
import modalModuleName from 'modules/core/modal';

export default angular.module('core.sso-certificate.check-certificate', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  multiStepModalModuleName,
  modalModuleName,
])
  .component('checkCertificate', new CheckCertificateComponent())
  .name;
