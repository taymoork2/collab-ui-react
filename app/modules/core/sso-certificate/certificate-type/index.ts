import '../sso-certificate.scss';

import { CertificateTypeComponent } from './certificate-type.component';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';

export default angular.module('core.sso-certificate.certificate-type', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  multiStepModalModuleName,
])
  .component('certificateType', new CertificateTypeComponent())
  .name;
