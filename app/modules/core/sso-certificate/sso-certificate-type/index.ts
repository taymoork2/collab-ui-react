import { SsoCertificateTypeComponent } from './sso-certificate-type.component';
import SsoCertificateSharedModuleName from 'modules/core/sso-certificate/shared';
import multiStepModalModuleName from 'modules/core/shared/multi-step-modal';

export default angular.module('core.sso-certificate.sso-certificate-type', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  SsoCertificateSharedModuleName,
  multiStepModalModuleName,
])
  .component('ssoCertificateType', new SsoCertificateTypeComponent())
  .name;
