import checkCertificateModuleName from './check-certificate';
import CertificateTypeModuleName from './certificate-type';

export default angular.module('core.sso-certificate', [
  require('angular-translate'),
  require('@collabui/collab-ui-ng').default,
  checkCertificateModuleName,
  CertificateTypeModuleName,
])
  .name;
